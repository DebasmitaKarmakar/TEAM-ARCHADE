/**
 * PAYMENTS — verify (browser callback) and webhook (gateway → server) both funnel into
 * markOrderPaid(), which is idempotent: guarded by `WHERE status = 'PENDING_PAYMENT'`.
 */
import { env } from '../../config/env';
import { gateway } from '../../lib/gateway';
import { logger } from '../../lib/logger';
import { prisma, type Tx } from '../../lib/prisma';
import type { AuthUser } from '../../types/express';
import { AppError } from '../../utils/AppError';
import * as inventory from '../inventory/inventory.service';
import { activateMembership, markMembershipFailed } from '../membership/membership.service';
import { sendOrderReceipt } from '../notification/receipt';
import { afterCommit } from '../order/order.events';

const stockLines = (items: { variantId: string; qty: number }[]) => items.map((i) => ({ variantId: i.variantId, qty: i.qty }));

/** Move a PENDING_PAYMENT order to PLACED, commit stock, clear purchased items from the cart. */
export async function markOrderPaid(input: {
  providerOrderId: string;
  providerPaymentId: string | null;
  amount?: number;
  source: 'verify' | 'webhook' | 'cod' | 'seed';
}) {
  const result = await prisma.$transaction(async (tx) => {
    const pay = await tx.payment.findUnique({
      where: { providerOrderId: input.providerOrderId },
      include: { order: { include: { items: true } } },
    });
    if (!pay) throw new AppError(404, 'Payment not found');
    const order = pay.order;
    if (input.amount !== undefined && input.amount !== order.total) {
      throw new AppError(400, 'Paid amount does not match order total', 'AMOUNT_MISMATCH');
    }

    const moved = await tx.order.updateMany({
      where: { id: order.id, status: 'PENDING_PAYMENT' },
      data: { status: 'PLACED', reservationExpiresAt: null },
    });
    if (moved.count === 0) {
      return { orderId: order.id, orderNumber: order.orderNumber, alreadyProcessed: true, lateForCancelled: order.status === 'CANCELLED' && pay.status !== 'REFUNDED' && input.source !== 'cod', paymentId: pay.id };
    }

    const isCod = input.source === 'cod';
    await tx.payment.update({
      where: { id: pay.id },
      data: { status: isCod ? 'CREATED' : 'CAPTURED', providerPaymentId: input.providerPaymentId ?? undefined },
    });
    await inventory.commit(tx, stockLines(order.items), order.id);
    for (const it of order.items) {
      await tx.product.update({ where: { id: it.productId }, data: { soldCount: { increment: it.qty } } });
    }
    await tx.shipment.updateMany({ where: { orderId: order.id }, data: { status: 'PLACED' } });
    await tx.orderItem.updateMany({ where: { orderId: order.id }, data: { status: 'PLACED' } });
    await tx.cartItem.deleteMany({ where: { cart: { userId: order.userId }, variantId: { in: order.items.map((i) => i.variantId) } } });
    await tx.cart.updateMany({ where: { userId: order.userId }, data: { couponCode: null } });
    await tx.orderEvent.create({
      data: {
        orderId: order.id, fromStatus: 'PENDING_PAYMENT', toStatus: 'PLACED',
        note: isCod ? 'Order placed — Cash on Delivery' : `Payment captured (${input.source})`,
      },
    });
    return { orderId: order.id, orderNumber: order.orderNumber, alreadyProcessed: false, lateForCancelled: false, paymentId: pay.id, variantIds: order.items.map((i) => i.variantId) };
  });

  if (!result.alreadyProcessed && input.source !== 'seed') {
    afterCommit('receipt', () => sendOrderReceipt(result.orderId));
    afterCommit('low-stock', () => inventory.checkLowStock(result.variantIds ?? []));
  }
  if (result.lateForCancelled && input.providerPaymentId) {
    // Payment arrived after the reservation expired → refund automatically.
    afterCommit('late-refund', () => refundLatePayment(result.paymentId, input.providerPaymentId!));
  }
  return result;
}

