/**
 * CHECKOUT — cart → reserved stock → PENDING_PAYMENT order → gateway order.
 *
 *  1. idempotency: same Idempotency-Key → same order back (double-click / retry safe)
 *  2. reload cart from DB and re-price on the server (client prices are never trusted)
 *  3. ONE transaction: reserve stock (sorted), consume coupon atomically, create order/items/shipments/event
 *  4. COD → placed immediately; UPI/CARD → create gateway order (outside the transaction)
 */
import { GROCERY_SLOTS, RESERVATION_TTL_MIN } from '../../config/constants';
import { gateway } from '../../lib/gateway';
import { prisma } from '../../lib/prisma';
import type { AuthUser } from '../../types/express';
import { AppError } from '../../utils/AppError';
import { makeOrderNumber } from '../../utils/ids';
import { buildCartView, findCart } from '../cart/cart.service';
import { optionsOf } from '../catalog/serialize';
import * as inventory from '../inventory/inventory.service';
import { getActiveBundles, getCouponByCode, getPricingUser } from '../pricing/context';
import { priceCart } from '../pricing/pricing';
import { cancelPendingOrderTx, markOrderPaid } from '../payment/payment.service';
import type { PaymentMethod } from '../../generated/prisma/enums';

export interface AddressInput {
  label?: string; name: string; phone: string; line1: string; line2?: string | null;
  landmark?: string | null; city: string; state: string; pincode: string;
}

export interface CheckoutInput {
  addressId?: string;
  address?: AddressInput;
  paymentMethod: PaymentMethod;
  grocerySlot?: string;
}

async function responseFor(orderId: string, user: AuthUser) {
  const o = await prisma.order.findUniqueOrThrow({ where: { id: orderId }, include: { payment: true } });
  return {
    orderId: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    amount: o.total,
    currency: 'INR',
    paymentMethod: o.paymentMethod,
    provider: o.payment?.provider ?? null,
    keyId: o.payment?.provider === 'cod' ? null : gateway.keyId,
    razorpayOrderId: o.payment?.provider === 'cod' ? null : o.payment?.providerOrderId ?? null,
    reservationExpiresAt: o.reservationExpiresAt,
    prefill: { name: user.name, email: user.email },
  };
}

const startOfTomorrow = () => { const d = new Date(); d.setUTCHours(0, 0, 0, 0); d.setUTCDate(d.getUTCDate() + 1); return d; };

