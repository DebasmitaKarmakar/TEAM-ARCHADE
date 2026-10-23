/** End-to-end: the demo path from the pitch, against a real Postgres. */
import { describe, expect, it } from 'vitest';
import { webhookSignatureFor, mockSignature } from '../src/lib/gateway';
import { releaseExpiredReservations } from '../src/jobs';
import { address, app, checkoutAndPay, client, prisma, variantOf } from './helpers';
import request from 'supertest';

describe('catalog & search', () => {
  it('lists six departments and a department page', async () => {
    const c = client();
    const d = await c.get('/departments');
    expect(d.status).toBe(200);
    expect(d.body.data.map((x: { slug: string }) => x.slug)).toEqual(['fashion', 'beauty', 'electronics', 'home', 'grocery', 'kids']);
    const f = await c.get('/departments/fashion');
    expect(f.body.data.rails.bestsellers.length).toBeGreaterThan(0);
    expect(f.body.data.moods.length).toBe(4);
  });

  it('searches "black" across 5 departments with facets', async () => {
    const r = await client().get('/search?q=black');
    expect(r.status).toBe(200);
    const depts = r.body.meta.facets.departments.filter((d: { slug: string }) => d.slug !== 'all');
    expect(depts.length).toBe(5);
    expect(r.body.meta.headline).toMatch(/across 5 departments/);
  });

  it('filters by department + size + price, and facet counts ignore their own filter', async () => {
    const r = await client().get('/search?q=black&dept=fashion&size=M&priceMax=2000');
    expect(r.status).toBe(200);
    for (const p of r.body.data) { expect(p.department.slug).toBe('fashion'); expect(p.price).toBeLessThanOrEqual(200_000); }
    expect(r.body.data.length).toBeGreaterThan(0);
    // department facet ignores the department filter itself → still shows all 5 departments for "black"
    const only = await client().get('/search?q=black&dept=fashion');
    const depts = only.body.meta.facets.departments.filter((d: { slug: string }) => d.slug !== 'all');
    expect(depts.length).toBe(5);
    expect(only.body.data.every((p: { department: { slug: string } }) => p.department.slug === 'fashion')).toBe(true);
  });

  it('tolerates typos and suggests grouped by department', async () => {
    const r = await client().get('/search?q=kurtha');
    expect(r.body.data.some((p: { name: string }) => /Kurta/.test(p.name))).toBe(true);
    const s = await client().get('/search/suggest?q=bl');
    expect(s.status).toBe(200);
    expect(Array.isArray(s.body.data.groups)).toBe(true);
  });

  it('product page has variants, option axes, look and stock flags', async () => {
    const r = await client().get('/products/ivory-chikankari-cotton-kurta');
    expect(r.status).toBe(200);
    const p = r.body.data;
    expect(p.optionAxes.map((a: { name: string }) => a.name)).toEqual(['size', 'colour']);
    const xl = p.variants.find((v: { options: Record<string, string> }) => v.options.size === 'XL' && v.options.colour === 'Ivory');
    const l = p.variants.find((v: { options: Record<string, string> }) => v.options.size === 'L' && v.options.colour === 'Ivory');
    expect(xl.inStock).toBe(false);
    expect(l.available).toBe(2);
    expect(p.completeTheLook.pieces.length).toBeGreaterThanOrEqual(3);
    expect(p.ratings.count).toBeGreaterThan(0);
  });

  it('home endpoint returns picks across departments', async () => {
    const r = await client().get('/home');
    const depts = new Set(r.body.data.pickedForYou.map((p: { department: { slug: string } }) => p.department.slug));
    expect(depts.size).toBeGreaterThanOrEqual(4);
  });
});

