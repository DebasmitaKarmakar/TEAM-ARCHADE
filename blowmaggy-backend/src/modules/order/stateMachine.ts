import type { OrderStatus } from '../../generated/prisma/enums';
import { AppError } from '../../utils/AppError';

/** Allowed transitions for a SHIPMENT (and the order derived from it). */
export const NEXT: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: ['PLACED', 'CANCELLED'],
  PLACED: ['PACKED', 'CANCELLED'],
  PACKED: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED: ['RETURN_REQUESTED'],
  RETURN_REQUESTED: ['RETURNED'],
  CANCELLED: [],
  RETURNED: [],
};

export const canTransition = (from: OrderStatus, to: OrderStatus) => NEXT[from].includes(to);

export function assertTransition(from: OrderStatus, to: OrderStatus) {
  if (!canTransition(from, to)) throw new AppError(409, `Cannot move from ${from} to ${to}`, 'BAD_TRANSITION');
}

export const FLOW: OrderStatus[] = ['PLACED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
const rank = (s: OrderStatus) => {
  const i = FLOW.indexOf(s);
  if (i >= 0) return i;
  if (s === 'RETURN_REQUESTED' || s === 'RETURNED') return FLOW.length - 1; // counts as delivered for order progress
  return -1; // PENDING_PAYMENT
};

/** Order status = least-advanced active (non-cancelled) shipment. */
export function deriveOrderStatus(shipmentStatuses: OrderStatus[]): OrderStatus {
  const active = shipmentStatuses.filter((s) => s !== 'CANCELLED');
  if (active.length === 0) return 'CANCELLED';
  if (active.includes('PENDING_PAYMENT')) return 'PENDING_PAYMENT';
  const min = Math.min(...active.map(rank));
  return FLOW[Math.max(0, min)];
}

/** The next "forward" step for the admin "Advance" button. */
export const nextForward = (s: OrderStatus): OrderStatus | null => {
  const i = FLOW.indexOf(s);
  return i >= 0 && i < FLOW.length - 1 ? FLOW[i + 1] : null;
};
