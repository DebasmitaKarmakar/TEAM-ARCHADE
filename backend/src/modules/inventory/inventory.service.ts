/**
 * INVENTORY — reserve → commit → release.  available = stock − reserved
 * Every change is a single conditional UPDATE, so two shoppers can never buy the same last unit.
 * Always process variants sorted by id inside a transaction → no deadlocks between checkouts.
 */
import type { Db } from '../../lib/prisma';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/AppError';
import { notifyStaff } from '../notification/notification.service';
import type { StockReason } from '../../generated/prisma/enums';

export interface StockLine { variantId: string; qty: number }

const sorted = (lines: StockLine[]) => {
  // merge duplicates, then sort by id
  const m = new Map<string, number>();
  for (const l of lines) m.set(l.variantId, (m.get(l.variantId) ?? 0) + l.qty);
  return [...m.entries()].map(([variantId, qty]) => ({ variantId, qty })).sort((a, b) => a.variantId.localeCompare(b.variantId));
};

/** Hold stock for a pending checkout. Throws 409 OUT_OF_STOCK (whole transaction rolls back). */
export async function reserve(tx: Db, lines: StockLine[]) {
  for (const { variantId, qty } of sorted(lines)) {
    const n = await tx.$executeRaw`
      UPDATE "Variant" SET "reserved" = "reserved" + ${qty}
      WHERE "id" = ${variantId} AND "isActive" = true AND "stock" - "reserved" >= ${qty}`;
    if (n === 0) {
      const v = await tx.variant.findUnique({ where: { id: variantId }, select: { stock: true, reserved: true, sku: true } });
      throw new AppError(409, 'Some items just sold out', 'OUT_OF_STOCK', {
        variantId, sku: v?.sku, requested: qty, available: v ? Math.max(0, v.stock - v.reserved) : 0,
      });
    }
  }
}

/** Payment captured: reserved units leave the shelf. */
export async function commit(tx: Db, lines: StockLine[], refId: string) {
  for (const { variantId, qty } of sorted(lines)) {
    await tx.$executeRaw`
      UPDATE "Variant" SET "stock" = "stock" - ${qty}, "reserved" = "reserved" - ${qty} WHERE "id" = ${variantId}`;
    await tx.stockMovement.create({ data: { variantId, delta: -qty, reason: 'SALE', refId } });
  }
}

/** Payment failed / timed out / cancelled before payment: give the hold back. */
export async function release(tx: Db, lines: StockLine[]) {
  for (const { variantId, qty } of sorted(lines)) {
    await tx.$executeRaw`
      UPDATE "Variant" SET "reserved" = GREATEST("reserved" - ${qty}, 0) WHERE "id" = ${variantId}`;
  }
}

/** Cancel after payment or a completed return: units go back on the shelf. */
export async function restock(tx: Db, lines: StockLine[], reason: StockReason, refId?: string, actorId?: string) {
  for (const { variantId, qty } of sorted(lines)) {
    await tx.$executeRaw`UPDATE "Variant" SET "stock" = "stock" + ${qty} WHERE "id" = ${variantId}`;
    await tx.stockMovement.create({ data: { variantId, delta: qty, reason, refId, actorId } });
  }
}

/** Admin stock edit. Either a delta (+20 restock) or an absolute value. DB CHECK keeps stock ≥ reserved. */
export async function adjust(variantId: string, change: { delta?: number; stock?: number; reason?: StockReason }, actorId: string) {
  return prisma.$transaction(async (tx) => {
    const v = await tx.variant.findUnique({ where: { id: variantId } });
    if (!v) throw new AppError(404, 'Variant not found');
    const target = change.stock ?? v.stock + (change.delta ?? 0);
    if (target < v.reserved) throw new AppError(409, `Stock can't go below reserved units (${v.reserved})`);
    const delta = target - v.stock;
    const updated = await tx.variant.update({ where: { id: variantId }, data: { stock: target } });
    if (delta !== 0) {
      await tx.stockMovement.create({
        data: { variantId, delta, reason: change.reason ?? (delta > 0 ? 'RESTOCK' : 'ADJUST'), actorId },
      });
    }
    return updated;
  });
}

/** After a sale: alert managers + admins about variants at/below their threshold. */
export async function checkLowStock(variantIds: string[]) {
  if (variantIds.length === 0) return;
  const low = await prisma.$queryRaw<{ id: string; sku: string; available: number; name: string; departmentId: string }[]>`
    SELECT v."id", v."sku", (v."stock" - v."reserved")::int AS available, p."name", p."departmentId"
    FROM "Variant" v JOIN "Product" p ON p."id" = v."productId"
    WHERE v."id" = ANY(${variantIds}) AND v."stock" - v."reserved" <= v."lowStockAt"`;
  for (const v of low) {
    await notifyStaff(v.departmentId, {
      type: 'LOW_STOCK',
      title: `Low stock: ${v.name}`,
      body: `${v.sku} has ${v.available} left`,
      link: `/admin/inventory?variant=${v.id}`,
    });
  }
}