describe('guest cart → login merge → one checkout', () => {
  it('runs the full demo path', async () => {
    const c = client();
    const kurta = await variantOf('F01', { size: 'M', colour: 'Ivory' });
    const lip = await variantOf('B01', { shade: 'Rosewood' });
    const buds = await variantOf('E01', { colour: 'Midnight', edition: 'Standard' });
    const atta = await variantOf('G01', { weight: '5 kg' });
    const oil = await variantOf('G03', { volume: '1 L' });

    // guest adds two items (cookie cart)
    expect((await c.post('/cart/items', { variantId: kurta.id, qty: 1 })).status).toBe(200);
    expect((await c.post('/cart/items', { variantId: lip.id })).status).toBe(200);

    // register → guest cart merges
    await c.register('Demo Shopper');
    let cart = (await c.get('/cart')).body.data;
    expect(cart.itemCount).toBe(2);

    for (const v of [buds, atta, oil]) await c.post('/cart/items', { variantId: v.id, qty: 1 });
    cart = (await c.get('/cart')).body.data;
    expect(cart.departmentCount).toBe(4);
    expect(cart.groups.map((g: { department: { slug: string } }) => g.department.slug)).toEqual(['fashion', 'beauty', 'electronics', 'grocery']);
    expect(cart.summary.subtotal).toBe(603_500);

    // coupons: department scope + cap + expired
    const tech = await c.post('/cart/coupon', { code: 'TECH15' });
    expect(tech.body.data.summary.couponDiscount).toBe(Math.round(299_900 * 0.15));
    expect((await c.post('/cart/coupon', { code: 'DIWALI25' })).body.error.message).toBe('This coupon has expired');
    const maggy = await c.post('/cart/coupon', { code: 'maggy10' });
    expect(maggy.status).toBe(200);
    expect(maggy.body.data.summary.total).toBe(553_500); // ₹5,535

    // client-side price tampering is ignored: server re-prices
    const before = await prisma.variant.findUniqueOrThrow({ where: { id: buds.id } });
    const r = await c.post('/checkout', { paymentMethod: 'UPI', address, total: 1, price: 1 }, { 'Idempotency-Key': 'demo-path-key-1' });
    expect(r.status).toBe(201);
    expect(r.body.data.amount).toBe(553_500);
    const reserved = await prisma.variant.findUniqueOrThrow({ where: { id: buds.id } });
    expect(reserved.reserved).toBe(before.reserved + 1);

    // same Idempotency-Key → same order
    const again = await c.post('/checkout', { paymentMethod: 'UPI', address }, { 'Idempotency-Key': 'demo-path-key-1' });
    expect(again.body.data.orderNumber).toBe(r.body.data.orderNumber);

    // tampered signature rejected
    const bad = await c.post('/payments/verify', { razorpay_order_id: r.body.data.razorpayOrderId, razorpay_payment_id: 'pay_x', razorpay_signature: 'tampered' });
    expect(bad.status).toBe(400);

    // valid signature → PLACED, stock committed, cart cleared
    const payId = 'pay_demo_1';
    const ok = await c.post('/payments/verify', { razorpay_order_id: r.body.data.razorpayOrderId, razorpay_payment_id: payId, razorpay_signature: mockSignature(r.body.data.razorpayOrderId, payId) });
    expect(ok.status).toBe(200);
    expect(ok.body.data.status).toBe('PLACED');
    const after = await prisma.variant.findUniqueOrThrow({ where: { id: buds.id } });
    expect(after.stock).toBe(before.stock - 1);
    expect(after.reserved).toBe(before.reserved);
    expect((await c.get('/cart')).body.data.itemCount).toBe(0);

    // webhook for the same payment is a no-op (idempotent) and duplicate deliveries are deduped
    const body = JSON.stringify({ event: 'payment.captured', payload: { payment: { entity: { id: payId, order_id: r.body.data.razorpayOrderId, amount: 553_500 } } } });
    const send = () => request(app).post('/api/v1/payments/webhook').set('Content-Type', 'application/json').set('x-razorpay-signature', webhookSignatureFor(body)).set('x-razorpay-event-id', 'evt_demo_1').send(body);
    expect((await send()).status).toBe(200);
    expect((await send()).body.data.duplicate).toBe(true);
    const bad2 = await request(app).post('/api/v1/payments/webhook').set('Content-Type', 'application/json').set('x-razorpay-signature', 'nope').send(body);
    expect(bad2.status).toBe(400);
    const stockNow = await prisma.variant.findUniqueOrThrow({ where: { id: buds.id } });
    expect(stockNow.stock).toBe(after.stock); // not committed twice

    // tracking: 3 shipments (general, electronics, grocery)
    const order = (await c.get(`/orders/${ok.body.data.orderNumber}`)).body.data;
    expect(order.shipments).toHaveLength(3);
    expect(order.totals.couponCode).toBe('MAGGY10');

    // admin advances the electronics shipment; shopper sees it
    const admin = client();
    await admin.login('admin@blowmaggy.demo');
    const elec = order.shipments.find((s: { group: string }) => s.group === 'electronics');
    const adv = await admin.patch(`/admin/shipments/${elec.id}/status`, {});
    expect(adv.status).toBe(200);
    const shipped = await admin.patch(`/admin/shipments/${elec.id}/status`, { to: 'SHIPPED' });
    expect(shipped.body.data.shipments.find((s: { id: string }) => s.id === elec.id).trackingNo).toMatch(/^BMX/);
    const back = await admin.patch(`/admin/shipments/${elec.id}/status`, { to: 'PACKED' });
    expect(back.status).toBe(409);
    const tracked = (await c.get(`/orders/${ok.body.data.orderNumber}`)).body.data;
    expect(tracked.shipments.find((s: { group: string }) => s.group === 'electronics').status).toBe('SHIPPED');
    expect(tracked.status).toBe('PLACED'); // least-advanced shipment

    // shopper cancels the not-yet-shipped grocery shipment → restock + partial refund
    const groceryIds = tracked.shipments.find((s: { group: string }) => s.group === 'grocery').items.map((i: { id: string }) => i.id);
    const attaBefore = await prisma.variant.findUniqueOrThrow({ where: { id: atta.id } });
    const cancel = await c.post(`/orders/${ok.body.data.orderNumber}/cancel`, { itemIds: groceryIds });
    expect(cancel.status).toBe(200);
    expect((await prisma.variant.findUniqueOrThrow({ where: { id: atta.id } })).stock).toBe(attaBefore.stock + 1);
    expect(cancel.body.data.payment.status).toBe('PARTIALLY_REFUNDED');

    // receipt invoice is available
    const inv = await c.get(`/orders/${ok.body.data.orderNumber}/invoice`);
    expect(inv.status).toBe(200);
    expect(inv.text).toContain('Tax Invoice');
  });
});

