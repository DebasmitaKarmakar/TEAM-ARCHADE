/**
 * BLOWMAGGY demo seed — deterministic (same data every run).
 *   npm run db:seed    → wipe + seed
 *   npm run db:reset   → same (alias, use before every demo)
 *
 * Creates: 6 departments · 73 products (~400 variants) · 46 users · 9 coupons · 3 bundles
 *          ~150 historic orders over 30 days · reviews · co-purchase matrix · low-stock alerts
 */
import bcrypt from 'bcryptjs';
import type { OrderStatus, PaymentMethod } from '../../src/generated/prisma/enums';
import { prisma } from '../../src/lib/prisma';
import { makeSku } from '../../src/modules/admin/admin.catalog';
import { notifyStaff } from '../../src/modules/notification/notification.service';
import { deriveOrderStatus } from '../../src/modules/order/stateMachine';
import { priceCart, type BundleInput, type CouponInput } from '../../src/modules/pricing/pricing';
import { rebuildCoPurchase } from '../../src/modules/recommend/recommend.service';
import { bayes } from '../../src/modules/review/review.service';
import { CATEGORIES, DEPARTMENTS } from './data/departments';
import { CITIES, DEMO_ADDRESSES, DEMO_PASSWORD, DEMO_USERS, FIRST, LAST } from './data/people';
import { DEPT_BLURB, PRODUCTS } from './data/products';
import { BUNDLES, COUPONS, REVIEW_TEMPLATES, SHOWCASE_REVIEWS, couponWindow } from './data/promos';
import { createRng, cross } from './random';

const rng = createRng();
const DAY = 86_400_000;
const NOW = Date.now();
const paise = (r: number) => Math.round(r * 100);

const img = (text: string, bg: string, fg = 'FFFFFF') =>
  `https://placehold.co/800x1000/${bg.replace('#', '')}/${fg}/png?font=playfair-display&text=${encodeURIComponent(text)}`;

interface MemVariant { id: string; productId: string; sku: string; options: Record<string, string>; price: number; mrp: number; finalStock: number; sold: number; restocked: number }
interface MemProduct { id: string; code: string; name: string; brand: string; deptSlug: string; deptId: string; images: string[]; variants: MemVariant[]; sold: number; tags: string[] }

