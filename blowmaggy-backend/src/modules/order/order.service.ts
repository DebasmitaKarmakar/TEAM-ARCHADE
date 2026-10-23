/** ORDERS — tracking view, cancel, return, shipment status changes, refunds. */
import { RETURN_WINDOW_DAYS } from '../../config/constants';
import { SHIPMENT_RULES } from '../../config/shipping';
import { prisma, type Tx } from '../../lib/prisma';
import type { AuthUser } from '../../types/express';
import { AppError } from '../../utils/AppError';
import { randomToken } from '../../utils/ids';
import * as inventory from '../inventory/inventory.service';
import { cancelPendingOrderTx, refundPayment, releaseCoupon } from '../payment/payment.service';
import { assertTransition, deriveOrderStatus, FLOW, nextForward } from './stateMachine';
import type { OrderStatus } from '../../generated/prisma/enums';

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'Awaiting payment', PLACED: 'Placed', PACKED: 'Packed', SHIPPED: 'Shipped',
  OUT_FOR_DELIVERY: 'Out for delivery', DELIVERED: 'Delivered', CANCELLED: 'Cancelled',
  RETURN_REQUESTED: 'Return requested', RETURNED: 'Returned',
};

export const orderInclude = {
  items: { orderBy: { nameSnapshot: 'asc' as const } },
  shipments: { include: { items: true }, orderBy: { eta: 'asc' as const } },
  events: { orderBy: { createdAt: 'asc' as const } },
  payment: true,
  user: { select: { id: true, name: true, email: true, phone: true } },
};

type FullOrder = NonNullable<Awaited<ReturnType<typeof loadOrder>>>;

const loadOrder = (where: { id?: string; orderNumber?: string }) =>
  prisma.order.findFirst({ where, include: orderInclude });

export async function orderView(o: FullOrder) {
  const depts = await prisma.department.findMany({ select: { id: true, slug: true, name: true, accentHex: true } });
  const deptById = new Map(depts.map((d) => [d.id, d]));
  const shippedOrBeyond = (s: OrderStatus) => ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RETURN_REQUESTED', 'RETURNED'].includes(s);

  const itemView = (i: FullOrder['items'][number]) => ({
    id: i.id, productId: i.productId, variantId: i.variantId, name: i.nameSnapshot, brand: i.brandSnapshot,
    options: i.optionsSnapshot, image: i.imageSnapshot, unitPrice: i.unitPrice, qty: i.qty,
    discount: i.lineDiscount, lineTotal: i.lineTotal, status: i.status, statusLabel: STATUS_LABEL[i.status],
    department: deptById.get(i.departmentId) ?? null,
  });

  const shipments = o.shipments.map((s) => {
    const rule = SHIPMENT_RULES.find((r) => r.group === s.group);
    const events = o.events.filter((e) => e.shipmentId === s.id || (e.shipmentId === null && e.toStatus === 'PLACED'));
    const reached = (st: OrderStatus) => {
      const e = [...events].reverse().find((ev) => ev.toStatus === st);
      return e?.createdAt ?? null;
    };
    const currentIdx = FLOW.indexOf(s.status === 'RETURN_REQUESTED' || s.status === 'RETURNED' ? 'DELIVERED' : s.status);
    return {
      id: s.id,
      group: s.group,
      label: rule?.label ?? s.group,
      status: s.status,
      statusLabel: STATUS_LABEL[s.status],
      eta: s.eta,
      slot: s.slot,
      trackingNo: s.trackingNo,
      deliveredAt: s.deliveredAt,
      steps: FLOW.map((st, idx) => ({
        status: st,
        label: STATUS_LABEL[st],
        at: reached(st),
        done: s.status !== 'CANCELLED' && currentIdx >= idx,
        current: s.status !== 'CANCELLED' && currentIdx === idx,
      })),
      items: s.items.map((i) => itemView(i)),
      canCancel: ['PENDING_PAYMENT', 'PLACED', 'PACKED'].includes(s.status),
      canReturn: s.status === 'DELIVERED' && !!s.deliveredAt && Date.now() - s.deliveredAt.getTime() < RETURN_WINDOW_DAYS * 86_400_000,
    };
  });

  return {
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    statusLabel: STATUS_LABEL[o.status],
    createdAt: o.createdAt,
    customer: o.user,
    address: o.addressSnapshot,
    paymentMethod: o.paymentMethod,
    payment: o.payment && {
      provider: o.payment.provider, status: o.payment.status, providerPaymentId: o.payment.providerPaymentId,
      providerOrderId: o.payment.providerOrderId, amount: o.payment.amount, refundedAmount: o.payment.refundedAmount,
    },
    totals: {
      subtotal: o.subtotal, discountTotal: o.discountTotal, couponCode: o.couponCode, couponDiscount: o.couponDiscount,
      memberSavings: o.memberSavings, deliveryFee: o.deliveryFee, tax: o.tax, total: o.total,
    },
    departments: [...new Set(o.items.map((i) => deptById.get(i.departmentId)?.slug).filter(Boolean))],
    shipments,
    timeline: o.events.map((e) => ({ at: e.createdAt, from: e.fromStatus, to: e.toStatus, label: STATUS_LABEL[e.toStatus], note: e.note, shipmentId: e.shipmentId, actorId: e.actorId })),
    canCancel: o.status !== 'CANCELLED' && shipments.some((s) => s.canCancel),
    canReturn: shipments.some((s) => s.canReturn),
    hasShipped: shipments.some((s) => shippedOrBeyond(s.status)),
    reservationExpiresAt: o.reservationExpiresAt,
  };
}