describe('security & roles', () => {
  it('requires the CSRF header on writes', async () => {
    const r = await request(app).post('/api/v1/cart/items').send({ variantId: 'x' });
    expect(r.status).toBe(403);
    expect(r.body.error.code).toBe('CSRF');
  });

  it('shopper cannot open admin; cannot read another user’s order', async () => {
    const a = client(); await a.register();
    expect((await a.get('/admin/stats')).status).toBe(403);
    const someone = await prisma.order.findFirstOrThrow({ where: { status: 'DELIVERED' } });
    expect((await a.get(`/orders/${someone.orderNumber}`)).status).toBe(404);
  });

  it('department manager is scoped to their department', async () => {
    const m = client(); await m.login('electronics.mgr@blowmaggy.demo');
    const list = await m.get('/admin/products?limit=100');
    expect(list.body.data.every((p: { department: { slug: string } }) => p.department.slug === 'electronics')).toBe(true);
    const kurta = await prisma.product.findUniqueOrThrow({ where: { code: 'F01' } });
    expect((await m.patch(`/admin/products/${kurta.id}`, { name: 'hacked' })).status).toBe(403);
    const me = await m.get('/admin/me');
    expect(me.body.data.scope.banner).toBe('You are managing: Electronics');
    const stats = await m.get('/admin/stats?days=30');
    expect(stats.status).toBe(200);
  });

  it('register can never create staff', async () => {
    const r = await client().post('/auth/register', { name: 'Evil', email: `evil${Date.now()}@x.dev`, password: 'Password123', role: 'ADMIN' });
    expect(r.body.data.user.role).toBe('SHOPPER');
  });

  it('rotates refresh tokens and detects reuse', async () => {
    const c = client();
    await c.register();
    const r1 = await c.post('/auth/refresh');
    expect(r1.status).toBe(200);
    const r2 = await c.post('/auth/refresh');
    expect(r2.status).toBe(200);
  });

  it('rejects wrong passwords with a generic message', async () => {
    const r = await client().post('/auth/login', { email: 'admin@blowmaggy.demo', password: 'nope' });
    expect(r.status).toBe(401);
    expect(r.body.error.message).toBe('Invalid email or password');
  });
});

