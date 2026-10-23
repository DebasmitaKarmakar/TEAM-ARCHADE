/**
 * SEARCH — Postgres full-text (prefix tsquery) + trigram typo tolerance + JSONB variant filters.
 * Facet counts are computed with every filter EXCEPT the facet's own, so "Fashion (120)"
 * stays correct while Fashion is selected.
 */
import { Prisma } from '../../generated/prisma/client';
import { cache } from '../../lib/cache';
import { prisma } from '../../lib/prisma';
import { cardInclude, productCard } from '../catalog/serialize';

export type SortKey = 'relevance' | 'popular' | 'price_asc' | 'price_desc' | 'newest' | 'top_rated' | 'discount';

export interface SearchFilters {
  q?: string;
  dept?: string[];
  category?: string;
  brand?: string[];
  size?: string[];
  colour?: string[];
  tag?: string;
  priceMin?: number; // rupees
  priceMax?: number; // rupees
  rating?: number;
  discount?: number; // percent
  inStock?: boolean;
  sort?: SortKey;
  page: number;
  limit: number;
}

type Facet = 'dept' | 'brand' | 'size' | 'colour' | null;

export function toTsQuery(q: string) {
  const tokens = (q.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []).slice(0, 6);
  return tokens.length ? tokens.map((t) => `${t}:*`).join(' & ') : null;
}

async function departmentIds(slugs?: string[]) {
  if (!slugs?.length) return undefined;
  const all = await cache.wrap('depts:idmap', 300, () => prisma.department.findMany({ select: { id: true, slug: true } }));
  return all.filter((d) => slugs.includes(d.slug)).map((d) => d.id);
}

async function categoryIds(slug?: string) {
  if (!slug) return undefined;
  const cats = await cache.wrap('cats:all', 300, () => prisma.category.findMany({ select: { id: true, slug: true, parentId: true } }));
  const root = cats.find((c) => c.slug === slug);
  if (!root) return ['__none__'];
  const ids = [root.id];
  for (let i = 0; i < ids.length; i++) for (const c of cats) if (c.parentId === ids[i]) ids.push(c.id);
  return ids;
}

function buildWhere(f: SearchFilters, ctx: { deptIds?: string[]; catIds?: string[]; tsq: string | null; isMember: boolean }, exclude: Facet) {
  const parts: Prisma.Sql[] = [Prisma.sql`p."isActive" = true`];
  if (!ctx.isMember) parts.push(Prisma.sql`(p."publicAt" IS NULL OR p."publicAt" <= now())`);
  if (f.q && ctx.tsq) {
    parts.push(Prisma.sql`(p."searchVector" @@ to_tsquery('simple', ${ctx.tsq}) OR word_similarity(${f.q}, p."name") > 0.45)`);
  }
  if (exclude !== 'dept' && ctx.deptIds) parts.push(Prisma.sql`p."departmentId" = ANY(${ctx.deptIds})`);
  if (ctx.catIds) parts.push(Prisma.sql`p."categoryId" = ANY(${ctx.catIds})`);
  if (exclude !== 'brand' && f.brand?.length) parts.push(Prisma.sql`p."brand" = ANY(${f.brand})`);
  if (f.tag) parts.push(Prisma.sql`${f.tag} = ANY(p."tags")`);
  if (f.priceMin !== undefined) parts.push(Prisma.sql`p."basePrice" >= ${Math.round(f.priceMin * 100)}`);
  if (f.priceMax !== undefined) parts.push(Prisma.sql`p."basePrice" <= ${Math.round(f.priceMax * 100)}`);
  if (f.rating) parts.push(Prisma.sql`p."ratingAvg" >= ${f.rating}`);
  if (f.discount) parts.push(Prisma.sql`(p."mrp" - p."basePrice") * 100 >= ${f.discount} * p."mrp"`);

  const sizes = exclude !== 'size' && f.size?.length ? f.size : null;
  const colours = exclude !== 'colour' && f.colour?.length ? f.colour : null;
  if (sizes || colours || f.inStock) {
    const v: Prisma.Sql[] = [Prisma.sql`v."productId" = p."id"`, Prisma.sql`v."isActive" = true`];
    if (sizes) v.push(Prisma.sql`v."options"->>'size' = ANY(${sizes})`);
    if (colours) v.push(Prisma.sql`v."options"->>'colour' = ANY(${colours})`);
    if (f.inStock) v.push(Prisma.sql`v."stock" - v."reserved" > 0`);
    parts.push(Prisma.sql`EXISTS (SELECT 1 FROM "Variant" v WHERE ${Prisma.join(v, ' AND ')})`);
  }
  return Prisma.join(parts, ' AND ');
}