async function refundLatePayment(paymentId: string, providerPaymentId: string) {
  const pay = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!pay || pay.status === 'REFUNDED') return;
  await gateway.refund(providerPaymentId, pay.amount);
  await prisma.payment.update({ where: { id: paymentId }, data: { status: 'REFUNDED', refundedAmount: pay.amount, providerPaymentId } });
  await prisma.orderEvent.create({ data: { orderId: pay.orderId, toStatus: 'CANCELLED', note: 'Late payment refunded automatically' } });
  logger.warn({ paymentId }, 'late payment refunded');
}

/** Cancel an order that never got paid: release holds, give coupon back. */
export async function cancelPendingOrderTx(tx: Tx, orderId: string, note: string, actorId?: string, paymentStatus: 'FAILED' | 'CREATED' = 'FAILED') {
  const moved = await tx.order.updateMany({
    where: { id: orderId, status: 'PENDING_PAYMENT' },
    data: { status: 'CANCELLED', reservationExpiresAt: null },
  });
  if (moved.count === 0) return false;
  const order = await tx.order.findUniqueOrThrow({ where: { id: orderId }, include: { items: true, redemption: true } });
  await inventory.release(tx, stockLines(order.items));
  await releaseCoupon(tx, order.id);
  await tx.shipment.updateMany({ where: { orderId }, data: { status: 'CANCELLED' } });
  await tx.orderItem.updateMany({ where: { orderId }, data: { status: 'CANCELLED' } });
  await tx.payment.updateMany({ where: { orderId }, data: { status: paymentStatus } });
  await tx.orderEvent.create({ data: { orderId, fromStatus: 'PENDING_PAYMENT', toStatus: 'CANCELLED', note, actorId } });
  return true;
}

export async function releaseCoupon(tx: Tx, orderId: string) {
  const red = await tx.couponRedemption.findUnique({ where: { orderId } });
  if (!red) return;
  await tx.$executeRaw`UPDATE "Coupon" SET "usedCount" = GREATEST("usedCount" - 1, 0) WHERE "id" = ${red.couponId}`;
  await tx.couponRedemption.delete({ where: { id: red.id } });
}

export async function markPaymentFailed(providerOrderId: string, reason: string) {
  const pay = await prisma.payment.findUnique({ where: { providerOrderId } });
  if (!pay) return false;
  return prisma.$transaction((tx) => cancelPendingOrderTx(tx, pay.orderId, `Payment failed: ${reason}`));
}

/** Browser callback after the Razorpay popup (or the mock sheet). */
export async function verifyPayment(user: AuthUser, body: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
  const pay = await prisma.payment.findUnique({ where: { providerOrderId: body.razorpay_order_id }, include: { order: true } });
  if (pay && pay.order.userId === user.id) {
    // Demo helper: simulate a failed payment in mock mode.
    if (gateway.name === 'mock' && body.razorpay_signature === 'mock-fail') {
      await markPaymentFailed(body.razorpay_order_id, 'declined (mock)');
      throw new AppError(402, 'Payment failed — try again or use another method', 'PAYMENT_FAILED');
    }
    const ok = gateway.verifySignature({ orderId: body.razorpay_order_id, paymentId: body.razorpay_payment_id, signature: body.razorpay_signature });
    if (!ok) throw new AppError(400, 'Payment signature is invalid', 'BAD_SIGNATURE');
    const r = await markOrderPaid({ providerOrderId: body.razorpay_order_id, providerPaymentId: body.razorpay_payment_id, source: 'verify' });
    const order = await prisma.order.findUniqueOrThrow({ where: { id: r.orderId }, select: { orderNumber: true, status: true, total: true } });
    if (order.status === 'CANCELLED') throw new AppError(409, 'This order expired before payment; your payment will be refunded', 'ORDER_EXPIRED');
    return order;
  }

  // Maybe it's a Maggy+ purchase
  const mp = await prisma.membershipPurchase.findUnique({ where: { providerOrderId: body.razorpay_order_id } });
  if (mp && mp.userId === user.id) {
    if (gateway.name === 'mock' && body.razorpay_signature === 'mock-fail') {
      await markMembershipFailed(mp.providerOrderId);
      throw new AppError(402, 'Payment failed', 'PAYMENT_FAILED');
    }
    const ok = gateway.verifySignature({ orderId: body.razorpay_order_id, paymentId: body.razorpay_payment_id, signature: body.razorpay_signature });
    if (!ok) throw new AppError(400, 'Payment signature is invalid', 'BAD_SIGNATURE');
    return activateMembership(mp.providerOrderId, body.razorpay_payment_id);
  }
  throw new AppError(404, 'Payment not found');
}