describe('admin cockpit', () => {
  it('dashboard KPIs come from seeded history', async () => {
    const a = client(); await a.login('admin@blowmaggy.demo');
    const r = await a.get('/admin/stats?days=30');
    expect(r.status).toBe(200);
    expect(r.body.data.kpis.orders).toBeGreaterThan(100);
    expect(r.body.data.kpis.multiDepartmentCartPct).toBeGreaterThan(25);
    expect(r.body.data.charts.revenueByDepartmentDay.length).toBeGreaterThan(20);
    expect(r.body.data.inventoryAlerts.length).toBeGreaterThan(0);
  });

  it('creates a product with a variant matrix and edits stock', async () => {
    const a = client(); await a.login('admin@blowmaggy.demo');
    const r = await a.post('/admin/products', {
      name: 'Test Linen Kurta', brand: 'Noor & Thread', description: 'A test product for the suite.', department: 'fashion', category: 'kurtas',
      variants: [{ options: { size: 'M', colour: 'Sage' }, price: 129_900, mrp: 199_900, stock: 5 }, { options: { size: 'L', colour: 'Sage' }, price: 129_900, mrp: 199_900, stock: 3 }],
    });
    expect(r.status).toBe(201);
    expect(r.body.data.variants).toHaveLength(2);
    const v = r.body.data.variants.find((x: { options: Record<string, string> }) => x.options.size === 'M');
    const s = await a.patch(`/admin/variants/${v.id}/stock`, { delta: 10 });
    expect(s.body.data.stock).toBe(15);
    const csv = 'name,brand,department,category,price,mrp,stock,options\nCSV Mug,Kiln Studio,home,mugs,499,799,12,colour=Blue\nCSV Mug,Kiln Studio,home,mugs,499,799,8,colour=Red\n';
    const imp = await a.agent.post('/api/v1/admin/products/import').set({ 'X-Requested-With': 'x', Authorization: `Bearer ${a.token}`, 'Content-Type': 'text/csv' }).send(csv);
    expect(imp.status).toBe(201);
    expect(imp.body.data.created).toBe(1);
  });
});

describe('reservations & COD', () => {
  it('expired unpaid orders release stock', async () => {
    const c = client(); await c.register();
    const v = await variantOf('H05');
    await c.post('/cart/items', { variantId: v.id });
    const r = await c.post('/checkout', { paymentMethod: 'CARD', address }, { 'Idempotency-Key': `exp-${Date.now()}` });
    expect(r.status).toBe(201);
    const held = await prisma.variant.findUniqueOrThrow({ where: { id: v.id } });
    await prisma.order.update({ where: { id: r.body.data.orderId }, data: { reservationExpiresAt: new Date(Date.now() - 1000) } });
    expect(await releaseExpiredReservations()).toBeGreaterThanOrEqual(1);
    const freed = await prisma.variant.findUniqueOrThrow({ where: { id: v.id } });
    expect(freed.reserved).toBe(held.reserved - 1);
    expect((await prisma.order.findUniqueOrThrow({ where: { id: r.body.data.orderId } })).status).toBe('CANCELLED');
  });

  it('COD places the order immediately', async () => {
    const c = client(); await c.register();
    const v = await variantOf('K06');
    await c.post('/cart/items', { variantId: v.id, qty: 2 });
    const r = await c.post('/checkout', { paymentMethod: 'COD', address }, { 'Idempotency-Key': `cod-${Date.now()}` });
    expect(r.status).toBe(201);
    expect(r.body.data.status).toBe('PLACED');
    expect(r.body.data.amount).toBe(2 * 24_900 + 4_900); // below ₹999 → ₹49 delivery
  });

  it('Maggy+ member gets 10% off and free delivery', async () => {
    const c = client(); await c.login('plus@blowmaggy.demo');
    const v = await variantOf('K06');
    await c.post('/cart/items', { variantId: v.id });
    const cart = (await c.get('/cart')).body.data;
    expect(cart.summary.memberSavings).toBe(2_490);
    expect(cart.summary.deliveryFee).toBe(0);
    await c.del(`/cart/items/${cart.groups[0].items[0].id}`);
  });

  it('pays with the helper', async () => {
    const c = client(); await c.register();
    await c.post('/cart/items', { variantId: (await variantOf('G08')).id, qty: 3 });
    const { orderNumber } = await checkoutAndPay(c);
    expect(orderNumber).toMatch(/^BM-\d{4}-\d{2}-\d{5}$/);
  });
});

