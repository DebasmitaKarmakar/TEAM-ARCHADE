/**
 * ADMIN COCKPIT — /api/v1/admin/*
 * ADMIN: everything · DEPT_MANAGER: own department only · SUPPORT: read + orders/refunds/reviews.
 */
import express, { Router } from 'express';
import { z } from 'zod';
import { cache } from '../../lib/cache';
import { prisma } from '../../lib/prisma';
import { requireAuth } from '../../middleware/auth';
import { assertCanEditCatalog, assertDeptAccess, deptScope, requireRole, STAFF } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import { AppError } from '../../utils/AppError';
import { pageMeta, param, requireUser, send } from '../../utils/http';
import { adjust } from '../inventory/inventory.service';
import { advanceShipment, cancelOrder, completeReturn, getOrderById, orderView } from '../order/order.service';
import { refundPayment } from '../payment/payment.service';
import { moderate } from '../review/review.service';
import * as cat from './admin.catalog';
import { dashboardStats } from './admin.stats';

export const adminRoutes = Router();
adminRoutes.use(requireAuth, requireRole(...STAFF));

const page = { page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(25) };

// ── Me / scope ───────────────────────────────────────────
adminRoutes.get('/me', async (req, res) => {
  const u = requireUser(req);
  const dept = u.deptId ? await prisma.department.findUnique({ where: { id: u.deptId }, select: { slug: true, name: true, accentHex: true } }) : null;
  send(res, {
    user: u,
    scope: dept ? { type: 'department', department: dept, banner: `You are managing: ${dept.name}` } : { type: 'all' },
    permissions: permissionMatrix(u.role),
  });
});

function permissionMatrix(role: string) {
  const all = { view: true, create: true, edit: true, delete: true };
  const read = { view: true, create: false, edit: false, delete: false };
  if (role === 'ADMIN') return { products: all, inventory: all, orders: all, coupons: all, reviews: all, users: all };
  if (role === 'DEPT_MANAGER') return { products: all, inventory: { ...all, delete: false }, orders: { ...read, edit: true }, coupons: { ...all, delete: false }, reviews: { ...read, edit: true }, users: { ...read, view: false } };
  return { products: read, inventory: read, orders: { ...read, edit: true }, coupons: read, reviews: { ...read, edit: true }, users: { ...read, view: false } };
}

// ── Dashboard ────────────────────────────────────────────
adminRoutes.get('/stats', validate({ query: z.object({ days: z.coerce.number().int().min(1).max(365).default(30), dept: z.string().optional() }) }), async (req, res) => {
  const u = requireUser(req);
  let deptId = deptScope(u);
  if (!deptId && res.locals.query.dept && res.locals.query.dept !== 'all') {
    deptId = (await prisma.department.findUnique({ where: { slug: res.locals.query.dept }, select: { id: true } }))?.id;
  }
  send(res, await dashboardStats({ days: res.locals.query.days, deptId }));
});

adminRoutes.get('/departments', async (_req, res) => {
  const depts = await prisma.department.findMany({ orderBy: { sortOrder: 'asc' }, include: { _count: { select: { products: true, managers: true } } } });
  send(res, depts);
});

// ── Products ─────────────────────────────────────────────
const variantSchema = z.object({
  id: z.string().optional(),
  sku: z.string().max(60).optional(),
  options: z.record(z.string().max(30)),
  price: z.number().int().positive(),
  mrp: z.number().int().positive(),
  stock: z.number().int().min(0),
  lowStockAt: z.number().int().min(0).optional(),
  image: z.string().url().nullish(),
  isActive: z.boolean().optional(),
});
const productSchema = z.object({
  name: z.string().trim().min(2).max(120),
  brand: z.string().trim().min(1).max(60),
  description: z.string().trim().min(5).max(4000),
  department: z.string(),
  category: z.string(),
  images: z.array(z.string().url()).max(10).optional(),
  attributes: z.record(z.unknown()).optional(),
  tags: z.array(z.string().max(40)).max(20).optional(),
  isActive: z.boolean().optional(),
  publicAt: z.string().datetime().nullish(),
  variants: z.array(variantSchema).min(1).max(200),
});

