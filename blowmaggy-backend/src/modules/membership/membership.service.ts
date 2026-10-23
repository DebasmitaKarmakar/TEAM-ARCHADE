/** MAGGY+ — ₹99/month or ₹799/year: free delivery, 10% off everything, members-only coupons, early access. */
import { MEMBERSHIP_PLANS } from '../../config/constants';
import { gateway } from '../../lib/gateway';
import { prisma } from '../../lib/prisma';
import type { AuthUser } from '../../types/express';
import { AppError } from '../../utils/AppError';
import type { MemberPlan } from '../../generated/prisma/enums';

export const plans = () =>
  Object.entries(MEMBERSHIP_PLANS).map(([plan, p]) => ({
    plan, label: p.label, amount: p.amount, days: p.days,
    benefits: ['Free delivery on every order', '10% off across all six departments', 'Members-only coupons (PLUS5)', 'Early access to sales'],
  }));

export async function status(userId: string) {
  const u = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { memberUntil: true, memberPlan: true } });
  const active = !!u.memberUntil && u.memberUntil > new Date();
  // savings so far as a member (last 30 days)
  const since = new Date(Date.now() - 30 * 86_400_000);
  const agg = await prisma.order.aggregate({
    where: { userId, createdAt: { gte: since }, status: { notIn: ['PENDING_PAYMENT', 'CANCELLED'] } },
    _sum: { memberSavings: true },
  });
  return { active, plan: u.memberPlan, memberUntil: u.memberUntil, savedLast30Days: agg._sum.memberSavings ?? 0, plans: plans() };
}

export async function subscribe(user: AuthUser, plan: MemberPlan) {
  const p = MEMBERSHIP_PLANS[plan];
  const gw = await gateway.createOrder({ amount: p.amount, receipt: `plus_${user.id.slice(-8)}_${Date.now()}`, notes: { kind: 'membership', plan } });
  const mp = await prisma.membershipPurchase.create({
    data: { userId: user.id, plan, amount: p.amount, provider: gateway.name, providerOrderId: gw.id },
  });
  return { purchaseId: mp.id, plan, amount: p.amount, currency: 'INR', provider: gateway.name, keyId: gateway.keyId, razorpayOrderId: gw.id };
}

export async function activateMembership(providerOrderId: string, providerPaymentId: string) {
  return prisma.$transaction(async (tx) => {
    const mp = await tx.membershipPurchase.findUnique({ where: { providerOrderId } });
    if (!mp) throw new AppError(404, 'Membership purchase not found');
    const moved = await tx.membershipPurchase.updateMany({
      where: { id: mp.id, status: 'CREATED' },
      data: { status: 'CAPTURED', providerPaymentId },
    });
    const user = await tx.user.findUniqueOrThrow({ where: { id: mp.userId } });
    if (moved.count === 0) return { active: true, memberUntil: user.memberUntil, plan: user.memberPlan, alreadyProcessed: true };
    const start = user.memberUntil && user.memberUntil > new Date() ? user.memberUntil : new Date();
    const memberUntil = new Date(start.getTime() + MEMBERSHIP_PLANS[mp.plan].days * 86_400_000);
    await tx.user.update({ where: { id: mp.userId }, data: { memberUntil, memberPlan: mp.plan } });
    return { active: true, memberUntil, plan: mp.plan, alreadyProcessed: false };
  });
}

export async function markMembershipFailed(providerOrderId: string) {
  await prisma.membershipPurchase.updateMany({ where: { providerOrderId, status: 'CREATED' }, data: { status: 'FAILED' } });
}
