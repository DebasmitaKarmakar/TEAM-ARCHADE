/** Admin product & variant management (department-scoped for managers). */
import { cache } from '../../lib/cache';
import { prisma, type Db } from '../../lib/prisma';
import { assertDeptAccess } from '../../middleware/rbac';
import type { AuthUser } from '../../types/express';
import { AppError } from '../../utils/AppError';
import { slugify } from '../../utils/ids';
import { available, optionsOf } from '../catalog/serialize';

export interface VariantInput {
  id?: string;
  sku?: string;
  options: Record<string, string>;
  price: number; // paise
  mrp: number; // paise
  stock: number;
  lowStockAt?: number;
  image?: string | null;
  isActive?: boolean;
}

export interface ProductInput {
  name: string;
  brand: string;
  description: string;
  department: string; // slug
  category: string; // slug
  images?: string[];
  attributes?: Record<string, unknown>;
  tags?: string[];
  isActive?: boolean;
  publicAt?: string | null;
  variants: VariantInput[];
}

const invalidate = () => { cache.invalidate('catalog:'); cache.invalidate('suggest:'); cache.invalidate('rec:'); cache.invalidate('stats:'); };

export async function refreshProductPrice(db: Db, productId: string) {
  const v = await db.variant.findFirst({ where: { productId, isActive: true }, orderBy: { price: 'asc' } });
  if (v) await db.product.update({ where: { id: productId }, data: { basePrice: v.price, mrp: v.mrp } });
}

const skuPart = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) || 'X';
export const makeSku = (deptSlug: string, code: string, options: Record<string, string>) =>
  ['BM', deptSlug.slice(0, 3).toUpperCase(), code, ...Object.values(options).map(skuPart)].join('-');

async function resolveDeptCat(departmentSlug: string, categorySlug: string) {
  const dept = await prisma.department.findUnique({ where: { slug: departmentSlug } });
  if (!dept) throw new AppError(400, `Unknown department "${departmentSlug}"`);
  const cat = await prisma.category.findUnique({ where: { slug: categorySlug } });
  if (!cat || cat.departmentId !== dept.id) throw new AppError(400, `Unknown category "${categorySlug}" for ${dept.name}`);
  return { dept, cat };
}

async function nextCode(deptSlug: string) {
  const prefix = deptSlug[0].toUpperCase();
  const last = await prisma.product.findMany({ where: { code: { startsWith: prefix } }, select: { code: true } });
  const max = Math.max(0, ...last.map((p) => parseInt(p.code.slice(1), 10)).filter((n) => !Number.isNaN(n)));
  return `${prefix}${String(max + 1).padStart(2, '0')}`;
}

function validateVariants(vs: VariantInput[]) {
  if (!vs.length) throw new AppError(400, 'At least one variant is required');
  for (const v of vs) {
    if (v.price <= 0 || v.mrp < v.price) throw new AppError(400, 'Each variant needs price > 0 and MRP ≥ price');
    if (v.stock < 0) throw new AppError(400, 'Stock cannot be negative');
  }
  const keys = vs.map((v) => JSON.stringify(Object.entries(v.options).sort()));
  if (new Set(keys).size !== keys.length) throw new AppError(400, 'Two variants have the same options');
}

export async function listProducts(user: AuthUser, q: { q?: string; dept?: string; status?: 'active' | 'draft'; lowStock?: boolean; page: number; limit: number }) {
  const deptFilter = user.role === 'DEPT_MANAGER' ? { departmentId: user.deptId ?? '__none__' } : q.dept ? { department: { slug: q.dept } } : {};
  const where = {
    ...deptFilter,
    ...(q.status ? { isActive: q.status === 'active' } : {}),
    ...(q.q ? { OR: [{ name: { contains: q.q, mode: 'insensitive' as const } }, { brand: { contains: q.q, mode: 'insensitive' as const } }, { code: { equals: q.q.toUpperCase() } }, { variants: { some: { sku: { contains: q.q.toUpperCase() } } } }] } : {}),
  };
  const [total, rows] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where, orderBy: [{ department: { sortOrder: 'asc' } }, { code: 'asc' }], skip: (q.page - 1) * q.limit, take: q.limit,
      include: { department: true, category: true, variants: true },
    }),
  ]);
  let items = rows.map((p) => {
    const act = p.variants.filter((v) => v.isActive);
    const avail = act.reduce((a, v) => a + available(v), 0);
    return {
      id: p.id, code: p.code, slug: p.slug, name: p.name, brand: p.brand, image: p.images[0] ?? null,
      department: { slug: p.department.slug, name: p.department.name, accentHex: p.department.accentHex },
      category: { slug: p.category.slug, name: p.category.name },
      price: p.basePrice, mrp: p.mrp, variants: act.length,
      stock: act.reduce((a, v) => a + v.stock, 0), reserved: act.reduce((a, v) => a + v.reserved, 0), available: avail,
      stockLevel: avail < 5 ? 'red' : avail < 20 ? 'amber' : 'green',
      lowStockVariants: act.filter((v) => available(v) <= v.lowStockAt).length,
      isActive: p.isActive, soldCount: p.soldCount, rating: p.ratingAvg,
    };
  });
  if (q.lowStock) items = items.filter((i) => i.lowStockVariants > 0);
  return { total, items };
}