adminRoutes.get('/products', validate({
  query: z.object({ q: z.string().optional(), dept: z.string().optional(), status: z.enum(['active', 'draft']).optional(), lowStock: z.enum(['true', 'false']).optional().transform((v) => v === 'true'), ...page }),
}), async (req, res) => {
  const q = res.locals.query;
  const out = await cat.listProducts(requireUser(req), q);
  send(res, out.items, pageMeta(q.page, q.limit, out.total));
});

adminRoutes.get('/products/:id', async (req, res) => send(res, await cat.getProduct(requireUser(req), param(req, 'id'))));

adminRoutes.post('/products', validate({ body: productSchema }), async (req, res) => {
  const u = requireUser(req); assertCanEditCatalog(u);
  send(res, await cat.createProduct(u, res.locals.body), undefined, 201);
});

adminRoutes.patch('/products/:id', validate({ body: productSchema.omit({ variants: true }).partial() }), async (req, res) => {
  const u = requireUser(req); assertCanEditCatalog(u);
  send(res, await cat.updateProduct(u, param(req, 'id'), res.locals.body));
});

adminRoutes.put('/products/:id/variants', validate({ body: z.object({ variants: z.array(variantSchema).min(1).max(200) }) }), async (req, res) => {
  const u = requireUser(req); assertCanEditCatalog(u);
  send(res, await cat.replaceVariants(u, param(req, 'id'), res.locals.body.variants));
});

adminRoutes.delete('/products/:id', async (req, res) => {
  const u = requireUser(req); assertCanEditCatalog(u);
  send(res, await cat.archiveProduct(u, param(req, 'id')));
});

adminRoutes.post('/products/bulk', validate({ body: z.object({ ids: z.array(z.string()).min(1).max(500), action: z.enum(['activate', 'deactivate', 'price_pct']), value: z.number().optional() }) }), async (req, res) => {
  const u = requireUser(req); assertCanEditCatalog(u);
  send(res, await cat.bulkAction(u, res.locals.body.ids, res.locals.body.action, res.locals.body.value));
});

adminRoutes.post('/products/import', express.text({ type: ['text/csv', 'text/plain'], limit: '2mb' }), async (req, res) => {
  const u = requireUser(req); assertCanEditCatalog(u);
  if (typeof req.body !== 'string') throw new AppError(400, 'Send CSV with Content-Type: text/csv');
  send(res, await cat.importCsv(u, req.body), undefined, 201);
});

// ── Inventory ────────────────────────────────────────────
adminRoutes.get('/inventory', validate({ query: z.object({ q: z.string().optional(), dept: z.string().optional(), lowStock: z.enum(['true', 'false']).optional().transform((v) => v === 'true'), ...page }) }), async (req, res) => {
  const u = requireUser(req);
  const q = res.locals.query;
  const scope = deptScope(u);
  const where = {
    isActive: true,
    product: {
      ...(scope ? { departmentId: scope } : q.dept ? { department: { slug: q.dept } } : {}),
      ...(q.q ? { OR: [{ name: { contains: q.q, mode: 'insensitive' as const } }] } : {}),
    },
  };
  const rows = await prisma.variant.findMany({
    where, include: { product: { select: { id: true, name: true, code: true, images: true, department: { select: { slug: true, name: true, accentHex: true } } } } },
    orderBy: [{ product: { code: 'asc' } }, { sku: 'asc' }],
  });
  let items = rows.map((v) => ({
    id: v.id, sku: v.sku, options: v.options, product: v.product, price: v.price,
    stock: v.stock, reserved: v.reserved, available: v.stock - v.reserved, lowStockAt: v.lowStockAt,
    status: v.stock - v.reserved <= 0 ? 'out' : v.stock - v.reserved <= v.lowStockAt ? 'low' : 'ok',
  }));
  if (q.lowStock) items = items.filter((i) => i.status !== 'ok');
  if (q.q) items = items.filter((i) => i.sku.includes(q.q!.toUpperCase()) || i.product.name.toLowerCase().includes(q.q!.toLowerCase()));
  const total = items.length;
  send(res, items.slice((q.page - 1) * q.limit, q.page * q.limit), pageMeta(q.page, q.limit, total));
});

