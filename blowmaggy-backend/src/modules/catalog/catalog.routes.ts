import { Router } from 'express';
import { z } from 'zod';
import { limits } from '../../middleware/security';
import { validate } from '../../middleware/validate';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/AppError';
import { pageMeta, param, send } from '../../utils/http';
import { homePicks } from '../recommend/recommend.service';
import { search, suggest, type SearchFilters } from '../search/search.service';
import { cardInclude, productCard } from './serialize';
import * as catalog from './catalog.service';

const csv = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((v) => (v === undefined ? undefined : (Array.isArray(v) ? v : v.split(',')).map((s) => s.trim()).filter(Boolean)));
const num = z.coerce.number().optional();
const boolish = z.enum(['true', 'false', '1', '0']).optional().transform((v) => v === 'true' || v === '1');

export const searchQuery = z.object({
  q: z.string().trim().max(80).optional(),
  dept: csv,
  category: z.string().trim().max(60).optional(),
  brand: csv,
  size: csv,
  colour: csv,
  tag: z.string().trim().max(40).optional(),
  priceMin: num,
  priceMax: num,
  rating: z.coerce.number().min(0).max(5).optional(),
  discount: z.coerce.number().min(0).max(90).optional(),
  inStock: boolish,
  sort: z.enum(['relevance', 'popular', 'price_asc', 'price_desc', 'newest', 'top_rated', 'discount']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(60).default(24),
});

export const catalogRoutes = Router();

catalogRoutes.get('/departments', async (_req, res) => send(res, await catalog.listDepartments()));
catalogRoutes.get('/departments/:slug', async (req, res) => send(res, await catalog.departmentDetail(param(req, 'slug'))));

catalogRoutes.get('/products', validate({ query: searchQuery }), async (req, res) => {
  const f = res.locals.query as SearchFilters;
  const out = await search({ ...f, q: undefined }, req.user?.isMember);
  send(res, out.items, { ...pageMeta(f.page, f.limit, out.total), facets: out.facets });
});

catalogRoutes.get('/products/:slug', validate({ query: z.object({ size: z.string().max(10).optional() }) }), async (req, res) => {
  send(res, await catalog.productDetail(param(req, 'slug'), { userId: req.user?.id, isMember: req.user?.isMember, size: res.locals.query.size }));
});

catalogRoutes.get('/products/:slug/delivery', validate({ query: z.object({ pincode: z.string() }) }), async (req, res) => {
  const p = await prisma.product.findUnique({ where: { slug: param(req, 'slug') }, select: { department: { select: { slug: true } } } });
  if (!p) throw new AppError(404, 'Product not found');
  send(res, catalog.deliveryEstimate(res.locals.query.pincode, p.department.slug, !!req.user?.isMember));
});

catalogRoutes.get('/search', limits.search, validate({ query: searchQuery }), async (req, res) => {
  const f = res.locals.query as SearchFilters;
  const out = await search(f, req.user?.isMember);
  send(res, out.items, { ...pageMeta(f.page, f.limit, out.total), facets: out.facets, headline: out.headline });
});

catalogRoutes.get('/search/suggest', limits.search, validate({ query: z.object({ q: z.string().max(60).default('') }) }), async (_req, res) => {
  send(res, await suggest(res.locals.query.q));
});

catalogRoutes.get('/recommendations/home', async (req, res) => send(res, await homePicks(req.user?.id)));

catalogRoutes.get('/home', async (req, res) => {
  const [departments, picks, deals] = await Promise.all([
    catalog.listDepartments(),
    homePicks(req.user?.id),
    prisma.product.findMany({
      where: { isActive: true, publicAt: null }, include: cardInclude, take: 40, orderBy: { soldCount: 'desc' },
    }),
  ]);
  const dealCards = deals.map(productCard).filter((c) => c.inStock).sort((a, b) => b.discountPct - a.discountPct).slice(0, 4);
  const endsAt = new Date(); endsAt.setUTCHours(18, 29, 59, 0); // midnight IST
  if (endsAt < new Date()) endsAt.setUTCDate(endsAt.getUTCDate() + 1);
  send(res, {
    strip: 'VOL. 01 · FREE DELIVERY OVER ₹999 · MAGGY+ MEMBERS SAVE 10%',
    departments,
    pickedForYou: picks,
    dealsOfTheIssue: { endsAt, items: dealCards },
  });
});

catalogRoutes.get('/bundles', async (_req, res) => {
  const bundles = await prisma.bundle.findMany({
    where: { isActive: true },
    include: { items: { include: { product: { include: cardInclude } } } },
  });
  send(res, bundles.map((b) => {
    const items = b.items.map((i) => productCard(i.product));
    const full = items.reduce((a, i) => a + i.price, 0);
    return { slug: b.slug, name: b.name, description: b.description, discountPct: b.discountPct, image: b.image, items, fullPrice: full, bundlePrice: full - Math.round((full * b.discountPct) / 100) };
  }));
});