function orderBy(sort: SortKey, tsq: string | null, q?: string) {
  const popularity = Prisma.sql`0.2 * (p."bayesScore" / 5) + 0.1 * ln(1 + p."soldCount") / 10`;
  switch (sort) {
    case 'price_asc': return Prisma.sql`p."basePrice" ASC, p."id"`;
    case 'price_desc': return Prisma.sql`p."basePrice" DESC, p."id"`;
    case 'newest': return Prisma.sql`p."createdAt" DESC, p."id"`;
    case 'top_rated': return Prisma.sql`p."bayesScore" DESC, p."ratingCount" DESC, p."id"`;
    case 'discount': return Prisma.sql`(p."mrp" - p."basePrice")::float / NULLIF(p."mrp", 0) DESC, p."id"`;
    case 'popular': return Prisma.sql`p."soldCount" DESC, p."bayesScore" DESC, p."id"`;
    default:
      if (tsq && q) {
        return Prisma.sql`(0.6 * ts_rank(p."searchVector", to_tsquery('simple', ${tsq})) + 0.2 * word_similarity(${q}, p."name") + ${popularity}) DESC, p."id"`;
      }
      return Prisma.sql`(${popularity}) DESC, p."id"`;
  }
}

export async function search(f: SearchFilters, isMember = false) {
  const tsq = f.q ? toTsQuery(f.q) : null;
  const ctx = { deptIds: await departmentIds(f.dept), catIds: await categoryIds(f.category), tsq, isMember };
  const sort: SortKey = f.sort ?? (f.q ? 'relevance' : 'popular');
  const where = buildWhere(f, ctx, null);

  const [idRows, totalRows, deptFacet, brandFacet, sizeFacet, colourFacet, priceRange] = await Promise.all([
    prisma.$queryRaw<{ id: string }[]>`
      SELECT p."id" FROM "Product" p WHERE ${where} ORDER BY ${orderBy(sort, tsq, f.q)}
      LIMIT ${f.limit} OFFSET ${(f.page - 1) * f.limit}`,
    prisma.$queryRaw<{ n: number }[]>`SELECT COUNT(*)::int AS n FROM "Product" p WHERE ${where}`,
    prisma.$queryRaw<{ slug: string; name: string; accentHex: string; count: number }[]>`
      SELECT d."slug", d."name", d."accentHex", COUNT(*)::int AS count
      FROM "Product" p JOIN "Department" d ON d."id" = p."departmentId"
      WHERE ${buildWhere(f, ctx, 'dept')} GROUP BY d."slug", d."name", d."accentHex", d."sortOrder" ORDER BY d."sortOrder"`,
    prisma.$queryRaw<{ value: string; count: number }[]>`
      SELECT p."brand" AS value, COUNT(*)::int AS count FROM "Product" p
      WHERE ${buildWhere(f, ctx, 'brand')} GROUP BY p."brand" ORDER BY count DESC, value LIMIT 30`,
    prisma.$queryRaw<{ value: string; count: number }[]>`
      SELECT v."options"->>'size' AS value, COUNT(DISTINCT p."id")::int AS count
      FROM "Product" p JOIN "Variant" v ON v."productId" = p."id" AND v."isActive" = true
      WHERE ${buildWhere(f, ctx, 'size')} AND v."options"->>'size' IS NOT NULL
      GROUP BY 1 ORDER BY count DESC, value LIMIT 40`,
    prisma.$queryRaw<{ value: string; count: number }[]>`
      SELECT v."options"->>'colour' AS value, COUNT(DISTINCT p."id")::int AS count
      FROM "Product" p JOIN "Variant" v ON v."productId" = p."id" AND v."isActive" = true
      WHERE ${buildWhere(f, ctx, 'colour')} AND v."options"->>'colour' IS NOT NULL
      GROUP BY 1 ORDER BY count DESC, value LIMIT 40`,
    prisma.$queryRaw<{ min: number | null; max: number | null }[]>`
      SELECT MIN(p."basePrice")::int AS min, MAX(p."basePrice")::int AS max FROM "Product" p WHERE ${where}`,
  ]);

  const ids = idRows.map((r) => r.id);
  const products = await prisma.product.findMany({ where: { id: { in: ids } }, include: cardInclude });
  const byId = new Map(products.map((p) => [p.id, p]));
  const total = totalRows[0]?.n ?? 0;
  const deptTotal = deptFacet.reduce((a, d) => a + d.count, 0);

  return {
    items: ids.map((id) => byId.get(id)).filter(Boolean).map((p) => productCard(p!)),
    total,
    facets: {
      departments: [{ slug: 'all', name: 'All', accentHex: '#FF4F8B', count: deptTotal }, ...deptFacet],
      brands: brandFacet,
      sizes: sortSizes(sizeFacet),
      colours: colourFacet,
      price: { min: priceRange[0]?.min ?? 0, max: priceRange[0]?.max ?? 0 },
    },
    query: { ...f, sort },
    headline: f.q ? `${total} results for "${f.q}" across ${deptFacet.length} department${deptFacet.length === 1 ? '' : 's'}` : null,
  };
}

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
function sortSizes(rows: { value: string; count: number }[]) {
  const rank = (v: string) => {
    const i = SIZE_ORDER.indexOf(v);
    if (i >= 0) return i;
    const n = parseFloat(v.replace(/[^\d.]/g, ''));
    return Number.isNaN(n) ? 999 : 100 + n;
  };
  return [...rows].sort((a, b) => rank(a.value) - rank(b.value));
}