adminRoutes.patch('/variants/:id/stock', validate({
  body: z.object({ delta: z.number().int().optional(), stock: z.number().int().min(0).optional(), reason: z.enum(['RESTOCK', 'ADJUST']).optional() }).refine((b) => b.delta !== undefined || b.stock !== undefined, 'Send delta or stock'),
}), async (req, res) => {
  const u = requireUser(req); assertCanEditCatalog(u);
  const v = await prisma.variant.findUnique({ where: { id: param(req, 'id') }, include: { product: { select: { departmentId: true } } } });
  if (!v) throw new AppError(404, 'Variant not found');
  assertDeptAccess(u, v.product.departmentId);
  const updated = await adjust(v.id, res.locals.body, u.id);
  cache.invalidate('catalog:'); cache.invalidate('stats:');
  send(res, { ...updated, available: updated.stock - updated.reserved });
});

adminRoutes.get('/variants/:id/movements', async (req, res) => {
  const u = requireUser(req);
  const v = await prisma.variant.findUnique({ where: { id: param(req, 'id') }, include: { product: { select: { departmentId: true } } } });
  if (!v) throw new AppError(404, 'Variant not found');
  assertDeptAccess(u, v.product.departmentId);
  send(res, await prisma.stockMovement.findMany({ where: { variantId: v.id }, orderBy: { createdAt: 'desc' }, take: 100 }));
});

// ── Orders ───────────────────────────────────────────────
adminRoutes.get('/orders', validate({
  query: z.object({
    status: z.enum(['PENDING_PAYMENT', 'PLACED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']).optional(),
    dept: z.string().optional(), payment: z.enum(['UPI', 'CARD', 'COD']).optional(), q: z.string().optional(), ...page,
  }),
}), async (req, res) => {
  const u = requireUser(req);
  const q = res.locals.query;
  const scope = deptScope(u);
  const deptId = scope ?? (q.dept ? (await prisma.department.findUnique({ where: { slug: q.dept }, select: { id: true } }))?.id : undefined);
  const where = {
    ...(q.status ? { status: q.status } : { status: { not: 'PENDING_PAYMENT' as const } }),
    ...(q.payment ? { paymentMethod: q.payment } : {}),
    ...(deptId ? { items: { some: { departmentId: deptId } } } : {}),
    ...(q.q ? { OR: [{ orderNumber: { contains: q.q.toUpperCase() } }, { user: { email: { contains: q.q.toLowerCase() } } }, { user: { name: { contains: q.q, mode: 'insensitive' as const } } }] } : {}),
  };
  const [total, orders, depts] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where, orderBy: { createdAt: 'desc' }, skip: (q.page - 1) * q.limit, take: q.limit,
      include: { user: { select: { name: true, email: true } }, items: { select: { departmentId: true, qty: true } }, payment: { select: { status: true, provider: true } }, shipments: { select: { id: true, group: true, status: true } } },
    }),
    prisma.department.findMany({ select: { id: true, slug: true, accentHex: true } }),
  ]);
  const d = new Map(depts.map((x) => [x.id, x]));
  send(res, orders.map((o) => ({
    id: o.id, orderNumber: o.orderNumber, customer: o.user, total: o.total, status: o.status, createdAt: o.createdAt,
    paymentMethod: o.paymentMethod, paymentStatus: o.payment?.status ?? null,
    itemCount: o.items.reduce((a, i) => a + i.qty, 0),
    departments: [...new Map(o.items.map((i) => [i.departmentId, d.get(i.departmentId)])).values()].map((x) => ({ slug: x?.slug, accentHex: x?.accentHex })),
    shipments: o.shipments,
  })), pageMeta(q.page, q.limit, total));
});

adminRoutes.get('/orders/:id', async (req, res) => {
  const u = requireUser(req);
  const o = await getOrderById(param(req, 'id'));
  if (u.role === 'DEPT_MANAGER') assertDeptAccess(u, o.items.map((i) => i.departmentId));
  send(res, await orderView(o));
});

adminRoutes.patch('/shipments/:id/status', validate({
  body: z.object({ to: z.enum(['PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']).optional(), note: z.string().max(200).optional() }).default({}),
}), async (req, res) => {
  send(res, await advanceShipment(requireUser(req), param(req, 'id'), res.locals.body.to, res.locals.body.note));
  cache.invalidate('stats:');
});

