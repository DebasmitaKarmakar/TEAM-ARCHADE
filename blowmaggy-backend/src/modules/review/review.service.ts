/**
 * REVIEWS — one per user per product; "verified" if the user received it.
 * Ranking uses a Bayesian average: (C·m + Σratings) / (C + n), so 1 five-star review
 * doesn't beat 900 reviews at 4.6★.
 */
import { BAYES_PRIOR_MEAN, BAYES_WEIGHT } from '../../config/constants';
import { cache } from '../../lib/cache';
import { prisma, type Db } from '../../lib/prisma';
import type { AuthUser } from '../../types/express';
import { AppError } from '../../utils/AppError';

export const bayes = (sum: number, count: number) => (BAYES_WEIGHT * BAYES_PRIOR_MEAN + sum) / (BAYES_WEIGHT + count);

export async function recomputeRating(db: Db, productId: string) {
  const agg = await db.review.aggregate({ where: { productId, status: 'PUBLISHED' }, _sum: { rating: true }, _count: true });
  const sum = agg._sum.rating ?? 0;
  const count = agg._count;
  await db.product.update({
    where: { id: productId },
    data: { ratingSum: sum, ratingCount: count, ratingAvg: count ? sum / count : 0, bayesScore: bayes(sum, count) },
  });
}

export async function reviewSummary(productId: string) {
  const [p, dist, withPhotos] = await Promise.all([
    prisma.product.findUnique({ where: { id: productId }, select: { ratingAvg: true, ratingCount: true } }),
    prisma.review.groupBy({ by: ['rating'], where: { productId, status: 'PUBLISHED' }, _count: true }),
    prisma.review.count({ where: { productId, status: 'PUBLISHED', images: { isEmpty: false } } }),
  ]);
  const distribution = [5, 4, 3, 2, 1].map((r) => ({ rating: r, count: dist.find((d) => d.rating === r)?._count ?? 0 }));
  return { average: Math.round((p?.ratingAvg ?? 0) * 10) / 10, count: p?.ratingCount ?? 0, distribution, withPhotos };
}

export async function listReviews(productId: string, q: { sort: 'helpful' | 'latest' | 'rating_high' | 'rating_low'; rating?: number; withPhotos?: boolean; page: number; limit: number }) {
  const where = {
    productId, status: 'PUBLISHED',
    ...(q.rating ? { rating: q.rating } : {}),
    ...(q.withPhotos ? { images: { isEmpty: false } } : {}),
  };
  const orderBy =
    q.sort === 'latest' ? [{ createdAt: 'desc' as const }]
    : q.sort === 'rating_high' ? [{ rating: 'desc' as const }, { createdAt: 'desc' as const }]
    : q.sort === 'rating_low' ? [{ rating: 'asc' as const }, { createdAt: 'desc' as const }]
    : [{ helpful: 'desc' as const }, { verified: 'desc' as const }, { createdAt: 'desc' as const }];
  const [total, rows] = await Promise.all([
    prisma.review.count({ where }),
    prisma.review.findMany({ where, orderBy, skip: (q.page - 1) * q.limit, take: q.limit, include: { user: { select: { name: true } } } }),
  ]);
  return {
    total,
    reviews: rows.map((r) => ({
      id: r.id, rating: r.rating, title: r.title, body: r.body, images: r.images, verified: r.verified,
      helpful: r.helpful, createdAt: r.createdAt, author: shortName(r.user.name),
    })),
  };
}

const shortName = (n: string) => { const [a, b] = n.split(' '); return b ? `${a} ${b[0]}.` : a; };

/** Plain text only — tags are stripped and React escapes on render. */
const clean = (s: string) => s.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

export async function createReview(user: AuthUser, productId: string, input: { rating: number; title: string; body: string; images?: string[] }) {
  const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true, isActive: true } });
  if (!product?.isActive) throw new AppError(404, 'Product not found');
  const delivered = await prisma.orderItem.count({
    where: { productId, status: { in: ['DELIVERED', 'RETURN_REQUESTED', 'RETURNED'] }, order: { userId: user.id } },
  });
  const review = await prisma.$transaction(async (tx) => {
    const r = await tx.review.create({
      data: {
        productId, userId: user.id, rating: input.rating, title: clean(input.title), body: clean(input.body),
        images: (input.images ?? []).slice(0, 4), verified: delivered > 0,
      },
    });
    await recomputeRating(tx, productId);
    return r;
  });
  cache.invalidate('catalog:');
  return review;
}

export async function voteHelpful(userId: string, reviewId: string) {
  const r = await prisma.review.findUnique({ where: { id: reviewId }, select: { id: true, userId: true } });
  if (!r) throw new AppError(404, 'Review not found');
  if (r.userId === userId) throw new AppError(400, "You can't vote on your own review");
  const created = await prisma.reviewVote.createMany({ data: [{ reviewId, userId }], skipDuplicates: true });
  if (created.count) await prisma.review.update({ where: { id: reviewId }, data: { helpful: { increment: 1 } } });
  const fresh = await prisma.review.findUniqueOrThrow({ where: { id: reviewId }, select: { helpful: true } });
  return { helpful: fresh.helpful, voted: true };
}

export async function moderate(reviewId: string, status: 'PUBLISHED' | 'HIDDEN') {
  const r = await prisma.review.update({ where: { id: reviewId }, data: { status } });
  await recomputeRating(prisma, r.productId);
  cache.invalidate('catalog:');
  return r;
}