export async function getProduct(user: AuthUser, id: string) {
  const p = await prisma.product.findUnique({
    where: { id },
    include: { department: true, category: true, variants: { orderBy: { sku: 'asc' } } },
  });
  if (!p) throw new AppError(404, 'Product not found');
  assertDeptAccess(user, p.departmentId);
  return { ...p, variants: p.variants.map((v) => ({ ...v, options: optionsOf(v), available: available(v) })) };
}

export async function createProduct(user: AuthUser, input: ProductInput) {
  const { dept, cat } = await resolveDeptCat(input.department, input.category);
  assertDeptAccess(user, dept.id);
  validateVariants(input.variants);
  const code = await nextCode(dept.slug);
  let slug = slugify(`${input.name}`);
  if (await prisma.product.findUnique({ where: { slug }, select: { id: true } })) slug = `${slug}-${code.toLowerCase()}`;
  const cheapest = [...input.variants].sort((a, b) => a.price - b.price)[0];

  const product = await prisma.$transaction(async (tx) => {
    const p = await tx.product.create({
      data: {
        slug, code, name: input.name, brand: input.brand, description: input.description,
        departmentId: dept.id, categoryId: cat.id, images: input.images ?? [], attributes: (input.attributes ?? {}) as object,
        tags: input.tags ?? [], isActive: input.isActive ?? true, publicAt: input.publicAt ? new Date(input.publicAt) : null,
        basePrice: cheapest.price, mrp: cheapest.mrp,
      },
    });
    for (const v of input.variants) {
      const created = await tx.variant.create({
        data: {
          productId: p.id, sku: v.sku ?? makeSku(dept.slug, code, v.options), options: v.options, price: v.price, mrp: v.mrp,
          stock: v.stock, lowStockAt: v.lowStockAt ?? 5, image: v.image ?? null, isActive: v.isActive ?? true,
        },
      });
      if (v.stock > 0) await tx.stockMovement.create({ data: { variantId: created.id, delta: v.stock, reason: 'RESTOCK', actorId: user.id } });
    }
    return p;
  });
  invalidate();
  return getProduct(user, product.id);
}

export async function updateProduct(user: AuthUser, id: string, input: Partial<Omit<ProductInput, 'variants'>>) {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Product not found');
  assertDeptAccess(user, existing.departmentId);
  let departmentId: string | undefined;
  let categoryId: string | undefined;
  if (input.department || input.category) {
    const currentDept = await prisma.department.findUniqueOrThrow({ where: { id: existing.departmentId } });
    const currentCat = await prisma.category.findUniqueOrThrow({ where: { id: existing.categoryId } });
    const r = await resolveDeptCat(input.department ?? currentDept.slug, input.category ?? currentCat.slug);
    assertDeptAccess(user, r.dept.id);
    departmentId = r.dept.id; categoryId = r.cat.id;
  }
  await prisma.product.update({
    where: { id },
    data: {
      name: input.name, brand: input.brand, description: input.description, images: input.images,
      attributes: input.attributes as object | undefined, tags: input.tags, isActive: input.isActive,
      publicAt: input.publicAt === undefined ? undefined : input.publicAt ? new Date(input.publicAt) : null,
      departmentId, categoryId,
    },
  });
  invalidate();
  return getProduct(user, id);
}

/** Replace the variant matrix: update by id, create new, deactivate missing (kept for order history). */
export async function replaceVariants(user: AuthUser, productId: string, variants: VariantInput[]) {
  const p = await prisma.product.findUnique({ where: { id: productId }, include: { variants: true, department: true } });
  if (!p) throw new AppError(404, 'Product not found');
  assertDeptAccess(user, p.departmentId);
  validateVariants(variants);
  await prisma.$transaction(async (tx) => {
    const keep = new Set<string>();
    for (const v of variants) {
      const match = v.id ? p.variants.find((x) => x.id === v.id) : p.variants.find((x) => JSON.stringify(optionsOf(x)) === JSON.stringify(v.options));
      if (match) {
        keep.add(match.id);
        if (v.stock < match.reserved) throw new AppError(409, `Stock for ${match.sku} can't go below reserved (${match.reserved})`);
        await tx.variant.update({
          where: { id: match.id },
          data: { options: v.options, price: v.price, mrp: v.mrp, stock: v.stock, lowStockAt: v.lowStockAt ?? match.lowStockAt, image: v.image ?? match.image, isActive: v.isActive ?? true },
        });
        if (v.stock !== match.stock) await tx.stockMovement.create({ data: { variantId: match.id, delta: v.stock - match.stock, reason: 'ADJUST', actorId: user.id } });
      } else {
        const created = await tx.variant.create({
          data: { productId, sku: v.sku ?? makeSku(p.department.slug, p.code, v.options), options: v.options, price: v.price, mrp: v.mrp, stock: v.stock, lowStockAt: v.lowStockAt ?? 5, image: v.image ?? null },
        });
        keep.add(created.id);
        if (v.stock > 0) await tx.stockMovement.create({ data: { variantId: created.id, delta: v.stock, reason: 'RESTOCK', actorId: user.id } });
      }
    }
    await tx.variant.updateMany({ where: { productId, id: { notIn: [...keep] } }, data: { isActive: false } });
    await refreshProductPrice(tx, productId);
  });
  invalidate();
  return getProduct(user, productId);
}