adminRoutes.post('/orders/:id/cancel', validate({ body: z.object({ itemIds: z.array(z.string()).optional(), reason: z.string().max(200).optional() }).default({}) }), async (req, res) => {
  const u = requireUser(req);
  const o = await getOrderById(param(req, 'id'));
  if (u.role === 'DEPT_MANAGER') assertDeptAccess(u, o.items.map((i) => i.departmentId));
  send(res, await cancelOrder(u, o.id, res.locals.body.itemIds, res.locals.body.reason ?? 'Cancelled by store'));
});

adminRoutes.post('/orders/:id/returns/complete', validate({ body: z.object({ itemIds: z.array(z.string()).optional() }).default({}) }), async (req, res) => {
  send(res, await completeReturn(requireUser(req), param(req, 'id'), res.locals.body.itemIds));
});

adminRoutes.post('/orders/:id/refund', requireRole('ADMIN', 'SUPPORT'), validate({ body: z.object({ amount: z.number().int().positive().optional(), note: z.string().max(200).optional() }).default({}) }), async (req, res) => {
  const o = await getOrderById(param(req, 'id'));
  const amount = res.locals.body.amount ?? (o.payment ? o.payment.amount - o.payment.refundedAmount : 0);
  const r = await refundPayment(o.id, amount, res.locals.body.note ?? 'Manual refund', requireUser(req).id);
  send(res, { ...r, order: await orderView(await getOrderById(o.id)) });
});

// ── Coupons ──────────────────────────────────────────────
const couponSchema = z.object({
  code: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{3,20}$/),
  description: z.string().trim().min(3).max(120),
  type: z.enum(['PERCENT', 'FLAT', 'FREE_DELIVERY']),
  value: z.number().int().min(0),
  maxDiscount: z.number().int().positive().nullish(),
  minCart: z.number().int().min(0).default(0),
  department: z.string().nullish(),
  firstOrderOnly: z.boolean().default(false),
  membersOnly: z.boolean().default(false),
  usageLimit: z.number().int().positive().nullish(),
  perUserLimit: z.number().int().positive().default(1),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  isActive: z.boolean().default(true),
}).refine((c) => c.type !== 'PERCENT' || (c.value > 0 && c.value <= 90), 'Percent must be 1–90').refine((c) => new Date(c.endsAt) > new Date(c.startsAt), 'endsAt must be after startsAt');

async function couponDeptId(u: ReturnType<typeof requireUser>, slug?: string | null) {
  if (u.role === 'DEPT_MANAGER') return u.deptId; // managers can only create coupons for their department
  if (!slug) return null;
  const d = await prisma.department.findUnique({ where: { slug }, select: { id: true } });
  if (!d) throw new AppError(400, 'Unknown department');
  return d.id;
}

adminRoutes.get('/coupons', async (req, res) => {
  const scope = deptScope(requireUser(req));
  const coupons = await prisma.coupon.findMany({ where: scope ? { departmentId: scope } : {}, orderBy: { endsAt: 'desc' }, include: { department: { select: { slug: true, name: true, accentHex: true } } } });
  send(res, coupons.map((c) => ({ ...c, expired: c.endsAt < new Date(), usage: c.usageLimit ? `${c.usedCount}/${c.usageLimit}` : `${c.usedCount}/∞` })));
});

adminRoutes.post('/coupons', requireRole('ADMIN', 'DEPT_MANAGER'), validate({ body: couponSchema }), async (req, res) => {
  const u = requireUser(req);
  const { department, startsAt, endsAt, ...rest } = res.locals.body;
  const c = await prisma.coupon.create({ data: { ...rest, startsAt: new Date(startsAt), endsAt: new Date(endsAt), departmentId: await couponDeptId(u, department) } });
  send(res, c, undefined, 201);
});

adminRoutes.patch('/coupons/:id', requireRole('ADMIN', 'DEPT_MANAGER'), validate({
  body: z.object({ description: z.string().max(120).optional(), isActive: z.boolean().optional(), endsAt: z.string().datetime().optional(), usageLimit: z.number().int().positive().nullish(), maxDiscount: z.number().int().positive().nullish(), minCart: z.number().int().min(0).optional() }),
}), async (req, res) => {
  const u = requireUser(req);
  const c = await prisma.coupon.findUnique({ where: { id: param(req, 'id') } });
  if (!c) throw new AppError(404, 'Coupon not found');
  if (u.role === 'DEPT_MANAGER' && c.departmentId !== u.deptId) throw new AppError(403, 'Outside your department');
  const { endsAt, ...rest } = res.locals.body;
  send(res, await prisma.coupon.update({ where: { id: c.id }, data: { ...rest, ...(endsAt ? { endsAt: new Date(endsAt) } : {}) } }));
});

