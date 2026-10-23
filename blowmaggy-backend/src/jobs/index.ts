import cron from 'node-cron';
import { logger } from '../lib/logger';
import { sendMail } from '../lib/mailer';
import { prisma } from '../lib/prisma';
import { cancelPendingOrderTx } from '../modules/payment/payment.service';
import { rebuildCoPurchase } from '../modules/recommend/recommend.service';

/** Every minute: orders still unpaid after the 10-minute hold → cancel + release stock & coupon. */
export async function releaseExpiredReservations() {
  const expired = await prisma.order.findMany({
    where: { status: 'PENDING_PAYMENT', reservationExpiresAt: { lt: new Date() } },
    select: { id: true }, take: 200,
  });
  let n = 0;
  for (const o of expired) {
    if (await prisma.$transaction((tx) => cancelPendingOrderTx(tx, o.id, 'Payment timed out — stock released'))) n++;
  }
  if (n) logger.info({ released: n }, 'expired reservations released');
  return n;
}

/** Hourly: email each manager/admin a digest of low-stock SKUs in their scope. */
export async function lowStockDigest() {
  const low = await prisma.$queryRaw<{ sku: string; name: string; available: number; departmentId: string }[]>`
    SELECT v."sku", p."name", (v."stock" - v."reserved")::int AS available, p."departmentId"
    FROM "Variant" v JOIN "Product" p ON p."id" = v."productId"
    WHERE v."isActive" AND p."isActive" AND v."stock" - v."reserved" <= v."lowStockAt"
    ORDER BY available`;
  if (!low.length) return 0;
  const staff = await prisma.user.findMany({ where: { role: { in: ['ADMIN', 'DEPT_MANAGER'] } }, select: { email: true, role: true, departmentId: true } });
  for (const s of staff) {
    const mine = s.role === 'ADMIN' ? low : low.filter((l) => l.departmentId === s.departmentId);
    if (!mine.length) continue;
    const rows = mine.map((l) => `<tr><td>${l.sku}</td><td>${l.name}</td><td>${l.available}</td></tr>`).join('');
    await sendMail({ to: s.email, subject: `Blowmaggy: ${mine.length} low-stock SKUs`, html: `<h2>Low stock</h2><table border="1" cellpadding="6">${rows}</table>` });
  }
  return low.length;
}

export function startJobs() {
  const safe = (name: string, fn: () => Promise<unknown>) => () => { fn().catch((err) => logger.error({ err, job: name }, 'job failed')); };
  cron.schedule('* * * * *', safe('releaseExpiredReservations', releaseExpiredReservations));
  cron.schedule('0 * * * *', safe('lowStockDigest', lowStockDigest));
  cron.schedule('0 2 * * *', safe('rebuildCoPurchase', rebuildCoPurchase), { timezone: 'Asia/Kolkata' });
  logger.info('cron jobs scheduled (reservations: 1 min · low-stock digest: hourly · co-purchase: 02:00 IST)');
}
