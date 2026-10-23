import { discountPct } from '../../lib/money';

interface DeptLike { slug: string; name: string; accentHex: string; accent2Hex?: string | null }
interface VariantLike { id: string; sku: string; options: unknown; price: number; mrp: number; stock: number; reserved: number; lowStockAt: number; image: string | null; isActive: boolean }
interface ProductLike {
  id: string; slug: string; name: string; brand: string; images: string[]; tags: string[];
  basePrice: number; mrp: number; ratingAvg: number; ratingCount: number; soldCount: number; createdAt: Date;
  department: DeptLike; variants?: VariantLike[];
}

export const deptBrief = (d: DeptLike) => ({ slug: d.slug, name: d.name, accentHex: d.accentHex, accent2Hex: d.accent2Hex ?? null });

export const available = (v: Pick<VariantLike, 'stock' | 'reserved'>) => Math.max(0, v.stock - v.reserved);

export const optionsOf = (v: { options: unknown }) => (v.options ?? {}) as Record<string, string>;

/** Product card used in grids, carousels, search results. */
export function productCard(p: ProductLike) {
  const variants = (p.variants ?? []).filter((v) => v.isActive);
  const totalAvailable = variants.reduce((a, v) => a + available(v), 0);
  const colours = [...new Set(variants.map((v) => optionsOf(v).colour).filter(Boolean))];
  const badges: string[] = [];
  if (Date.now() - p.createdAt.getTime() < 14 * 86_400_000) badges.push('NEW');
  if (p.soldCount >= 25) badges.push('BESTSELLER');
  if (variants.length && totalAvailable > 0 && totalAvailable <= 5) badges.push('LOW_STOCK');
  if (variants.length && totalAvailable === 0) badges.push('OUT_OF_STOCK');
  if (p.tags.includes('early-access')) badges.push('MAGGY_PLUS');
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    department: deptBrief(p.department),
    image: p.images[0] ?? null,
    hoverImage: p.images[1] ?? null,
    price: p.basePrice,
    mrp: p.mrp,
    discountPct: discountPct(p.basePrice, p.mrp),
    rating: { avg: Math.round(p.ratingAvg * 10) / 10, count: p.ratingCount },
    colours,
    inStock: variants.length ? totalAvailable > 0 : true,
    defaultVariantId: variants.find((v) => available(v) > 0)?.id ?? variants[0]?.id ?? null,
    variantCount: variants.length,
    badges,
  };
}

export function variantView(v: VariantLike) {
  const a = available(v);
  return {
    id: v.id,
    sku: v.sku,
    options: optionsOf(v),
    price: v.price,
    mrp: v.mrp,
    discountPct: discountPct(v.price, v.mrp),
    available: a,
    inStock: a > 0 && v.isActive,
    lowStock: a > 0 && a <= v.lowStockAt,
    image: v.image,
  };
}

export const cardInclude = {
  department: true,
  variants: { select: { id: true, sku: true, options: true, price: true, mrp: true, stock: true, reserved: true, lowStockAt: true, image: true, isActive: true } },
} as const;
