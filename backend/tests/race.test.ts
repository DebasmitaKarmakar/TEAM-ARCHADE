/** The "last unit" race: 10 shoppers, 1 unit, exactly 1 winner. Same for a single-use coupon. */
import { describe, expect, it } from 'vitest';
import { address, client, prisma, variantOf } from './helpers';

describe('concurrency', () => {
  it('never oversells the last unit', async () => {
    const v = await variantOf('E11');
    await prisma.variant.update({ where: { id: v.id }, data: { stock: 1, reserved: 0 } });

    const shoppers = await Promise.all(Array.from({ length: 10 }, async () => {
      const c = client(); await c.register();
      const add = await c.post('/cart/items', { variantId: v.id, qty: 1 });
      expect(add.status).toBe(200);
      return c;
    }));

    const results = await Promise.all(shoppers.map((c, i) =>
      c.post('/checkout', { paymentMethod: 'UPI', address }, { 'Idempotency-Key': `race-${i}-${Date.now()}` })));

    const ok = results.filter((r) => r.status === 201);
    const sold = results.filter((r) => r.status === 409);
    expect(ok).toHaveLength(1);
    expect(sold).toHaveLength(9);
    expect(sold.every((r) => ['OUT_OF_STOCK', 'CART_UNAVAILABLE'].includes(r.body.error.code))).toBe(true);
    const after = await prisma.variant.findUniqueOrThrow({ where: { id: v.id } });
    expect(after.reserved).toBe(1);
    expect(after.stock - after.reserved).toBe(0);
  });

  it('a single-use coupon is redeemed exactly once', async () => {
    const v = await variantOf('G08');
    const shoppers = await Promise.all(Array.from({ length: 6 }, async () => {
      const c = client(); await c.register();
      await c.post('/cart/items', { variantId: v.id, qty: 1 });
      const applied = await c.post('/cart/coupon', { code: 'LASTONE' });
      expect(applied.status).toBe(200);
      return c;
    }));
    const results = await Promise.all(shoppers.map((c, i) =>
      c.post('/checkout', { paymentMethod: 'UPI', address }, { 'Idempotency-Key': `coupon-race-${i}-${Date.now()}` })));
    expect(results.filter((r) => r.status === 201)).toHaveLength(1);
    expect(results.filter((r) => r.status === 409 && r.body.error.code === 'COUPON_EXHAUSTED').length
      + results.filter((r) => r.status === 400 && r.body.error.code === 'COUPON_INVALID').length).toBe(5);
    const c = await prisma.coupon.findUniqueOrThrow({ where: { code: 'LASTONE' } });
    expect(c.usedCount).toBe(1);
  });

  it('double-click add-to-cart never creates duplicate rows', async () => {
    const c = client(); await c.register();
    const v = await variantOf('G01', { weight: '5 kg' });
    await Promise.all(Array.from({ length: 5 }, () => c.post('/cart/items', { variantId: v.id, qty: 1 })));
    const cart = (await c.get('/cart')).body.data;
    expect(cart.lineCount).toBe(1);
    expect(cart.itemCount).toBeGreaterThanOrEqual(1);
  });
});