export async function listMyOrders(userId: string, page: number, limit: number) {
  const where = { userId, NOT: { status: 'PENDING_PAYMENT' as const } };
  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit,
      include: { items: { select: { nameSnapshot: true, imageSnapshot: true, departmentId: true, qty: true } }, shipments: { select: { status: true, group: true } } },
    }),
  ]);
  const depts = await prisma.department.findMany({ select: { id: true, slug: true } });
  const slug = new Map(depts.map((d) => [d.id, d.slug]));
  return {
    total,
    orders: orders.map((o) => ({
      id: o.id, orderNumber: o.orderNumber, status: o.status, statusLabel: STATUS_LABEL[o.status], createdAt: o.createdAt,
      total: o.total, paymentMethod: o.paymentMethod,
      itemCount: o.items.reduce((a, i) => a + i.qty, 0),
      departments: [...new Set(o.items.map((i) => slug.get(i.departmentId)))],
      thumbnails: o.items.slice(0, 4).map((i) => i.imageSnapshot),
      shipments: o.shipments,
    })),
  };
}

export async function getMyOrder(userId: string, orderNumber: string) {
  const o = await loadOrder({ orderNumber });
  // 404 (not 403) so order numbers can't be probed
  if (!o || o.userId !== userId) throw new AppError(404, 'Order not found');
  return orderView(o);
}

export async function getOrderById(id: string) {
  const o = await loadOrder({ id });
  if (!o) throw new AppError(404, 'Order not found');
  return o;
}

async function syncOrderStatus(tx: Tx, orderId: string) {
  const ships = await tx.shipment.findMany({ where: { orderId }, select: { status: true } });
  const status = deriveOrderStatus(ships.map((s) => s.status));
  await tx.order.update({ where: { id: orderId }, data: { status } });
  return status;
}

/**
 * Cancel items (or the whole order) before they ship.
 * Paid orders: restock + refund the items' net amount (+ delivery fee if everything is cancelled).
 */
