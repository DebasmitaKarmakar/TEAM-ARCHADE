/** Admin cockpit KPIs & charts. Department managers are automatically scoped to their department. */
import { Prisma } from '../../generated/prisma/client';
import { cache } from '../../lib/cache';
import { prisma } from '../../lib/prisma';

const PAID = Prisma.sql`o."status" NOT IN ('PENDING_PAYMENT', 'CANCELLED')`;

export async function dashboardStats(opts: { days: number; deptId?: string }) {
  const key = `stats:${opts.days}:${opts.deptId ?? 'all'}`;
  return cache.wrap(key, 30, async () => {
    const since = new Date(Date.now() - opts.days * 86_400_000);
    const prevSince = new Date(Date.now() - 2 * opts.days * 86_400_000);
    const IST = 330 * 60_000;
    const todayStart = new Date(Math.floor((Date.now() + IST) / 86_400_000) * 86_400_000 - IST); // 00:00 IST today
    const dept = opts.deptId ? Prisma.sql`AND oi."departmentId" = ${opts.deptId}` : Prisma.empty;
    const deptV = opts.deptId ? Prisma.sql`AND p."departmentId" = ${opts.deptId}` : Prisma.empty;

    const revenueBetween = (from: Date, to: Date) => prisma.$queryRaw<{ revenue: number; orders: number }[]>`
      SELECT COALESCE(SUM(oi."lineTotal"), 0)::int AS revenue, COUNT(DISTINCT o."id")::int AS orders
      FROM "OrderItem" oi JOIN "Order" o ON o."id" = oi."orderId"
      WHERE ${PAID} AND oi."status" <> 'CANCELLED' AND o."createdAt" >= ${from} AND o."createdAt" < ${to} ${dept}`;

    const now = new Date();
    const [[cur], [prev], [today], multi, conv, lowStock, byDeptDay, byStatus, top, pairs, live, alerts] = await Promise.all([
      revenueBetween(since, now),
      revenueBetween(prevSince, since),
      revenueBetween(todayStart, now),
      prisma.$queryRaw<{ multi: number; total: number }[]>`
        SELECT COUNT(*) FILTER (WHERE depts >= 2)::int AS multi, COUNT(*)::int AS total FROM (
          SELECT o."id", COUNT(DISTINCT oi."departmentId") AS depts
          FROM "Order" o JOIN "OrderItem" oi ON oi."orderId" = o."id"
          WHERE ${PAID} AND o."createdAt" >= ${since} GROUP BY o."id") t`,
      prisma.$queryRaw<{ paid: number; created: number }[]>`
        SELECT COUNT(*) FILTER (WHERE ${PAID})::int AS paid, COUNT(*)::int AS created
        FROM "Order" o WHERE o."createdAt" >= ${since}`,
      prisma.$queryRaw<{ n: number }[]>`
        SELECT COUNT(*)::int AS n FROM "Variant" v JOIN "Product" p ON p."id" = v."productId"
        WHERE v."isActive" AND p."isActive" AND v."stock" - v."reserved" <= v."lowStockAt" ${deptV}`,
      prisma.$queryRaw<{ day: Date; slug: string; revenue: number }[]>`
        SELECT date_trunc('day', o."createdAt" AT TIME ZONE 'Asia/Kolkata') AS day, d."slug", SUM(oi."lineTotal")::int AS revenue
        FROM "OrderItem" oi JOIN "Order" o ON o."id" = oi."orderId" JOIN "Department" d ON d."id" = oi."departmentId"
        WHERE ${PAID} AND oi."status" <> 'CANCELLED' AND o."createdAt" >= ${since} ${dept}
        GROUP BY 1, 2 ORDER BY 1`,
      prisma.$queryRaw<{ status: string; count: number }[]>`
        SELECT s."status"::text AS status, COUNT(DISTINCT s."id")::int AS count
        FROM "Shipment" s JOIN "Order" o ON o."id" = s."orderId"
        ${opts.deptId ? Prisma.sql`JOIN "OrderItem" oi ON oi."shipmentId" = s."id"` : Prisma.empty}
        WHERE o."createdAt" >= ${since} AND s."status" <> 'PENDING_PAYMENT' ${dept}
        GROUP BY 1 ORDER BY 2 DESC`,
      prisma.$queryRaw<{ productId: string; name: string; slug: string; dept: string; qty: number; revenue: number }[]>`
        SELECT oi."productId", p."name", p."slug", d."slug" AS dept, SUM(oi."qty")::int AS qty, SUM(oi."lineTotal")::int AS revenue
        FROM "OrderItem" oi JOIN "Order" o ON o."id" = oi."orderId" JOIN "Product" p ON p."id" = oi."productId"
        JOIN "Department" d ON d."id" = p."departmentId"
        WHERE ${PAID} AND oi."status" <> 'CANCELLED' AND o."createdAt" >= ${since} ${dept}
        GROUP BY 1, 2, 3, 4 ORDER BY qty DESC LIMIT 5`,
      prisma.$queryRaw<{ a: string; b: string; orders: number }[]>`
        SELECT da."slug" AS a, db."slug" AS b, COUNT(DISTINCT o."id")::int AS orders
        FROM "Order" o
        JOIN "OrderItem" x ON x."orderId" = o."id" JOIN "OrderItem" y ON y."orderId" = o."id" AND x."departmentId" < y."departmentId"
        JOIN "Department" da ON da."id" = x."departmentId" JOIN "Department" db ON db."id" = y."departmentId"
        WHERE ${PAID} AND o."createdAt" >= ${since}
        GROUP BY 1, 2 ORDER BY 3 DESC LIMIT 6`,
      prisma.order.findMany({
        where: { status: { not: 'PENDING_PAYMENT' }, ...(opts.deptId ? { items: { some: { departmentId: opts.deptId } } } : {}) },
        orderBy: { createdAt: 'desc' }, take: 8,
        select: { id: true, orderNumber: true, total: true, status: true, createdAt: true, user: { select: { name: true } }, items: { select: { departmentId: true } } },
      }),
      prisma.$queryRaw<{ variantId: string; sku: string; name: string; available: number; lowStockAt: number }[]>`
        SELECT v."id" AS "variantId", v."sku", p."name", (v."stock" - v."reserved")::int AS available, v."lowStockAt"
        FROM "Variant" v JOIN "Product" p ON p."id" = v."productId"
        WHERE v."isActive" AND p."isActive" AND v."stock" - v."reserved" <= v."lowStockAt" ${deptV}
        ORDER BY available ASC LIMIT 8`,
    ]);

    const depts = await prisma.department.findMany({ select: { id: true, slug: true } });
    const slug = new Map(depts.map((d) => [d.id, d.slug]));
    const totalPairs = multi[0]?.total || 1;

    // daily sparkline
    const daily = new Map<string, number>();
    for (const r of byDeptDay) {
      const k = new Date(r.day).toISOString().slice(0, 10);
      daily.set(k, (daily.get(k) ?? 0) + r.revenue);
    }
    const change = (a: number, b: number) => (b ? Math.round(((a - b) / b) * 1000) / 10 : null);

    return {
      range: { days: opts.days, since },
      kpis: {
        revenue: cur.revenue,
        revenueChangePct: change(cur.revenue, prev.revenue),
        revenueToday: today.revenue,
        orders: cur.orders,
        ordersToday: today.orders,
        aov: cur.orders ? Math.round(cur.revenue / cur.orders) : 0,
        multiDepartmentCartPct: multi[0]?.total ? Math.round((multi[0].multi / multi[0].total) * 1000) / 10 : 0,
        checkoutConversionPct: conv[0]?.created ? Math.round((conv[0].paid / conv[0].created) * 1000) / 10 : 0,
        lowStockSkus: lowStock[0]?.n ?? 0,
      },
      charts: {
        revenueByDepartmentDay: byDeptDay.map((r) => ({ day: new Date(r.day).toISOString().slice(0, 10), department: r.slug, revenue: r.revenue })),
        revenueSparkline: [...daily.entries()].map(([day, revenue]) => ({ day, revenue })),
        shipmentsByStatus: byStatus,
        boughtTogether: pairs.map((p) => ({ departments: [p.a, p.b], orders: p.orders, pct: Math.round((p.orders / totalPairs) * 1000) / 10 })),
      },
      topProducts: top,
      liveOrders: live.map((o) => ({
        id: o.id, orderNumber: o.orderNumber, customer: o.user.name, total: o.total, status: o.status, createdAt: o.createdAt,
        departments: [...new Set(o.items.map((i) => slug.get(i.departmentId)))],
      })),
      inventoryAlerts: alerts,
    };
  });
}
