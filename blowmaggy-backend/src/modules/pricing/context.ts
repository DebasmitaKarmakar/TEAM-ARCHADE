/** DB loaders that feed the pure pricing engine. */
import { cache } from '../../lib/cache';
import type { Db } from '../../lib/prisma';
import type { BundleInput, CouponInput, PricingUser } from './pricing';

export async function getCouponByCode(db: Db, code: string | null | undefined): Promise<CouponInput | null> {
  if (!code) return null;
  const c = await db.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });
  return c ? { ...c, type: c.type } : null;
}

export async function getPricingUser(db: Db, userId: string | undefined, couponId?: string): Promise<PricingUser | null> {
  if (!userId) return null;
  const [user, paidOrderCount, couponUses] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: { memberUntil: true } }),
    db.order.count({ where: { userId, status: { notIn: ['PENDING_PAYMENT', 'CANCELLED'] } } }),
    couponId ? db.couponRedemption.count({ where: { userId, couponId } }) : Promise.resolve(0),
  ]);
  return { isMember: !!user?.memberUntil && user.memberUntil > new Date(), paidOrderCount, couponUses };
}

export async function getActiveBundles(db: Db): Promise<BundleInput[]> {
  return cache.wrap('bundles:active', 60, async () => {
    const bundles = await db.bundle.findMany({ where: { isActive: true }, include: { items: true } });
    return bundles.map((b) => ({ slug: b.slug, name: b.name, discountPct: b.discountPct, productIds: b.items.map((i) => i.productId) }));
  });
}