export async function checkout(user: AuthUser, input: CheckoutInput, idempotencyKey: string) {
  // 1. idempotency
  const existing = await prisma.order.findUnique({ where: { idempotencyKey }, select: { id: true, userId: true } });
  if (existing) {
    if (existing.userId !== user.id) throw new AppError(409, 'Idempotency key already used', 'IDEMPOTENCY_CONFLICT');
    return responseFor(existing.id, user);
  }

  // 2. cart + server pricing
  const cart = await findCart(prisma, { userId: user.id });
  if (!cart || cart.items.length === 0) throw new AppError(400, 'Your cart is empty', 'EMPTY_CART');
  const view = await buildCartView(cart, user.id); // also fixes quantities above stock
  if (!view.canCheckout) throw new AppError(409, 'Some items in your cart are unavailable', 'CART_UNAVAILABLE', { warnings: view.warnings });
  const freshCart = (await findCart(prisma, { userId: user.id }))!;

  const address = await resolveAddress(user.id, input);
  const coupon = await getCouponByCode(prisma, freshCart.couponCode);
  const [pricingUser, bundles] = await Promise.all([getPricingUser(prisma, user.id, coupon?.id), getActiveBundles(prisma)]);
  const price = priceCart({
    lines: freshCart.items.map((i) => ({
      variantId: i.variantId,
      productId: i.variant.productId,
      departmentId: i.variant.product.departmentId,
      departmentSlug: i.variant.product.department.slug,
      unitPrice: i.variant.price,
      qty: i.qty,
    })),
    coupon,
    user: pricingUser,
    bundles,
  });
  if (price.coupon && !price.coupon.applied) {
    throw new AppError(400, price.coupon.reason ?? 'Coupon not applicable', 'COUPON_INVALID');
  }
  const itemByVariant = new Map(freshCart.items.map((i) => [i.variantId, i]));
  const slot = price.groups.some((g) => g.needsSlot)
    ? (input.grocerySlot && GROCERY_SLOTS.includes(input.grocerySlot) ? input.grocerySlot : freshCart.grocerySlot ?? GROCERY_SLOTS[0])
    : null;

  // 3. one transaction
  let orderId: string;
  try {
    orderId = await createOrderTx();
  } catch (err) {
    // two requests with the same Idempotency-Key raced: return the winner's order
    if ((err as { code?: string }).code === 'P2002') {
      const winner = await prisma.order.findUnique({ where: { idempotencyKey }, select: { id: true, userId: true } });
      if (winner && winner.userId === user.id) return responseFor(winner.id, user);
    }
    throw err;
  }

  function createOrderTx() { return prisma.$transaction(async (tx) => {
    await inventory.reserve(tx, price.lines.map((l) => ({ variantId: l.variantId, qty: l.qty })));

    if (coupon && price.coupon?.applied) {
      const used = await tx.$executeRaw`
        UPDATE "Coupon" SET "usedCount" = "usedCount" + 1
        WHERE "id" = ${coupon.id} AND ("usageLimit" IS NULL OR "usedCount" < "usageLimit")`;
      if (used === 0) throw new AppError(409, 'This coupon just ran out', 'COUPON_EXHAUSTED');
    }

    let orderNumber = makeOrderNumber();
    for (let i = 0; i < 5 && (await tx.order.findUnique({ where: { orderNumber }, select: { id: true } })); i++) orderNumber = makeOrderNumber();

    const order = await tx.order.create({
      data: {
        orderNumber,
        userId: user.id,
        status: 'PENDING_PAYMENT',
        addressSnapshot: address as object,
        subtotal: price.subtotal,
        discountTotal: price.discountTotal,
        couponCode: price.coupon?.applied ? price.coupon.code : null,
        couponDiscount: price.couponDiscount,
        memberSavings: price.memberSavings,
        deliveryFee: price.deliveryFee,
        tax: price.tax,
        total: price.total,
        paymentMethod: input.paymentMethod,
        idempotencyKey,
        reservationExpiresAt: new Date(Date.now() + RESERVATION_TTL_MIN * 60_000),
      },
    });

    for (const g of price.groups) {
      const eta = g.needsSlot ? startOfTomorrow() : new Date(Date.now() + g.etaDays * 86_400_000);
      const shipment = await tx.shipment.create({
        data: { orderId: order.id, group: g.group, status: 'PENDING_PAYMENT', slot: g.needsSlot ? slot : null, eta },
      });
      await tx.orderItem.createMany({
        data: price.lines.filter((l) => g.variantIds.includes(l.variantId)).map((l) => {
          const ci = itemByVariant.get(l.variantId)!;
          return {
            orderId: order.id,
            shipmentId: shipment.id,
            variantId: l.variantId,
            productId: l.productId,
            departmentId: l.departmentId,
            nameSnapshot: ci.variant.product.name,
            brandSnapshot: ci.variant.product.brand,
            optionsSnapshot: optionsOf(ci.variant),
            imageSnapshot: ci.variant.image ?? ci.variant.product.images[0] ?? null,
            unitPrice: l.unitPrice,
            qty: l.qty,
            lineDiscount: l.discount,
            lineTotal: l.net,
            status: 'PENDING_PAYMENT' as const,
          };
        }),
      });
    }

    if (coupon && price.coupon?.applied) {
      await tx.couponRedemption.create({ data: { couponId: coupon.id, userId: user.id, orderId: order.id, amount: price.couponDiscount } });
    }
    await tx.orderEvent.create({ data: { orderId: order.id, toStatus: 'PENDING_PAYMENT', note: `Order created · ${price.lines.length} items · ${price.groups.length} shipments` } });

    if (input.paymentMethod === 'COD') {
      await tx.payment.create({
        data: { orderId: order.id, provider: 'cod', providerOrderId: `cod_${order.orderNumber}`, method: 'COD', amount: price.total },
      });
    }
    return order.id;
  }, { timeout: 15_000 }); }

  // 4. payment
  if (input.paymentMethod === 'COD') {
    const o = await prisma.order.findUniqueOrThrow({ where: { id: orderId }, select: { orderNumber: true } });
    await markOrderPaid({ providerOrderId: `cod_${o.orderNumber}`, providerPaymentId: null, source: 'cod' });
    return responseFor(orderId, user);
  }

  try {
    const o = await prisma.order.findUniqueOrThrow({ where: { id: orderId }, select: { orderNumber: true, total: true } });
    const gw = await gateway.createOrder({ amount: o.total, receipt: o.orderNumber, notes: { orderNumber: o.orderNumber } });
    await prisma.payment.create({
      data: { orderId, provider: gateway.name, providerOrderId: gw.id, method: input.paymentMethod, amount: o.total },
    });
  } catch (err) {
    await prisma.$transaction((tx) => cancelPendingOrderTx(tx, orderId, 'Payment gateway unavailable'));
    throw err instanceof AppError ? err : new AppError(502, 'Payment gateway unavailable, please retry', 'GATEWAY_ERROR');
  }
  return responseFor(orderId, user);
}

async function resolveAddress(userId: string, input: CheckoutInput): Promise<AddressInput> {
  if (input.addressId) {
    const a = await prisma.address.findFirst({ where: { id: input.addressId, userId } });
    if (!a) throw new AppError(404, 'Address not found');
    return { label: a.label, name: a.name, phone: a.phone, line1: a.line1, line2: a.line2, landmark: a.landmark, city: a.city, state: a.state, pincode: a.pincode };
  }
  if (input.address) return { label: 'Home', ...input.address };
  const def = await prisma.address.findFirst({ where: { userId }, orderBy: { isDefault: 'desc' } });
  if (!def) throw new AppError(400, 'Please add a delivery address', 'ADDRESS_REQUIRED');
  return { label: def.label, name: def.name, phone: def.phone, line1: def.line1, line2: def.line2, landmark: def.landmark, city: def.city, state: def.state, pincode: def.pincode };
}
