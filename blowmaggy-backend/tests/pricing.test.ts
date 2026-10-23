import { describe, expect, it } from 'vitest';
import { distribute, priceCart, type CouponInput, type PricedLine } from '../src/modules/pricing/pricing';
import { deriveOrderStatus, canTransition } from '../src/modules/order/stateMachine';

const line = (variantId: string, dept: string, rupees: number, qty = 1) => ({
  variantId, productId: `p_${variantId}`, departmentId: `d_${dept}`, departmentSlug: dept, unitPrice: rupees * 100, qty,
});
const coupon = (o: Partial<CouponInput>): CouponInput => ({
  id: 'c1', code: 'TEST', type: 'PERCENT', value: 10, maxDiscount: null, minCart: 0, departmentId: null,
  firstOrderOnly: false, membersOnly: false, usageLimit: null, perUserLimit: 1, usedCount: 0,
  startsAt: new Date(Date.now() - 86_400_000), endsAt: new Date(Date.now() + 86_400_000), isActive: true, ...o,
});
const guest = null;
const shopper = { isMember: false, paidOrderCount: 0, couponUses: 0 };

// the demo cart: kurta + lipstick + earbuds + atta + olive oil
const demo = [line('kurta', 'fashion', 1499), line('lip', 'beauty', 549), line('buds', 'electronics', 2999), line('atta', 'grocery', 289), line('oil', 'grocery', 699)];

describe('pricing engine', () => {
  it('prices the demo cart: ₹6,035 − MAGGY10 (capped ₹500) = ₹5,535, free delivery', () => {
    const r = priceCart({ lines: demo, coupon: coupon({ code: 'MAGGY10', maxDiscount: 50_000, minCart: 99_900, firstOrderOnly: true }), user: shopper });
    expect(r.subtotal).toBe(603_500);
    expect(r.couponDiscount).toBe(50_000);
    expect(r.deliveryFee).toBe(0);
    expect(r.total).toBe(553_500);
    expect(r.groups.map((g) => g.group).sort()).toEqual(['electronics', 'general', 'grocery']);
    expect(r.memberPreviewSavings).toBeGreaterThan(55_000);
  });

  it('department-scoped coupon only discounts that department', () => {
    const r = priceCart({ lines: demo, coupon: coupon({ departmentId: 'd_electronics', value: 15, maxDiscount: 150_000 }), user: shopper });
    const buds = r.lines.find((l) => l.variantId === 'buds')!;
    expect(buds.couponDiscount).toBe(Math.round(299_900 * 0.15));
    expect(r.lines.filter((l) => l.variantId !== 'buds').every((l) => l.couponDiscount === 0)).toBe(true);
  });

  it('rejects coupons with clear reasons', () => {
    const expired = priceCart({ lines: demo, coupon: coupon({ endsAt: new Date(Date.now() - 1000) }), user: shopper });
    expect(expired.coupon).toMatchObject({ applied: false, reason: 'This coupon has expired' });
    const first = priceCart({ lines: demo, coupon: coupon({ firstOrderOnly: true }), user: { ...shopper, paidOrderCount: 2 } });
    expect(first.coupon?.reason).toMatch(/first order/);
    const members = priceCart({ lines: demo, coupon: coupon({ membersOnly: true }), user: shopper });
    expect(members.coupon?.reason).toMatch(/Maggy\+/);
    const min = priceCart({ lines: [line('lip', 'beauty', 549)], coupon: coupon({ minCart: 79_900 }), user: shopper });
    expect(min.coupon?.reason).toMatch(/Add ₹250 more/);
    const none = priceCart({ lines: [line('lip', 'beauty', 549)], coupon: coupon({ departmentId: 'd_electronics' }), user: shopper });
    expect(none.coupon?.reason).toMatch(/No eligible items/);
  });

  it('Maggy+ gets 10% off after coupon and free delivery', () => {
    const r = priceCart({ lines: [line('lip', 'beauty', 549)], user: { isMember: true, paidOrderCount: 3, couponUses: 0 } });
    expect(r.memberSavings).toBe(5_490);
    expect(r.deliveryFee).toBe(0);
    expect(r.total).toBe(54_900 - 5_490);
  });

  it('charges ₹49 per shipment group below ₹999, capped at ₹99', () => {
    expect(priceCart({ lines: [line('lip', 'beauty', 549)], user: guest }).deliveryFee).toBe(4_900);
    const three = priceCart({ lines: [line('lip', 'beauty', 200), line('cable', 'electronics', 200), line('tea', 'grocery', 200)], user: guest });
    expect(three.groups).toHaveLength(3);
    expect(three.deliveryFee).toBe(9_900);
    expect(three.freeDeliveryGap).toBe(99_900 - 60_000);
  });

  it('applies a bundle discount only when the whole bundle is in the cart', () => {
    const bundle = { slug: 'b', name: 'B', discountPct: 10, productIds: ['p_atta', 'p_oil'] };
    const full = priceCart({ lines: demo, user: guest, bundles: [bundle] });
    expect(full.appliedBundles).toEqual(['b']);
    expect(full.bundleDiscount).toBe(2_890 + 6_990);
    const partial = priceCart({ lines: demo.filter((l) => l.variantId !== 'oil'), user: guest, bundles: [bundle] });
    expect(partial.bundleDiscount).toBe(0);
  });

  it('distribute() splits exactly with no lost paise', () => {
    const lines = [101, 202, 303].map((g, i) => ({ variantId: String(i), gross: g, discount: 0, couponDiscount: 0 })) as unknown as PricedLine[];
    distribute(100, lines);
    expect(lines.reduce((a, l) => a + l.couponDiscount, 0)).toBe(100);
  });

  it('tax is the GST portion of inclusive prices', () => {
    const r = priceCart({ lines: [line('buds', 'electronics', 1180)], user: guest });
    expect(r.tax).toBe(18_000); // 1180 incl. 18% → 180 tax
  });
});

describe('order state machine', () => {
  it('allows only forward moves', () => {
    expect(canTransition('PLACED', 'PACKED')).toBe(true);
    expect(canTransition('SHIPPED', 'CANCELLED')).toBe(false);
    expect(canTransition('DELIVERED', 'PLACED')).toBe(false);
  });
  it('order status = least advanced active shipment', () => {
    expect(deriveOrderStatus(['SHIPPED', 'PACKED', 'DELIVERED'])).toBe('PACKED');
    expect(deriveOrderStatus(['CANCELLED', 'DELIVERED'])).toBe('DELIVERED');
    expect(deriveOrderStatus(['CANCELLED', 'CANCELLED'])).toBe('CANCELLED');
  });
});