/** Autocomplete, grouped by department. Empty q → trending products. */
export async function suggest(q: string) {
  const term = q.trim().slice(0, 60);
  return cache.wrap(`suggest:${term.toLowerCase()}`, 60, async () => {
    if (!term) {
      const trending = await prisma.product.findMany({
        where: { isActive: true, publicAt: null }, orderBy: { soldCount: 'desc' }, take: 8,
        select: { name: true, slug: true, department: { select: { slug: true, name: true, accentHex: true } } },
      });
      return { query: '', groups: [], trending: trending.map((t) => ({ name: t.name, slug: t.slug, department: t.department })) };
    }
    const tsq = toTsQuery(term);
    const rows = await prisma.$queryRaw<{ name: string; slug: string; image: string | null; price: number; dslug: string; dname: string; accent: string }[]>`
      SELECT p."name", p."slug", p."images"[1] AS image, p."basePrice" AS price,
             d."slug" AS dslug, d."name" AS dname, d."accentHex" AS accent
      FROM "Product" p JOIN "Department" d ON d."id" = p."departmentId"
      WHERE p."isActive" = true AND (p."publicAt" IS NULL OR p."publicAt" <= now()) AND (
        p."name" ILIKE ${term + '%'} OR p."name" ILIKE ${'% ' + term + '%'}
        OR word_similarity(${term}, p."name") > 0.4
        ${tsq ? Prisma.sql`OR p."searchVector" @@ to_tsquery('simple', ${tsq})` : Prisma.empty})
      ORDER BY (p."name" ILIKE ${term + '%'}) DESC, word_similarity(${term}, p."name") DESC, p."soldCount" DESC
      LIMIT 8`;
    const cats = await prisma.category.findMany({
      where: { name: { contains: term, mode: 'insensitive' } }, take: 4,
      select: { slug: true, name: true, department: { select: { slug: true, name: true } } },
    });
    const groups = new Map<string, { department: { slug: string; name: string; accentHex: string }; items: unknown[] }>();
    for (const r of rows) {
      if (!groups.has(r.dslug)) groups.set(r.dslug, { department: { slug: r.dslug, name: r.dname, accentHex: r.accent }, items: [] });
      groups.get(r.dslug)!.items.push({ name: r.name, slug: r.slug, image: r.image, price: r.price });
    }
    return { query: term, groups: [...groups.values()], categories: cats };
  });
}