export async function cancelOrder(actor: AuthUser, orderId: string, itemIds?: string[], reason = 'Cancelled by customer') {
  const o = await getOrderById(orderId);
  if (o.status === 'CANCELLED') throw new AppError(409, 'Order is already cancelled');

  if (o.status === 'PENDING_PAYMENT') {
    await prisma.$transaction((tx) => cancelPendingOrderTx(tx, o.id, reason, actor.id, 'FAILED'));
    return getOrderById(o.id).then(orderView);
  }

  const cancellableShipments = new Set(o.shipments.filter((s) => ['PLACED', 'PACKED'].includes(s.status)).map((s) => s.id));
  const target = o.items.filter((i) =>
    (!itemIds || itemIds.includes(i.id)) && i.status !== 'CANCELLED' && i.shipmentId && cancellableShipments.has(i.shipmentId));
  if (target.length === 0) throw new AppError(409, 'Nothing to cancel — items may have already shipped', 'NOT_CANCELLABLE');

  const remainingActive = o.items.filter((i) => i.status !== 'CANCELLED' && !target.some((t) => t.id === i.id));
  const everythingCancelled = remainingActive.length === 0;
  const refundAmount = target.reduce((a, i) => a + i.lineTotal, 0) + (everythingCancelled ? o.deliveryFee : 0);

  await prisma.$transaction(async (tx) => {
    await tx.orderItem.updateMany({ where: { id: { in: target.map((t) => t.id) } }, data: { status: 'CANCELLED' } });
    await inventory.restock(tx, target.map((t) => ({ variantId: t.variantId, qty: t.qty })), 'CANCEL', o.id, actor.id);
    for (const t of target) await tx.product.update({ where: { id: t.productId }, data: { soldCount: { decrement: t.qty } } });
    for (const sid of new Set(target.map((t) => t.shipmentId!))) {
      const left = await tx.orderItem.count({ where: { shipmentId: sid, status: { not: 'CANCELLED' } } });
      if (left === 0) {
        const s = await tx.shipment.update({ where: { id: sid }, data: { status: 'CANCELLED' } });
        await tx.orderEvent.create({ data: { orderId: o.id, shipmentId: s.id, toStatus: 'CANCELLED', actorId: actor.id, note: reason } });
      }
    }
    if (everythingCancelled) await releaseCoupon(tx, o.id);
    const status = await syncOrderStatus(tx, o.id);
    await tx.orderEvent.create({
      data: { orderId: o.id, toStatus: status === 'CANCELLED' ? 'CANCELLED' : status, actorId: actor.id, note: `${reason}: ${target.map((t) => t.nameSnapshot).join(', ')}` },
    });
  });
  await refundPayment(o.id, refundAmount, 'Cancellation', actor.id);
  return getOrderById(o.id).then(orderView);
}

export async function requestReturn(user: AuthUser, orderNumber: string, itemIds: string[], reason: string) {
  const o = await loadOrder({ orderNumber });
  if (!o || o.userId !== user.id) throw new AppError(404, 'Order not found');
  const delivered = new Map(o.shipments.filter((s) => s.status === 'DELIVERED' && s.deliveredAt).map((s) => [s.id, s.deliveredAt!]));
  const target = o.items.filter((i) => itemIds.includes(i.id) && i.shipmentId && delivered.has(i.shipmentId) && i.status === 'DELIVERED');
  if (target.length === 0) throw new AppError(409, 'These items are not eligible for return', 'NOT_RETURNABLE');
  for (const t of target) {
    if (Date.now() - delivered.get(t.shipmentId!)!.getTime() > RETURN_WINDOW_DAYS * 86_400_000)
      throw new AppError(409, `Return window (${RETURN_WINDOW_DAYS} days) has closed for ${t.nameSnapshot}`, 'RETURN_WINDOW_CLOSED');
  }
  await prisma.$transaction(async (tx) => {
    await tx.orderItem.updateMany({ where: { id: { in: target.map((t) => t.id) } }, data: { status: 'RETURN_REQUESTED' } });
    await tx.orderEvent.create({ data: { orderId: o.id, toStatus: 'RETURN_REQUESTED', actorId: user.id, note: `Return requested (${reason}): ${target.map((t) => t.nameSnapshot).join(', ')}` } });
  });
  return getOrderById(o.id).then(orderView);
}

