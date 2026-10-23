/** Shopper account extras: addresses, wishlist, reviews, Maggy+, notifications. */
import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middleware/auth';
import { limits } from '../../middleware/security';
import { validate } from '../../middleware/validate';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/AppError';
import { pageMeta, param, requireUser, send } from '../../utils/http';
import { cardInclude, productCard } from '../catalog/serialize';
import { addressSchema } from '../checkout/checkout.routes';
import * as membership from '../membership/membership.service';
import { listNotifications, markRead } from '../notification/notification.service';
import { completeTheLook } from '../recommend/recommend.service';
import { createReview, listReviews, reviewSummary, voteHelpful } from '../review/review.service';

export const accountRoutes = Router();

// ── Addresses ────────────────────────────────────────────
accountRoutes.get('/addresses', requireAuth, async (req, res) => {
  send(res, await prisma.address.findMany({ where: { userId: requireUser(req).id }, orderBy: [{ isDefault: 'desc' }, { label: 'asc' }] }));
});

accountRoutes.post('/addresses', requireAuth, validate({ body: addressSchema.extend({ isDefault: z.boolean().optional() }) }), async (req, res) => {
  const userId = requireUser(req).id;
  const b = res.locals.body;
  const count = await prisma.address.count({ where: { userId } });
  const isDefault = b.isDefault ?? count === 0;
  const a = await prisma.$transaction(async (tx) => {
    if (isDefault) await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
    return tx.address.create({ data: { ...b, label: b.label ?? 'Home', userId, isDefault } });
  });
  send(res, a, undefined, 201);
});

accountRoutes.patch('/addresses/:id', requireAuth, validate({ body: addressSchema.partial().extend({ isDefault: z.boolean().optional() }) }), async (req, res) => {
  const userId = requireUser(req).id;
  const id = param(req, 'id');
  const existing = await prisma.address.findFirst({ where: { id, userId } });
  if (!existing) throw new AppError(404, 'Address not found');
  const a = await prisma.$transaction(async (tx) => {
    if (res.locals.body.isDefault) await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
    return tx.address.update({ where: { id }, data: res.locals.body });
  });
  send(res, a);
});

accountRoutes.delete('/addresses/:id', requireAuth, async (req, res) => {
  const r = await prisma.address.deleteMany({ where: { id: param(req, 'id'), userId: requireUser(req).id } });
  if (!r.count) throw new AppError(404, 'Address not found');
  send(res, { ok: true });
});

// ── Wishlist ─────────────────────────────────────────────
accountRoutes.get('/wishlist', requireAuth, async (req, res) => {
  const items = await prisma.wishlistItem.findMany({
    where: { userId: requireUser(req).id }, orderBy: { createdAt: 'desc' },
    include: { product: { include: cardInclude } },
  });
  send(res, items.map((w) => {
    const card = productCard(w.product);
    return {
      ...card,
      addedAt: w.createdAt,
      variantId: w.variantId,
      priceWhenAdded: w.priceWhenAdded,
      priceDrop: Math.max(0, w.priceWhenAdded - card.price),
      backInStock: card.inStock,
    };
  }));
});

accountRoutes.post('/wishlist', requireAuth, validate({ body: z.object({ productId: z.string(), variantId: z.string().optional() }) }), async (req, res) => {
  const userId = requireUser(req).id;
  const p = await prisma.product.findUnique({ where: { id: res.locals.body.productId }, select: { id: true, basePrice: true, isActive: true } });
  if (!p?.isActive) throw new AppError(404, 'Product not found');
  await prisma.wishlistItem.upsert({
    where: { userId_productId: { userId, productId: p.id } },
    create: { userId, productId: p.id, variantId: res.locals.body.variantId, priceWhenAdded: p.basePrice },
    update: { variantId: res.locals.body.variantId },
  });
  send(res, { ok: true, productId: p.id }, undefined, 201);
});

accountRoutes.delete('/wishlist/:productId', requireAuth, async (req, res) => {
  await prisma.wishlistItem.deleteMany({ where: { userId: requireUser(req).id, productId: param(req, 'productId') } });
  send(res, { ok: true });
});

// ── Reviews ──────────────────────────────────────────────
accountRoutes.get(
  '/products/:id/reviews',
  validate({
    query: z.object({
      sort: z.enum(['helpful', 'latest', 'rating_high', 'rating_low']).default('helpful'),
      rating: z.coerce.number().int().min(1).max(5).optional(),
      withPhotos: z.enum(['true', 'false']).optional().transform((v) => v === 'true'),
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(50).default(10),
    }),
  }),
  async (req, res) => {
    const q = res.locals.query;
    const out = await listReviews(param(req, 'id'), q);
    send(res, out.reviews, { ...pageMeta(q.page, q.limit, out.total), summary: await reviewSummary(param(req, 'id')) });
  },
);

accountRoutes.post(
  '/products/:id/reviews',
  requireAuth,
  limits.reviews,
  validate({
    body: z.object({
      rating: z.coerce.number().int().min(1).max(5),
      title: z.string().trim().min(2).max(80),
      body: z.string().trim().min(5).max(2000),
      images: z.array(z.string().url().max(500)).max(4).optional(),
    }),
  }),
  async (req, res) => send(res, await createReview(requireUser(req), param(req, 'id'), res.locals.body), undefined, 201),
);

accountRoutes.post('/reviews/:id/helpful', requireAuth, async (req, res) => send(res, await voteHelpful(requireUser(req).id, param(req, 'id'))));

accountRoutes.get('/recommendations/look/:productId', validate({ query: z.object({ size: z.string().max(10).optional() }) }), async (req, res) => {
  send(res, await completeTheLook(param(req, 'productId'), res.locals.query.size));
});

// ── Maggy+ ───────────────────────────────────────────────
accountRoutes.get('/membership', async (req, res) => {
  send(res, req.user ? await membership.status(req.user.id) : { active: false, plans: membership.plans() });
});
accountRoutes.post('/membership/subscribe', requireAuth, validate({ body: z.object({ plan: z.enum(['MONTHLY', 'YEARLY']) }) }), async (req, res) => {
  send(res, await membership.subscribe(requireUser(req), res.locals.body.plan), undefined, 201);
});

// ── Notifications (staff alerts like low stock; shoppers get order updates later) ──
accountRoutes.get('/notifications', requireAuth, async (req, res) => {
  send(res, await listNotifications(requireUser(req).id, req.query.unread === 'true'));
});
accountRoutes.post('/notifications/read', requireAuth, validate({ body: z.object({ id: z.string().optional() }).default({}) }), async (req, res) => {
  await markRead(requireUser(req).id, res.locals.body.id);
  send(res, { ok: true });
});