async function wipe() {
  const tables = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'`;
  if (tables.length) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables.map((t) => `"${t.tablename}"`).join(', ')} RESTART IDENTITY CASCADE`);
  }
}

async function main() {
  const t0 = Date.now();
  console.log('🧹 wiping…');
  await wipe();

  // ── Departments & categories ───────────────────────────
  console.log('🏬 departments & categories');
  const deptBySlug = new Map<string, { id: string; accentHex: string; accent2Hex: string }>();
  for (const d of DEPARTMENTS) {
    const row = await prisma.department.create({ data: { ...d } });
    deptBySlug.set(d.slug, { id: row.id, accentHex: d.accentHex, accent2Hex: d.accent2Hex });
  }
  const catBySlug = new Map<string, string>();
  for (const [deptSlug, parents] of Object.entries(CATEGORIES)) {
    const departmentId = deptBySlug.get(deptSlug)!.id;
    for (const [pi, [pslug, pname, children]] of parents.entries()) {
      const parent = await prisma.category.create({ data: { slug: pslug, name: pname, departmentId, sortOrder: pi } });
      catBySlug.set(pslug, parent.id);
      for (const [ci, [cslug, cname]] of children.entries()) {
        const c = await prisma.category.create({ data: { slug: cslug, name: cname, departmentId, parentId: parent.id, sortOrder: ci } });
        catBySlug.set(cslug, c.id);
      }
    }
  }

  // ── Users & addresses ──────────────────────────────────
  console.log('👤 users');
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const userByKey = new Map<string, { id: string; isMember: boolean; name: string }>();
  for (const u of DEMO_USERS) {
    const row = await prisma.user.create({
      data: {
        email: u.email, name: u.name, phone: u.phone, passwordHash, role: u.role,
        departmentId: 'dept' in u ? deptBySlug.get(u.dept)!.id : null,
        ...('member' in u && u.member ? { memberUntil: new Date(NOW + 30 * DAY), memberPlan: 'MONTHLY' as const } : {}),
      },
    });
    userByKey.set(u.key, { id: row.id, isMember: 'member' in u && !!u.member, name: u.name });
  }
  const shoppers: { id: string; isMember: boolean; name: string; city: (typeof CITIES)[number] }[] = [];
  for (let i = 1; i <= 40; i++) {
    const name = `${FIRST[i - 1]} ${rng.pick(LAST)}`;
    const isMember = i % 8 === 0;
    const row = await prisma.user.create({
      data: {
        email: `user${String(i).padStart(2, '0')}@blowmaggy.demo`, name, passwordHash, phone: `98${String(10000000 + i * 7919).slice(0, 8)}`,
        createdAt: new Date(NOW - rng.int(35, 120) * DAY),
        ...(isMember ? { memberUntil: new Date(NOW + rng.int(5, 300) * DAY), memberPlan: rng.chance(0.5) ? ('YEARLY' as const) : ('MONTHLY' as const) } : {}),
      },
    });
    shoppers.push({ id: row.id, isMember, name, city: rng.pick(CITIES) });
  }
  for (const [key, list] of Object.entries(DEMO_ADDRESSES)) {
    for (const a of list) await prisma.address.create({ data: { ...a, userId: userByKey.get(key)!.id } });
  }
  await prisma.address.createMany({
    data: shoppers.map((s, i) => ({
      userId: s.id, label: 'Home', name: s.name, phone: '98' + String(70000000 + i * 1237).slice(0, 8),
      line1: `${rng.int(1, 220)}, ${rng.pick(['MG Road', 'Station Road', 'Lake View Lane', 'Park Street', 'Church Road', 'Hill Side Colony'])}`,
      city: s.city.city, state: s.city.state, pincode: s.city.pincode, isDefault: true,
    })),
  });

  // ── Products & variants ────────────────────────────────
  console.log('🛍  products & variants');
  const products = new Map<string, MemProduct>();
  const skus = new Set<string>();
  for (const p of PRODUCTS) {
    const dept = deptBySlug.get(p.dept)!;
    const categoryId = catBySlug.get(p.cat);
    if (!categoryId) throw new Error(`Unknown category ${p.cat} for ${p.code}`);
    const combos = p.axes ? cross(p.axes) : [{ option: 'Standard' }];
    const variants = combos.map((options) => {
      const vals = Object.values(options);
      const priced = vals.map((v) => p.prices?.[v]).find(Boolean);
      const key = vals.join('|');
      const override = p.overrides?.[key] ?? vals.map((v) => p.overrides?.[v]).find((x) => x !== undefined);
      const stock = override ?? (Array.isArray(p.stock) ? rng.int(p.stock[0], p.stock[1]) : p.stock);
      let sku = makeSku(p.dept, p.code, options);
      for (let i = 2; skus.has(sku); i++) sku = `${makeSku(p.dept, p.code, options)}-${i}`;
      skus.add(sku);
      return { options, price: paise(priced?.[0] ?? p.price), mrp: paise(priced?.[1] ?? p.mrp), stock, sku };
    });
    const cheapest = [...variants].sort((a, b) => a.price - b.price)[0];
    const images = [img(p.name, dept.accentHex), img(p.brand, dept.accent2Hex, '16131C'), img(p.code, '15131C')];
    const slug = p.name.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const createdAt = new Date(NOW - (p.newIn ? rng.int(2, 10) : rng.int(20, 75)) * DAY);
    const row = await prisma.product.create({
      data: {
        code: p.code, slug, name: p.name, brand: p.brand,
        description: p.description ?? `${p.name} by ${p.brand}. ${DEPT_BLURB[p.dept]}`,
        departmentId: dept.id, categoryId, images, attributes: (p.attributes ?? {}) as object, tags: p.tags,
        basePrice: cheapest.price, mrp: cheapest.mrp, createdAt,
      },
    });
    await prisma.variant.createMany({
      data: variants.map((v) => ({ productId: row.id, sku: v.sku, options: v.options, price: v.price, mrp: v.mrp, stock: v.stock, lowStockAt: p.lowStockAt ?? 5 })),
    });
    const vrows = await prisma.variant.findMany({ where: { productId: row.id } });
    products.set(p.code, {
      id: row.id, code: p.code, name: p.name, brand: p.brand, deptSlug: p.dept, deptId: dept.id, images, tags: p.tags, sold: 0,
      variants: vrows.map((v) => ({ id: v.id, productId: row.id, sku: v.sku, options: v.options as Record<string, string>, price: v.price, mrp: v.mrp, finalStock: v.stock, sold: 0, restocked: 0 })),
    });
  }
  const productById = new Map([...products.values()].map((p) => [p.id, p]));

  // ── Coupons & bundles ──────────────────────────────────
  console.log('🎟  coupons & bundles');
  const coupons = new Map<string, CouponInput>();
  for (const c of COUPONS) {
    const row = await prisma.coupon.create({
      data: {
        code: c.code, description: c.description, type: c.type,
        value: c.type === 'FLAT' ? paise(c.value) : c.value,
        maxDiscount: 'maxDiscount' in c ? paise(c.maxDiscount) : null,
        minCart: paise(c.minCart),
        departmentId: 'dept' in c ? deptBySlug.get(c.dept)!.id : null,
        firstOrderOnly: 'firstOrderOnly' in c ? c.firstOrderOnly : false,
        membersOnly: 'membersOnly' in c ? c.membersOnly : false,
        usageLimit: 'usageLimit' in c ? c.usageLimit : null,
        perUserLimit: 'perUserLimit' in c ? c.perUserLimit : 1,
        ...couponWindow('expired' in c ? c.expired : false),
      },
    });
    coupons.set(c.code, { ...row, type: row.type });
  }
  const bundles: BundleInput[] = [];
  for (const b of BUNDLES) {
    const row = await prisma.bundle.create({
      data: { slug: b.slug, name: b.name, description: b.description, discountPct: b.discountPct, image: img(b.name, '#8B5CF6') },
    });
    const ids = b.codes.map((c) => products.get(c)!.id);
    await prisma.bundleItem.createMany({ data: ids.map((productId) => ({ bundleId: row.id, productId })) });
    bundles.push({ slug: b.slug, name: b.name, discountPct: b.discountPct, productIds: ids });
  }

  // ── Historic orders ────────────────────────────────────
  console.log('📦 historic orders');
  const paidOrders = new Map<string, number>();
  const couponUses = new Map<string, number>(); // `${userId}:${code}`
  const deliveredBuyers = new Map<string, Set<string>>(); // productId → userIds
  const orderNumbers = new Set<string>();
  let orderSeq = 0;
  const stats = { orders: 0, multi: 0, cancelled: 0, returned: 0 };

  // shipment speed (days from order) for each step
  const SPEED: Record<string, Partial<Record<OrderStatus, number>>> = {
    general: { PACKED: 0.3, SHIPPED: 1, OUT_FOR_DELIVERY: 2.6, DELIVERED: 3 },
    electronics: { PACKED: 0.2, SHIPPED: 0.7, OUT_FOR_DELIVERY: 1.7, DELIVERED: 2 },
    grocery: { PACKED: 0.3, SHIPPED: 0.6, OUT_FOR_DELIVERY: 0.8, DELIVERED: 1 },
  };
  const STEPS: OrderStatus[] = ['PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];

  async function createHistoricOrder(opts: {
    userId: string; isMember: boolean; createdAt: Date; lines: { v: MemVariant; p: MemProduct; qty: number }[];
    couponCode?: string; method: PaymentMethod; fate?: 'cancel' | 'return'; address: Record<string, string | null>;
  }) {
    const coupon = opts.couponCode ? coupons.get(opts.couponCode)! : null;
    const price = priceCart({
      lines: opts.lines.map(({ v, p, qty }) => ({ variantId: v.id, productId: p.id, departmentId: p.deptId, departmentSlug: p.deptSlug, unitPrice: v.price, qty })),
      coupon: coupon ? { ...coupon, usedCount: 0 } : null,
      user: { isMember: opts.isMember, paidOrderCount: paidOrders.get(opts.userId) ?? 0, couponUses: coupon ? couponUses.get(`${opts.userId}:${coupon.code}`) ?? 0 : 0 },
      bundles,
      now: opts.createdAt,
    });
    const couponApplied = !!price.coupon?.applied && opts.fate !== 'cancel';
    const ageDays = (NOW - opts.createdAt.getTime()) / DAY;
    const created = opts.createdAt.getTime();

    let orderNumber: string;
    do {
      const d = opts.createdAt;
      orderNumber = `BM-${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${rng.int(10000, 99999)}`;
    } while (orderNumbers.has(orderNumber));
    orderNumbers.add(orderNumber);
    orderSeq++;

    const order = await prisma.order.create({
      data: {
        orderNumber, userId: opts.userId, status: 'PLACED', addressSnapshot: opts.address,
        subtotal: price.subtotal, discountTotal: price.discountTotal, couponCode: couponApplied ? coupon!.code : null,
        couponDiscount: price.couponDiscount, memberSavings: price.memberSavings, deliveryFee: price.deliveryFee,
        tax: price.tax, total: price.total, paymentMethod: opts.method, idempotencyKey: `seed-${orderSeq}`,
        createdAt: opts.createdAt, updatedAt: opts.createdAt,
      },
    });
    const events: { orderId: string; shipmentId: string | null; fromStatus: OrderStatus | null; toStatus: OrderStatus; note: string; createdAt: Date; actorId?: string }[] = [
      { orderId: order.id, shipmentId: null, fromStatus: null, toStatus: 'PENDING_PAYMENT', note: `Order created · ${price.lines.length} items`, createdAt: opts.createdAt },
      { orderId: order.id, shipmentId: null, fromStatus: 'PENDING_PAYMENT', toStatus: 'PLACED', note: opts.method === 'COD' ? 'Order placed — Cash on Delivery' : 'Payment captured (seed)', createdAt: new Date(created + 60_000) },
    ];

    const shipStatuses: OrderStatus[] = [];
    const lineByVariant = new Map(price.lines.map((l) => [l.variantId, l]));
    let returnedAmount = 0;
    for (const g of price.groups) {
      let status: OrderStatus = 'PLACED';
      const speed = SPEED[g.group] ?? SPEED.general;
      const timeline: { st: OrderStatus; at: Date }[] = [];
      if (opts.fate === 'cancel') {
        status = 'CANCELLED';
        timeline.push({ st: 'CANCELLED', at: new Date(created + 0.15 * DAY) });
      } else {
        for (const st of STEPS) {
          const at = (speed[st] ?? 99) + (rng.next() - 0.5) * 0.2;
          if (at <= ageDays) { status = st; timeline.push({ st, at: new Date(created + at * DAY) }); }
        }
      }
      const shipment = await prisma.shipment.create({
        data: {
          orderId: order.id, group: g.group, status, slot: g.needsSlot ? rng.pick(['Tomorrow 7–9 AM', 'Tomorrow 5–7 PM']) : null,
          eta: new Date(created + (speed.DELIVERED ?? 3) * DAY),
          trackingNo: ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(status) ? `BMX${rng.int(100000, 999999)}` : null,
          deliveredAt: status === 'DELIVERED' ? timeline.find((t) => t.st === 'DELIVERED')!.at : null,
        },
      });
      let prev: OrderStatus = 'PLACED';
      for (const t of timeline) {
        events.push({ orderId: order.id, shipmentId: shipment.id, fromStatus: prev, toStatus: t.st, note: t.st === 'CANCELLED' ? 'Cancelled by customer' : t.st.replace(/_/g, ' ').toLowerCase(), createdAt: t.at });
        prev = t.st;
      }
      const items = opts.lines.filter(({ v }) => g.variantIds.includes(v.id));
      await prisma.orderItem.createMany({
        data: items.map(({ v, p, qty }) => {
          const l = lineByVariant.get(v.id)!;
          return {
            orderId: order.id, shipmentId: shipment.id, variantId: v.id, productId: p.id, departmentId: p.deptId,
            nameSnapshot: p.name, brandSnapshot: p.brand, optionsSnapshot: v.options, imageSnapshot: p.images[0],
            unitPrice: v.price, qty, lineDiscount: l.discount, lineTotal: l.net, status,
          };
        }),
      });
      // stock bookkeeping (movements are written at the end)
      for (const { v, p, qty } of items) {
        v.sold += qty;
        if (opts.fate === 'cancel') v.restocked += qty; else p.sold += qty;
        if (status === 'DELIVERED') {
          if (!deliveredBuyers.has(p.id)) deliveredBuyers.set(p.id, new Set());
          deliveredBuyers.get(p.id)!.add(opts.userId);
        }
      }
      shipStatuses.push(status);
    }

    // a return on one delivered item
    if (opts.fate === 'return') {
      const deliveredItems = await prisma.orderItem.findMany({ where: { orderId: order.id, status: 'DELIVERED' } });
      if (deliveredItems.length) {
        const it = rng.pick(deliveredItems);
        await prisma.orderItem.update({ where: { id: it.id }, data: { status: 'RETURNED' } });
        const v = productById.get(it.productId)!.variants.find((x) => x.id === it.variantId)!;
        v.restocked += it.qty;
        returnedAmount = it.lineTotal;
        const delivered = await prisma.shipment.findUniqueOrThrow({ where: { id: it.shipmentId! } });
        const t1 = new Date(Math.min(NOW - DAY, delivered.deliveredAt!.getTime() + DAY));
        events.push({ orderId: order.id, shipmentId: null, fromStatus: null, toStatus: 'RETURN_REQUESTED', note: `Return requested (size issue): ${it.nameSnapshot}`, createdAt: t1 });
        events.push({ orderId: order.id, shipmentId: null, fromStatus: null, toStatus: 'RETURNED', note: `Return received: ${it.nameSnapshot}`, createdAt: new Date(t1.getTime() + DAY / 2) });
        stats.returned++;
      }
    }

    const status = deriveOrderStatus(shipStatuses);
    await prisma.order.update({ where: { id: order.id }, data: { status } });
    await prisma.orderEvent.createMany({ data: events });
    const codCollected = opts.method === 'COD' && status === 'DELIVERED';
    await prisma.payment.create({
      data: {
        orderId: order.id, provider: opts.method === 'COD' ? 'cod' : 'razorpay', method: opts.method,
        providerOrderId: opts.method === 'COD' ? `cod_${orderNumber}` : `seed_order_${orderSeq}`,
        providerPaymentId: opts.method === 'COD' ? null : `pay_seed_${orderSeq}`,
        amount: price.total,
        refundedAmount: opts.fate === 'cancel' && opts.method !== 'COD' ? price.total : returnedAmount,
        status: opts.fate === 'cancel' ? (opts.method === 'COD' ? 'FAILED' : 'REFUNDED')
          : returnedAmount ? 'PARTIALLY_REFUNDED' : opts.method === 'COD' && !codCollected ? 'CREATED' : 'CAPTURED',
        createdAt: opts.createdAt,
      },
    });
    if (couponApplied) {
      await prisma.couponRedemption.create({ data: { couponId: coupon!.id, userId: opts.userId, orderId: order.id, amount: price.couponDiscount, createdAt: opts.createdAt } });
      couponUses.set(`${opts.userId}:${coupon!.code}`, (couponUses.get(`${opts.userId}:${coupon!.code}`) ?? 0) + 1);
      coupons.get(coupon!.code)!.usedCount += 1;
    }
    if (opts.fate !== 'cancel') paidOrders.set(opts.userId, (paidOrders.get(opts.userId) ?? 0) + 1);
    stats.orders++;
    if (new Set(opts.lines.map((l) => l.p.deptSlug)).size >= 2) stats.multi++;
    if (opts.fate === 'cancel') stats.cancelled++;
    return order;
  }

  const pickVariant = (p: MemProduct) => rng.pick(p.variants);
  const byDept = (slug: string) => [...products.values()].filter((p) => p.deptSlug === slug);
  const DEPT_WEIGHTS = [['electronics', 22], ['fashion', 26], ['home', 14], ['beauty', 16], ['grocery', 14], ['kids', 8]] as const;
  const addr = (s: { name: string; city: (typeof CITIES)[number] }) => ({ label: 'Home', name: s.name, phone: '9800000000', line1: '12 Main Road', line2: null, landmark: null, city: s.city.city, state: s.city.state, pincode: s.city.pincode });

  // Kabir (Maggy+): one delivered order (festive look) + one in transit
  const kabir = userByKey.get('kabir')!;
  const { isDefault: _d, ...kabirBase } = DEMO_ADDRESSES.kabir[0];
  const kabirAddr = { ...kabirBase, line2: kabirBase.line2 ?? null, landmark: null };
  const P = (code: string) => products.get(code)!;
  const V = (code: string, match: Record<string, string>) => P(code).variants.find((v) => Object.entries(match).every(([k, val]) => v.options[k] === val))!;
  await createHistoricOrder({
    userId: kabir.id, isMember: true, createdAt: new Date(NOW - 12 * DAY), method: 'UPI', address: kabirAddr,
    lines: [
      { p: P('F01'), v: V('F01', { size: 'M', colour: 'Blush' }), qty: 1 },
      { p: P('B01'), v: V('B01', { shade: 'Rosewood' }), qty: 1 },
      { p: P('E01'), v: V('E01', { colour: 'Frost', edition: 'Standard' }), qty: 1 },
    ],
  });
  await createHistoricOrder({
    userId: kabir.id, isMember: true, createdAt: new Date(NOW - 1.2 * DAY), method: 'CARD', address: kabirAddr,
    lines: [
      { p: P('E08'), v: V('E08', { colour: 'Graphite' }), qty: 1 },
      { p: P('H01'), v: V('H01', { finish: 'Terracotta' }), qty: 1 },
      { p: P('G06'), v: P('G06').variants[0], qty: 2 },
    ],
  });

  // 148 orders from generated shoppers, last 30 days (more on weekends, upward trend)
  for (let i = 0; i < 148; i++) {
    let daysAgo = Math.pow(rng.next(), 1.25) * 30;
    const dow = new Date(NOW - daysAgo * DAY).getUTCDay();
    if ((dow === 0 || dow === 6) === false && rng.chance(0.25)) daysAgo = Math.max(0.05, daysAgo - 1);
    const createdAt = new Date(NOW - daysAgo * DAY - rng.int(0, 3600) * 1000);
    const shopper = rng.pick(shoppers);
    const multiDept = rng.chance(0.42);
    const deptCount = multiDept ? rng.int(2, 4) : 1;
    const depts = new Set<string>();
    while (depts.size < deptCount) depts.add(rng.weighted(DEPT_WEIGHTS));
    const lines: { v: MemVariant; p: MemProduct; qty: number }[] = [];
    for (const d of depts) {
      const n = rng.int(1, d === 'grocery' ? 3 : 2);
      for (let k = 0; k < n; k++) {
        const p = rng.pick(byDept(d));
        const v = pickVariant(p);
        if (lines.some((l) => l.v.id === v.id)) continue;
        lines.push({ p, v, qty: d === 'grocery' ? rng.int(1, 3) : rng.chance(0.15) ? 2 : 1 });
      }
    }
    const method = rng.weighted([['UPI', 65], ['CARD', 25], ['COD', 10]] as const);
    const couponCode = rng.chance(0.28) ? rng.pick(['FLAT200', 'TECH15', 'GLOW20', 'FRESH50', 'FREESHIP', 'MAGGY10', 'PLUS5']) : undefined;
    const fate = daysAgo > 7 && rng.chance(0.05) ? 'return' : rng.chance(0.04) ? 'cancel' : undefined;
    await createHistoricOrder({ userId: shopper.id, isMember: shopper.isMember, createdAt, lines, couponCode, method, fate, address: addr(shopper) });
  }
  for (const c of coupons.values()) {
    if (c.usedCount) await prisma.coupon.update({ where: { id: c.id }, data: { usedCount: c.usedCount } });
  }

  // ── Stock movements + sold counts ──────────────────────
  console.log('📊 stock ledger');
  const movements: { variantId: string; delta: number; reason: 'SEED' | 'SALE' | 'CANCEL' | 'RETURN'; createdAt: Date }[] = [];
  for (const p of products.values()) {
    for (const v of p.variants) {
      movements.push({ variantId: v.id, delta: v.finalStock + v.sold - v.restocked, reason: 'SEED', createdAt: new Date(NOW - 40 * DAY) });
    }
    await prisma.product.update({ where: { id: p.id }, data: { soldCount: p.sold } });
  }
  const sales = await prisma.orderItem.findMany({ select: { variantId: true, qty: true, orderId: true, status: true, order: { select: { createdAt: true } } } });
  for (const s of sales) {
    movements.push({ variantId: s.variantId, delta: -s.qty, reason: 'SALE', createdAt: new Date(s.order.createdAt.getTime() + 60_000) });
    if (s.status === 'CANCELLED') movements.push({ variantId: s.variantId, delta: s.qty, reason: 'CANCEL', createdAt: new Date(s.order.createdAt.getTime() + 0.15 * DAY) });
    if (s.status === 'RETURNED') movements.push({ variantId: s.variantId, delta: s.qty, reason: 'RETURN', createdAt: new Date(s.order.createdAt.getTime() + 5 * DAY) });
  }
  await prisma.stockMovement.createMany({ data: movements.map((m) => ({ ...m })) });

  // ── Reviews ────────────────────────────────────────────
  console.log('⭐ reviews');
  const allShopperIds = shoppers.map((s) => s.id);
  const reviewRows: { productId: string; userId: string; rating: number; title: string; body: string; images: string[]; verified: boolean; helpful: number; createdAt: Date }[] = [];
  for (const p of products.values()) {
    const used = new Set<string>();
    const buyers = [...(deliveredBuyers.get(p.id) ?? [])];
    for (const [i, s] of (SHOWCASE_REVIEWS[p.code] ?? []).entries()) {
      const userId = buyers[i] ?? allShopperIds[i];
      used.add(userId);
      reviewRows.push({
        productId: p.id, userId, rating: s.rating, title: s.title, body: s.body,
        images: s.photo ? [img('Customer photo', '#3A1C4A'), img('Worn it', '#E0457B')] : [],
        verified: buyers.includes(userId), helpful: rng.int(25, 60), createdAt: new Date(NOW - rng.int(2, 9) * DAY),
      });
    }
    const target = rng.int(3, 15);
    const templates = REVIEW_TEMPLATES[p.deptSlug];
    const pool = rng.shuffle([...buyers.filter((b) => !used.has(b)), ...rng.shuffle(allShopperIds.filter((u) => !buyers.includes(u))).slice(0, 12)]);
    for (const userId of pool) {
      if (reviewRows.filter((r) => r.productId === p.id).length >= target) break;
      if (used.has(userId)) continue;
      used.add(userId);
      const rating = rng.weighted([[5, 45], [4, 30], [3, 15], [2, 6], [1, 4]] as const);
      const t = rating <= 2 ? { title: 'Not for me', body: 'Did not meet my expectations — quality could be better for the price.' } : rating === 3 ? templates[templates.length - 1] : rng.pick(templates.slice(0, -1));
      reviewRows.push({
        productId: p.id, userId, rating, title: t.title, body: t.body,
        images: rng.chance(0.2) ? [img('Customer photo', '#1E1B27')] : [],
        verified: buyers.includes(userId) || rng.chance(0.55), helpful: rng.int(0, 24),
        createdAt: new Date(NOW - rng.int(1, 28) * DAY),
      });
    }
  }
  await prisma.review.createMany({ data: reviewRows });
  await prisma.$executeRaw`
    UPDATE "Product" p SET "ratingSum" = r.s, "ratingCount" = r.c, "ratingAvg" = r.s::float / r.c
    FROM (SELECT "productId", SUM("rating")::int AS s, COUNT(*)::int AS c FROM "Review" WHERE "status" = 'PUBLISHED' GROUP BY "productId") r
    WHERE p."id" = r."productId"`;
  const rated = await prisma.product.findMany({ select: { id: true, ratingSum: true, ratingCount: true } });
  for (const r of rated) await prisma.product.update({ where: { id: r.id }, data: { bayesScore: bayes(r.ratingSum, r.ratingCount) } });

  // ── Wishlist, views, recommendations, alerts ───────────
  console.log('💜 wishlist · views · recommendations · alerts');
  const ananya = userByKey.get('ananya')!;
  await prisma.wishlistItem.createMany({
    data: [
      { userId: ananya.id, productId: P('F02').id, priceWhenAdded: P('F02').variants[0].price + 30_000 }, // shows "Price dropped ₹300"
      { userId: ananya.id, productId: P('E02').id, priceWhenAdded: P('E02').variants[0].price },
      { userId: ananya.id, productId: P('H01').id, priceWhenAdded: P('H01').variants[0].price + 20_000 },
    ],
  });
  await prisma.productView.createMany({
    data: ['F01', 'F04', 'B01', 'E01', 'H11'].map((c, i) => ({ userId: kabir.id, productId: P(c).id, viewedAt: new Date(NOW - i * 3600_000) })),
  });
  await rebuildCoPurchase();
  const low = await prisma.$queryRaw<{ id: string; sku: string; available: number; name: string; departmentId: string }[]>`
    SELECT v."id", v."sku", (v."stock" - v."reserved")::int AS available, p."name", p."departmentId"
    FROM "Variant" v JOIN "Product" p ON p."id" = v."productId" WHERE v."stock" - v."reserved" <= v."lowStockAt" ORDER BY available LIMIT 12`;
  for (const v of low) {
    await notifyStaff(v.departmentId, { type: 'LOW_STOCK', title: `Low stock: ${v.name}`, body: `${v.sku} has ${v.available} left`, link: `/admin/inventory?variant=${v.id}` });
  }

  const counts = {
    departments: await prisma.department.count(), categories: await prisma.category.count(),
    products: await prisma.product.count(), variants: await prisma.variant.count(), users: await prisma.user.count(),
    orders: stats.orders, multiDepartmentPct: Math.round((stats.multi / stats.orders) * 100), cancelled: stats.cancelled, returned: stats.returned,
    reviews: await prisma.review.count(), coupons: await prisma.coupon.count(), bundles: await prisma.bundle.count(),
  };
  console.log('✅ seeded in', ((Date.now() - t0) / 1000).toFixed(1) + 's', counts);
  console.log('\nDemo logins (password Demo@123):');
  for (const u of DEMO_USERS) console.log(`  ${u.role.padEnd(13)} ${u.email}`);
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