// ── Reviews moderation ───────────────────────────────────
adminRoutes.get('/reviews', validate({ query: z.object({ status: z.enum(['PUBLISHED', 'HIDDEN']).optional(), rating: z.coerce.number().int().min(1).max(5).optional(), dept: z.string().optional(), ...page }) }), async (req, res) => {
  const u = requireUser(req);
  const q = res.locals.query;
  const scope = deptScope(u);
  const where = {
    ...(q.status ? { status: q.status } : {}),
    ...(q.rating ? { rating: q.rating } : {}),
    product: scope ? { departmentId: scope } : q.dept ? { department: { slug: q.dept } } : {},
  };
  const [total, rows] = await Promise.all([
    prisma.review.count({ where }),
    prisma.review.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (q.page - 1) * q.limit, take: q.limit, include: { product: { select: { name: true, slug: true, department: { select: { slug: true } } } }, user: { select: { name: true, email: true } } } }),
  ]);
  send(res, rows, pageMeta(q.page, q.limit, total));
});

adminRoutes.patch('/reviews/:id', validate({ body: z.object({ status: z.enum(['PUBLISHED', 'HIDDEN']) }) }), async (req, res) => {
  const u = requireUser(req);
  const r = await prisma.review.findUnique({ where: { id: param(req, 'id') }, include: { product: { select: { departmentId: true } } } });
  if (!r) throw new AppError(404, 'Review not found');
  assertDeptAccess(u, r.product.departmentId);
  send(res, await moderate(r.id, res.locals.body.status));
});

// ── Customers & team (ADMIN) ─────────────────────────────
adminRoutes.get('/users', requireRole('ADMIN', 'SUPPORT'), validate({ query: z.object({ q: z.string().optional(), role: z.enum(['SHOPPER', 'DEPT_MANAGER', 'SUPPORT', 'ADMIN']).optional(), ...page }) }), async (req, res) => {
  const q = res.locals.query;
  const where = {
    ...(q.role ? { role: q.role } : {}),
    ...(q.q ? { OR: [{ email: { contains: q.q.toLowerCase() } }, { name: { contains: q.q, mode: 'insensitive' as const } }] } : {}),
  };
  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where, orderBy: [{ role: 'desc' }, { createdAt: 'desc' }], skip: (q.page - 1) * q.limit, take: q.limit,
      select: { id: true, name: true, email: true, role: true, memberUntil: true, createdAt: true, department: { select: { slug: true, name: true } }, _count: { select: { orders: true } } },
    }),
  ]);
  send(res, users, pageMeta(q.page, q.limit, total));
});

adminRoutes.patch('/users/:id', requireRole('ADMIN'), validate({ body: z.object({ role: z.enum(['SHOPPER', 'DEPT_MANAGER', 'SUPPORT', 'ADMIN']), department: z.string().nullish() }) }), async (req, res) => {
  const me = requireUser(req);
  const id = param(req, 'id');
  if (id === me.id && res.locals.body.role !== 'ADMIN') throw new AppError(400, "You can't remove your own admin role");
  let departmentId: string | null = null;
  if (res.locals.body.role === 'DEPT_MANAGER') {
    if (!res.locals.body.department) throw new AppError(400, 'Department managers need a department');
    departmentId = (await prisma.department.findUnique({ where: { slug: res.locals.body.department }, select: { id: true } }))?.id ?? null;
    if (!departmentId) throw new AppError(400, 'Unknown department');
  }
  const u = await prisma.user.update({ where: { id }, data: { role: res.locals.body.role, departmentId }, select: { id: true, name: true, email: true, role: true, department: { select: { slug: true, name: true } } } });
  // force re-login so the new role lands in the next token
  await prisma.refreshToken.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: new Date() } });
  send(res, u);
});