interface RazorpayWebhook {
  event: string;
  payload?: { payment?: { entity?: { id: string; order_id: string; amount: number; error_description?: string } } };
}

/** Razorpay webhook (raw body). Always fast; dedupes by event id. */
export async function handleWebhook(rawBody: Buffer, signature: string | undefined, eventId: string | undefined) {
  if (!gateway.verifyWebhook(rawBody, signature)) throw new AppError(400, 'Invalid webhook signature', 'BAD_SIGNATURE');
  let evt: RazorpayWebhook;
  try { evt = JSON.parse(rawBody.toString('utf8')); } catch { throw new AppError(400, 'Bad JSON'); }

  const id = eventId ?? `${evt.event}:${evt.payload?.payment?.entity?.id ?? 'unknown'}`;
  const fresh = await prisma.webhookEvent.createMany({ data: [{ id, type: evt.event }], skipDuplicates: true });
  if (fresh.count === 0) return { duplicate: true };

  const p = evt.payload?.payment?.entity;
  if (!p) return { ignored: true };
  const isMembership = await prisma.membershipPurchase.findUnique({ where: { providerOrderId: p.order_id } });

  if (evt.event === 'payment.captured') {
    if (isMembership) await activateMembership(p.order_id, p.id);
    else await markOrderPaid({ providerOrderId: p.order_id, providerPaymentId: p.id, amount: p.amount, source: 'webhook' });
  } else if (evt.event === 'payment.failed') {
    if (isMembership) await markMembershipFailed(p.order_id);
    else await markPaymentFailed(p.order_id, p.error_description ?? 'failed');
  } else {
    logger.info({ event: evt.event }, 'webhook event ignored');
  }
  return { ok: true };
}

/** Refund part or all of a captured payment (cancellations, returns, admin refunds). */
export async function refundPayment(orderId: string, amount: number, note: string, actorId?: string) {
  if (amount <= 0) return { refunded: 0 };
  const pay = await prisma.payment.findUnique({ where: { orderId } });
  if (!pay) throw new AppError(404, 'Payment not found');
  if (pay.provider === 'cod' && pay.status !== 'CAPTURED') return { refunded: 0, note: 'COD not collected — nothing to refund' };
  if (pay.status !== 'CAPTURED' && pay.status !== 'PARTIALLY_REFUNDED') throw new AppError(409, 'Payment is not refundable');
  const refundable = pay.amount - pay.refundedAmount;
  const amt = Math.min(amount, refundable);
  if (amt <= 0) throw new AppError(409, 'Already fully refunded');
  if (pay.provider !== 'cod' && pay.providerPaymentId) await gateway.refund(pay.providerPaymentId, amt);
  const refundedAmount = pay.refundedAmount + amt;
  await prisma.payment.update({
    where: { id: pay.id },
    data: { refundedAmount, status: refundedAmount >= pay.amount ? 'REFUNDED' : 'PARTIALLY_REFUNDED' },
  });
  const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId }, select: { status: true } });
  await prisma.orderEvent.create({ data: { orderId, toStatus: order.status, actorId, note: `${note} — refunded ₹${(amt / 100).toFixed(2)}` } });
  return { refunded: amt };
}

export const paymentModeInfo = () => ({ mode: env.PAYMENT_MODE, keyId: gateway.keyId });
