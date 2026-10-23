import { DEPARTMENT_MOODS } from '../../config/departments';
import { cache } from '../../lib/cache';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/AppError';
import { alsoBought, completeTheLook } from '../recommend/recommend.service';
import { reviewSummary } from '../review/review.service';
import { cardInclude, deptBrief, optionsOf, productCard, variantView } from './serialize';

export async function listDepartments() {
  return cache.wrap('catalog:departments', 300, async () => {
    const depts = await prisma.department.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { products: { where: { isActive: true } } } },
        categories: { where: { parentId: null }, orderBy: { sortOrder: 'asc' }, select: { slug: true, name: true } },
        products: { where: { isActive: true }, orderBy: { soldCount: 'desc' }, take: 1, select: { images: true } },
      },
    });
    return depts.map((d, i) => ({
      ...deptBrief(d),
      number: String(i + 1).padStart(2, '0'),
      tagline: d.tagline,
      productCount: d._count.products,
      categories: d.categories,
      coverImage: d.products[0]?.images[0] ?? null,
    }));
  });
}

export async function departmentDetail(slug: string) {
  return cache.wrap(`catalog:dept:${slug}`, 300, async () => {
    const d = await prisma.department.findUnique({
      where: { slug },
      include: {
        categories: {
          where: { parentId: null }, orderBy: { sortOrder: 'asc' },
          include: { children: { orderBy: { sortOrder: 'asc' }, select: { slug: true, name: true } } },
        },
      },
    });
    if (!d || !d.isActive) throw new AppError(404, 'Department not found');
    const base = { departmentId: d.id, isActive: true, publicAt: null };
    const [bestsellers, newIn, topRated, count] = await Promise.all([
      prisma.product.findMany({ where: base, orderBy: { soldCount: 'desc' }, take: 8, include: cardInclude }),
      prisma.product.findMany({ where: base, orderBy: { createdAt: 'desc' }, take: 8, include: cardInclude }),
      prisma.product.findMany({ where: base, orderBy: { bayesScore: 'desc' }, take: 8, include: cardInclude }),
      prisma.product.count({ where: { departmentId: d.id, isActive: true } }),
    ]);
    const all = await listDepartments();
    const number = all.find((x) => x.slug === slug)?.number ?? '00';
    const pairs = await prisma.product.findMany({
      where: { isActive: true, publicAt: null, departmentId: { not: d.id } }, orderBy: { soldCount: 'desc' }, take: 16, include: cardInclude,
    });
    const seen = new Set<string>();
    const pairsWellWith = pairs.map(productCard).filter((c) => !seen.has(c.department.slug) && seen.add(c.department.slug)).slice(0, 4);
    return {
      department: { ...deptBrief(d), tagline: d.tagline, number: `DEPARTMENT ${number}`, productCount: count },
      categories: d.categories.map((c) => ({ slug: c.slug, name: c.name, children: c.children })),
      moods: DEPARTMENT_MOODS[slug] ?? [],
      rails: {
        bestsellers: bestsellers.map(productCard),
        newIn: newIn.map(productCard),
        topRated: topRated.map(productCard),
      },
      pairsWellWith,
    };
  });
}

/** Build {colour: [...], size: [...]} in first-seen order so the UI can render pickers. */
function optionAxes(variants: { options: unknown }[]) {
  const axes = new Map<string, string[]>();
  for (const v of variants) {
    for (const [k, val] of Object.entries(optionsOf(v))) {
      if (!axes.has(k)) axes.set(k, []);
      if (!axes.get(k)!.includes(val)) axes.get(k)!.push(val);
    }
  }
  return [...axes.entries()].map(([name, values]) => ({ name, values }));
}

export async function productDetail(slug: string, opts: { userId?: string; isMember?: boolean; size?: string }) {
  const p = await prisma.product.findUnique({
    where: { slug },
    include: {
      department: true,
      category: { include: { parent: { include: { parent: true } } } },
      variants: { where: { isActive: true }, orderBy: [{ price: 'asc' }, { sku: 'asc' }] },
    },
  });
  if (!p || !p.isActive) throw new AppError(404, 'Product not found');
  const early = p.publicAt && p.publicAt > new Date();
  if (early && !opts.isMember) throw new AppError(403, 'Early access for Maggy+ members', 'MEMBERS_ONLY');

  const breadcrumb = [{ name: 'Home', href: '/' }, { name: p.department.name, href: `/d/${p.department.slug}` }];
  const chain = [p.category.parent?.parent, p.category.parent, p.category].filter(Boolean) as { slug: string; name: string }[];
  for (const c of chain) breadcrumb.push({ name: c.name, href: `/search?category=${c.slug}` });

  const [ratings, look, also] = await Promise.all([
    reviewSummary(p.id),
    completeTheLook(p.id, opts.size),
    alsoBought(p.id),
  ]);
  if (opts.userId) {
    prisma.productView.create({ data: { userId: opts.userId, productId: p.id } }).catch(() => undefined);
  }

  return {
    ...productCard({ ...p, variants: p.variants }),
    code: p.code,
    description: p.description,
    images: p.images,
    attributes: p.attributes,
    tags: p.tags.filter((t) => !t.startsWith('look:')),
    category: { slug: p.category.slug, name: p.category.name },
    breadcrumb,
    optionAxes: optionAxes(p.variants),
    variants: p.variants.map(variantView),
    delivery: { freeAbove: 99_900, returnDays: 7, codAvailable: true },
    offers: [
      { code: 'MAGGY10', text: '10% off your first order (max ₹500)' },
      { code: 'FLAT200', text: '₹200 off on orders above ₹1,499' },
      ...(p.department.slug === 'electronics' ? [{ code: 'TECH15', text: '15% off Electronics (max ₹1,500)' }] : []),
      ...(p.department.slug === 'beauty' ? [{ code: 'GLOW20', text: '20% off Beauty (max ₹400)' }] : []),
    ],
    ratings,
    completeTheLook: look,
    alsoBought: also,
    earlyAccess: !!early,
  };
}

/** Delivery estimate for the PDP pincode checker (demo rules). */
export function deliveryEstimate(pincode: string, departmentSlug: string, isMember: boolean) {
  if (!/^\d{6}$/.test(pincode)) throw new AppError(400, 'Enter a valid 6-digit pincode');
  const metro = /^(11|40|56|60|70|50)/.test(pincode);
  const days = departmentSlug === 'grocery' ? 1 : departmentSlug === 'electronics' ? 2 : metro ? 2 : 4;
  const date = new Date(Date.now() + days * 86_400_000);
  return {
    pincode,
    serviceable: true,
    days,
    date,
    label: `Delivery by ${date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' })}`,
    free: isMember ? 'FREE for Maggy+' : 'FREE above ₹999',
    cod: true,
  };
}
