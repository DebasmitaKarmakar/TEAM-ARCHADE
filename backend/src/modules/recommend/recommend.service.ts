/**
 * RECOMMENDATIONS
 *  - alsoBought:   co-purchase matrix, re-ranked so the row spans several departments
 *  - completeLook: products sharing a `look:<slug>` tag
 *  - homePicks:    0.5·co-purchase(seeds) + 0.2·category affinity + 0.2·7-day popularity + 0.1·freshness,
 *                  then round-robin by department (cold start = popularity per department)
 */
import { cache } from '../../lib/cache';
import { prisma } from '../../lib/prisma';
import { available, cardInclude, productCard } from '../catalog/serialize';

type Card = ReturnType<typeof productCard>;

/** Round-robin by department so a 12-item row covers as many departments as possible. */
export function diversify<T extends { department: { slug: string } }>(items: T[], limit: number): T[] {
  const buckets = new Map<string, T[]>();
  for (const it of items) {
    const k = it.department.slug;
    if (!buckets.has(k)) buckets.set(k, []);
    buckets.get(k)!.push(it);
  }
  const out: T[] = [];
  while (out.length < limit && [...buckets.values()].some((b) => b.length)) {
    for (const b of buckets.values()) {
      const next = b.shift();
      if (next) out.push(next);
      if (out.length >= limit) break;
    }
  }
  return out;
}

async function cardsFor(ids: string[]) {
  const products = await prisma.product.findMany({
    where: { id: { in: ids }, isActive: true, publicAt: null },
    include: cardInclude,
  });
  const byId = new Map(products.map((p) => [p.id, productCard(p)]));
  return ids.map((id) => byId.get(id)).filter((c): c is Card => !!c && c.inStock);
}

export async function alsoBought(productId: string, limit = 8) {
  return cache.wrap(`rec:also:${productId}`, 300, async () => {
    const rows = await prisma.coPurchase.findMany({ where: { productA: productId }, orderBy: { count: 'desc' }, take: 40 });
    let cards = await cardsFor(rows.map((r) => r.productB));
    if (cards.length < limit) {
      const self = await prisma.product.findUnique({ where: { id: productId }, select: { departmentId: true } });
      const filler = await prisma.product.findMany({
        where: { isActive: true, publicAt: null, id: { notIn: [productId, ...cards.map((c) => c.id)] }, departmentId: { not: self?.departmentId } },
        orderBy: { soldCount: 'desc' }, take: 24, include: cardInclude,
      });
      cards = [...cards, ...filler.map(productCard).filter((c) => c.inStock)];
    }
    return diversify(cards, limit);
  });
}

export async function completeTheLook(productId: string, preferredSize?: string) {
  const p = await prisma.product.findUnique({ where: { id: productId }, select: { tags: true } });
  const lookTag = p?.tags.find((t) => t.startsWith('look:'));
  if (!lookTag) return null;
  const products = await prisma.product.findMany({
    where: { tags: { has: lookTag }, isActive: true, id: { not: productId } },
    include: { ...cardInclude, variants: { where: { isActive: true }, orderBy: { price: 'asc' } } },
  });
  const pieces = products.map((prod) => {
    const inStock = prod.variants.filter((v) => available(v) > 0);
    const sized = preferredSize ? inStock.find((v) => (v.options as Record<string, string>).size === preferredSize) : undefined;
    const chosen = sized ?? inStock[0];
    return { product: productCard(prod), variantId: chosen?.id ?? null, price: chosen?.price ?? prod.basePrice, inStock: !!chosen };
  }).filter((x) => x.inStock);
  return {
    look: lookTag.slice(5),
    title: lookTag.slice(5).split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' '),
    pieces,
    total: pieces.reduce((a, x) => a + x.price, 0),
  };
}