export async function archiveProduct(user: AuthUser, id: string) {
  const p = await prisma.product.findUnique({ where: { id } });
  if (!p) throw new AppError(404, 'Product not found');
  assertDeptAccess(user, p.departmentId);
  await prisma.product.update({ where: { id }, data: { isActive: false } });
  invalidate();
  return { ok: true, archived: id };
}

export async function bulkAction(user: AuthUser, ids: string[], action: 'activate' | 'deactivate' | 'price_pct', value?: number) {
  const products = await prisma.product.findMany({ where: { id: { in: ids } }, select: { id: true, departmentId: true } });
  for (const p of products) assertDeptAccess(user, p.departmentId);
  if (action === 'activate' || action === 'deactivate') {
    await prisma.product.updateMany({ where: { id: { in: ids } }, data: { isActive: action === 'activate' } });
  } else {
    if (value === undefined || value < -90 || value > 200) throw new AppError(400, 'price_pct needs a value between -90 and 200');
    await prisma.$transaction(async (tx) => {
      // never above MRP, never below ₹1
      await tx.$executeRaw`
        UPDATE "Variant" SET "price" = LEAST("mrp", GREATEST(100, ROUND("price" * (100 + ${value}) / 100.0)::int))
        WHERE "productId" = ANY(${ids})`;
      for (const id of ids) await refreshProductPrice(tx, id);
    });
  }
  invalidate();
  return { ok: true, count: products.length };
}

/**
 * CSV import. Header:
 * name,brand,department,category,description,price,mrp,stock,options,image,tags
 * price/mrp in RUPEES; options like "size=M;colour=Ivory"; tags like "festive|ethnic".
 * Rows with the same name+brand become variants of one product.
 */
export async function importCsv(user: AuthUser, csvText: string) {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) throw new AppError(400, 'CSV needs a header and at least one row');
  const header = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  const need = ['name', 'brand', 'department', 'category', 'price', 'mrp', 'stock'];
  for (const n of need) if (!header.includes(n)) throw new AppError(400, `CSV is missing column "${n}"`);
  const groups = new Map<string, ProductInput>();
  const errors: { line: number; error: string }[] = [];
  lines.slice(1).forEach((line, i) => {
    const cells = parseCsvLine(line);
    const row = Object.fromEntries(header.map((h, j) => [h, (cells[j] ?? '').trim()]));
    const price = Math.round(Number(row.price) * 100);
    const mrp = Math.round(Number(row.mrp) * 100);
    const stock = parseInt(row.stock, 10);
    if (!row.name || !price || !mrp || Number.isNaN(stock)) { errors.push({ line: i + 2, error: 'name, price, mrp and stock are required' }); return; }
    const options = Object.fromEntries((row.options || 'default=Standard').split(';').map((kv) => kv.split('=').map((s) => s.trim())).filter((kv) => kv.length === 2 && kv[0]));
    const key = `${row.name}|${row.brand}`;
    if (!groups.has(key)) {
      groups.set(key, {
        name: row.name, brand: row.brand, department: row.department, category: row.category,
        description: row.description || row.name, images: row.image ? [row.image] : [],
        tags: row.tags ? row.tags.split('|').map((t) => t.trim()).filter(Boolean) : [], variants: [],
      });
    }
    groups.get(key)!.variants.push({ options, price, mrp, stock });
  });
  const created: string[] = [];
  for (const [key, input] of groups) {
    try { created.push((await createProduct(user, input)).id); }
    catch (e) { errors.push({ line: 0, error: `${key}: ${(e as Error).message}` }); }
  }
  return { created: created.length, productIds: created, errors };
}

function parseCsvLine(line: string) {
  const out: string[] = [];
  let cur = '';
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (q) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') q = false;
      else cur += ch;
    } else if (ch === '"') q = true;
    else if (ch === ',') { out.push(cur); cur = ''; }
    else cur += ch;
  }
  out.push(cur);
  return out;
}