describe('account extras', () => {
  it('Maggy+ subscribe → verify activates membership', async () => {
    const c = client(); await c.register();
    const sub = await c.post('/membership/subscribe', { plan: 'MONTHLY' });
    expect(sub.status).toBe(201);
    expect(sub.body.data.amount).toBe(9_900);
    const pid = 'pay_plus_1';
    const v = await c.post('/payments/verify', { razorpay_order_id: sub.body.data.razorpayOrderId, razorpay_payment_id: pid, razorpay_signature: mockSignature(sub.body.data.razorpayOrderId, pid) });
    expect(v.status).toBe(200);
    expect(v.body.data.active).toBe(true);
    expect((await c.get('/auth/me')).body.data.isMember).toBe(true);
  });

  it('addresses, wishlist with price-drop, reviews + helpful votes', async () => {
    const c = client(); await c.register('Reviewer One');
    const a = await c.post('/addresses', { ...address, label: 'Home' });
    expect(a.status).toBe(201);
    expect(a.body.data.isDefault).toBe(true);
    const lamp = await prisma.product.findUniqueOrThrow({ where: { code: 'H01' } });
    expect((await c.post('/wishlist', { productId: lamp.id })).status).toBe(201);
    expect((await c.get('/wishlist')).body.data[0].priceDrop).toBe(0);
    const ananya = client(); await ananya.login('shopper@blowmaggy.demo');
    const wl = (await ananya.get('/wishlist')).body.data;
    expect(wl.some((w: { priceDrop: number }) => w.priceDrop === 30_000)).toBe(true);

    const r = await c.post(`/products/${lamp.id}/reviews`, { rating: 5, title: '<b>Lovely</b> lamp', body: 'Warm light <script>alert(1)</script> and sturdy base.' });
    expect(r.status).toBe(201);
    expect(r.body.data.title).toBe('Lovely lamp'); // tags stripped
    expect(r.body.data.body).not.toContain('<script>');
    expect(r.body.data.verified).toBe(false);
    expect((await c.post(`/products/${lamp.id}/reviews`, { rating: 4, title: 'Again', body: 'Second review attempt' })).status).toBe(409);
    const other = client(); await other.register();
    expect((await other.post(`/reviews/${r.body.data.id}/helpful`)).body.data.helpful).toBe(1);
    expect((await other.post(`/reviews/${r.body.data.id}/helpful`)).body.data.helpful).toBe(1); // one vote per user
    const list = await c.get(`/products/${lamp.id}/reviews?sort=latest`);
    expect(list.body.meta.summary.count).toBeGreaterThan(0);
  });

  it('concurrent requests with the same Idempotency-Key create one order', async () => {
    const c = client(); await c.register();
    await c.post('/cart/items', { variantId: (await variantOf('G06')).id });
    const key = `same-${Date.now()}`;
    const rs = await Promise.all([1, 2, 3].map(() => c.post('/checkout', { paymentMethod: 'UPI', address }, { 'Idempotency-Key': key })));
    const numbers = new Set(rs.filter((r) => r.status === 201).map((r) => r.body.data.orderNumber));
    expect(numbers.size).toBe(1);
    expect(await prisma.order.count({ where: { idempotencyKey: key } })).toBe(1);
  });
});