export async function homePicks(userId?: string, limit = 12) {
  if (!userId) return cache.wrap('rec:home:anon', 300, () => coldStart(limit));

  return cache.wrap(`rec:home:${userId}`, 600, async () => {
    const [views, bought, inCart] = await Promise.all([
      prisma.productView.findMany({ where: { userId }, orderBy: { viewedAt: 'desc' }, take: 10, select: { productId: true } }),
      prisma.orderItem.findMany({
        where: { order: { userId, status: { notIn: ['PENDING_PAYMENT', 'CANCELLED'] } } },
        orderBy: { order: { createdAt: 'desc' } }, take: 20, select: { productId: true, product: { select: { categoryId: true, department: { select: { slug: true } } } } },
      }),
      prisma.cartItem.findMany({ where: { cart: { userId } }, select: { variant: { select: { productId: true } } } }),
    ]);
    const seeds = [...new Set([...views.map((v) => v.productId), ...bought.map((b) => b.productId)])];
    if (seeds.length === 0) return coldStart(limit);

    const exclude = new Set([...bought.filter((b) => b.product.department.slug !== 'grocery').map((b) => b.productId), ...inCart.map((c) => c.variant.productId)]);
    const co = await prisma.coPurchase.groupBy({ by: ['productB'], where: { productA: { in: seeds } }, _sum: { count: true } });
    const coMax = Math.max(1, ...co.map((c) => c._sum.count ?? 0));
    const coScore = new Map(co.map((c) => [c.productB, (c._sum.count ?? 0) / coMax]));

    const catCounts = new Map<string, number>();
    for (const b of bought) catCounts.set(b.product.categoryId, (catCounts.get(b.product.categoryId) ?? 0) + 1);
    const viewedCats = await prisma.product.findMany({ where: { id: { in: views.map((v) => v.productId) } }, select: { categoryId: true } });
    for (const v of viewedCats) catCounts.set(v.categoryId, (catCounts.get(v.categoryId) ?? 0) + 1);
    const catTotal = Math.max(1, [...catCounts.values()].reduce((a, b) => a + b, 0));

    const since = new Date(Date.now() - 7 * 86_400_000);
    const pop = await prisma.orderItem.groupBy({ by: ['productId'], where: { order: { createdAt: { gte: since } } }, _sum: { qty: true } });
    const popMax = Math.max(1, ...pop.map((p) => p._sum.qty ?? 0));
    const popScore = new Map(pop.map((p) => [p.productId, (p._sum.qty ?? 0) / popMax]));

    const candidates = await prisma.product.findMany({ where: { isActive: true, publicAt: null }, include: cardInclude });
    const newest = Math.max(...candidates.map((c) => c.createdAt.getTime()));
    const oldest = Math.min(...candidates.map((c) => c.createdAt.getTime()));
    const scored = candidates
      .filter((c) => !exclude.has(c.id) && !seeds.includes(c.id))
      .map((c) => ({
        card: productCard(c),
        score:
          0.5 * (coScore.get(c.id) ?? 0) +
          0.2 * ((catCounts.get(c.categoryId) ?? 0) / catTotal) +
          0.2 * (popScore.get(c.id) ?? 0) +
          0.1 * (newest === oldest ? 0 : (c.createdAt.getTime() - oldest) / (newest - oldest)),
      }))
      .filter((s) => s.card.inStock)
      .sort((a, b) => b.score - a.score)
      .map((s) => s.card);
    return diversify(scored, limit);
  });
}

async function coldStart(limit: number) {
  const products = await prisma.product.findMany({
    where: { isActive: true, publicAt: null }, orderBy: [{ soldCount: 'desc' }, { bayesScore: 'desc' }], take: 60, include: cardInclude,
  });
  return diversify(products.map(productCard).filter((c) => c.inStock), limit);
}

/** Nightly job: rebuild the co-purchase matrix from the last 90 days of paid orders. */
export async function rebuildCoPurchase() {
  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`DELETE FROM "CoPurchase"`;
    await tx.$executeRaw`
      INSERT INTO "CoPurchase" ("productA", "productB", "count")
      SELECT a."productId", b."productId", COUNT(DISTINCT a."orderId")::int
      FROM "OrderItem" a
      JOIN "OrderItem" b ON a."orderId" = b."orderId" AND a."productId" <> b."productId"
      JOIN "Order" o ON o."id" = a."orderId"
      WHERE o."status" NOT IN ('PENDING_PAYMENT', 'CANCELLED') AND o."createdAt" >= now() - interval '90 days'
      GROUP BY 1, 2`;
  }, { timeout: 60_000 });
  cache.invalidate('rec:');
}