/** Staff: approve & receive a return → restock + refund. */
export async function completeReturn(actor: AuthUser, orderId: string, itemIds?: string[]) {
  const o = await getOrderById(orderId);
  const target = o.items.filter((i) => i.status === 'RETURN_REQUESTED' && (!itemIds || itemIds.includes(i.id)));
  if (target.length === 0) throw new AppError(409, 'No pending returns on this order');
  assertStaffDept(actor, target.map((t) => t.departmentId));
  await prisma.$transaction(async (tx) => {
    await tx.orderItem.updateMany({ where: { id: { in: target.map((t) => t.id) } }, data: { status: 'RETURNED' } });
    await inventory.restock(tx, target.map((t) => ({ variantId: t.variantId, qty: t.qty })), 'RETURN', o.id, actor.id);
    await tx.orderEvent.create({ data: { orderId: o.id, toStatus: 'RETURNED', actorId: actor.id, note: `Return received: ${target.map((t) => t.nameSnapshot).join(', ')}` } });
  });
  await refundPayment(o.id, target.reduce((a, i) => a + i.lineTotal, 0), 'Return', actor.id);
  return getOrderById(o.id).then(orderView);
}

function assertStaffDept(actor: AuthUser, departmentIds: string[]) {
  if (actor.role === 'DEPT_MANAGER' && !departmentIds.includes(actor.deptId ?? '')) {
    throw new AppError(403, 'Outside your department');
  }
}

/** Staff: move a shipment along Placed → Packed → Shipped → Out for delivery → Delivered (or Cancel). */
export async function advanceShipment(actor: AuthUser, shipmentId: string, to?: OrderStatus, note?: string) {
  const s = await prisma.shipment.findUnique({ where: { id: shipmentId }, include: { items: true, order: { include: { payment: true } } } });
  if (!s) throw new AppError(404, 'Shipment not found');
  assertStaffDept(actor, s.items.map((i) => i.departmentId));
  const target = to ?? nextForward(s.status);
  if (!target) throw new AppError(409, `Shipment is already ${STATUS_LABEL[s.status]}`, 'BAD_TRANSITION');
  assertTransition(s.status, target);

  if (target === 'CANCELLED') {
    return cancelOrder(actor, s.orderId, s.items.filter((i) => i.status !== 'CANCELLED').map((i) => i.id), note ?? 'Cancelled by store');
  }

  await prisma.$transaction(async (tx) => {
    const moved = await tx.shipment.updateMany({
      where: { id: s.id, status: s.status },
      data: {
        status: target,
        ...(target === 'SHIPPED' ? { trackingNo: `BMX${randomToken(6).toUpperCase().replace(/[^A-Z0-9]/g, '7')}` } : {}),
        ...(target === 'DELIVERED' ? { deliveredAt: new Date() } : {}),
      },
    });
    if (moved.count === 0) throw new AppError(409, 'Shipment changed meanwhile — refresh', 'STALE');
    await tx.orderItem.updateMany({
      where: { shipmentId: s.id, status: { notIn: ['CANCELLED', 'RETURN_REQUESTED', 'RETURNED'] } },
      data: { status: target },
    });
    await tx.orderEvent.create({
      data: { orderId: s.orderId, shipmentId: s.id, fromStatus: s.status, toStatus: target, actorId: actor.id, note: note ?? `${STATUS_LABEL[target]}` },
    });
    const orderStatus = await syncOrderStatus(tx, s.orderId);
    // COD is collected when the whole order is delivered
    if (orderStatus === 'DELIVERED' && s.order.payment?.provider === 'cod' && s.order.payment.status === 'CREATED') {
      await tx.payment.update({ where: { id: s.order.payment.id }, data: { status: 'CAPTURED' } });
    }
  });
  return getOrderById(s.orderId).then(orderView);
}
