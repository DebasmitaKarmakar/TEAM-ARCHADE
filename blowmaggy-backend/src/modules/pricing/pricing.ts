/**
 * PRICING ENGINE — pure functions, no database.
 * The server is the only price authority: clients send variant ids + quantities, never prices.
 *
 * Order of operations:
 *  1. line gross       = unitPrice × qty               (unitPrice loaded from DB)
 *  2. bundle discount  = bundle.discountPct on lines of a complete bundle
 *  3. coupon           = validated, computed on eligible lines only, split across those lines
 *  4. Maggy+           = 10% of what's left on each line (members)
 *  5. delivery         = free if member / FREE_DELIVERY coupon / ≥ ₹999, else ₹49 per shipment group (cap ₹99)
 *  6. tax (invoice)    = GST portion of each line's net (prices are GST-inclusive)
 *  7. total            = subtotal − discounts + delivery
 */
import {
  DELIVERY_FEE_CAP, DELIVERY_FEE_PER_GROUP, FREE_DELIVERY_MIN,
  MEMBER_DISCOUNT_EXCLUDED_DEPTS, MEMBER_DISCOUNT_PCT,
} from '../../config/constants';
import { ruleForDepartment } from '../../config/shipping';
import { gstFor } from '../../config/tax';
import { pct, sumBy } from '../../lib/money';

export type CouponKind = 'PERCENT' | 'FLAT' | 'FREE_DELIVERY';

export interface PriceLineInput {
  variantId: string;
  productId: string;
  departmentId: string;
  departmentSlug: string;
  unitPrice: number;
  qty: number;
}

export interface CouponInput {
  id: string;
  code: string;
  type: CouponKind;
  value: number;
  maxDiscount: number | null;
  minCart: number;
  departmentId: string | null;
  firstOrderOnly: boolean;
  membersOnly: boolean;
  usageLimit: number | null;
  perUserLimit: number;
  usedCount: number;
  startsAt: Date;
  endsAt: Date;
  isActive: boolean;
}

/** null = guest (rules that need an account are re-checked at checkout). */
export interface PricingUser {
  isMember: boolean;
  paidOrderCount: number;
  /** how many times this user already redeemed the coupon being priced */
  couponUses: number;
}

export interface BundleInput {
  slug: string;
  name: string;
  discountPct: number;
  productIds: string[];
}

export interface PricedLine extends PriceLineInput {
  gross: number;
  bundleDiscount: number;
  couponDiscount: number;
  memberDiscount: number;
  discount: number;
  net: number;
  tax: number;
  bundleSlug?: string;
  shipmentGroup: string;
}

export interface ShipmentGroup {
  group: string;
  label: string;
  etaDays: number;
  needsSlot: boolean;
  variantIds: string[];
  departments: string[];
}

export interface PriceResult {
  lines: PricedLine[];
  groups: ShipmentGroup[];
  subtotal: number;
  bundleDiscount: number;
  couponDiscount: number;
  memberSavings: number;
  discountTotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  freeDeliveryGap: number;
  /** what a non-member would save by joining Maggy+ (for the "Join to save ₹X" nudge) */
  memberPreviewSavings: number;
  coupon: { code: string; applied: boolean; reason?: string; freeDelivery?: boolean } | null;
  appliedBundles: string[];
}

export type CouponCheck =
  | { ok: true; amount: number; eligible: PricedLine[] }
  | { ok: false; reason: string };

const rupeeText = (paise: number) => '₹' + Math.ceil(paise / 100).toLocaleString('en-IN');

export function validateCoupon(
  c: CouponInput,
  lines: PricedLine[],
  user: PricingUser | null,
  now = new Date(),
): CouponCheck {
  if (!c.isActive || now < c.startsAt || now > c.endsAt) return { ok: false, reason: 'This coupon has expired' };
  if (c.usageLimit !== null && c.usedCount >= c.usageLimit) return { ok: false, reason: 'This coupon is fully used' };
  if (user && user.couponUses >= c.perUserLimit) return { ok: false, reason: "You've already used this coupon" };
  if (c.firstOrderOnly && user && user.paidOrderCount > 0) return { ok: false, reason: 'Valid on your first order only' };
  if (c.membersOnly && !user?.isMember) return { ok: false, reason: 'For Maggy+ members only' };

  const eligible = c.departmentId ? lines.filter((l) => l.departmentId === c.departmentId) : lines;
  if (eligible.length === 0) return { ok: false, reason: 'No eligible items in your cart for this coupon' };

  const base = sumBy(eligible, (l) => l.gross - l.discount);
  if (base < c.minCart) return { ok: false, reason: `Add ${rupeeText(c.minCart - base)} more of eligible items to use this coupon` };

  let amount = 0;
  if (c.type === 'PERCENT') amount = Math.min(pct(base, c.value), c.maxDiscount ?? Number.MAX_SAFE_INTEGER);
  else if (c.type === 'FLAT') amount = Math.min(c.value, base);
  return { ok: true, amount, eligible };
}

/**
 * Split `amount` across lines proportionally to their remaining value.
 * Floors each share; the remainder goes to the largest line, so the sum is exact.
 */
export function distribute(amount: number, lines: PricedLine[], field: 'couponDiscount' = 'couponDiscount') {
  if (amount <= 0 || lines.length === 0) return;
  const base = sumBy(lines, (l) => l.gross - l.discount);
  if (base <= 0) return;
  let given = 0;
  for (const l of lines) {
    const share = Math.floor((amount * (l.gross - l.discount)) / base);
    l[field] += share;
    l.discount += share;
    given += share;
  }
  const largest = [...lines].sort((a, b) => b.gross - a.gross)[0];
  largest[field] += amount - given;
  largest.discount += amount - given;
}

export function groupShipments(lines: Pick<PricedLine, 'variantId' | 'departmentSlug'>[]): ShipmentGroup[] {
  const map = new Map<string, ShipmentGroup>();
  for (const l of lines) {
    const rule = ruleForDepartment(l.departmentSlug);
    let g = map.get(rule.group);
    if (!g) {
      g = { group: rule.group, label: rule.label, etaDays: rule.etaDays, needsSlot: !!rule.needsSlot, variantIds: [], departments: [] };
      map.set(rule.group, g);
    }
    g.variantIds.push(l.variantId);
    if (!g.departments.includes(l.departmentSlug)) g.departments.push(l.departmentSlug);
  }
  return [...map.values()];
}

export function priceCart(input: {
  lines: PriceLineInput[];
  coupon?: CouponInput | null;
  user: PricingUser | null;
  bundles?: BundleInput[];
  now?: Date;
}): PriceResult {
  const { user, bundles = [], now = new Date() } = input;
  const lines: PricedLine[] = input.lines.map((l) => ({
    ...l,
    gross: l.unitPrice * l.qty,
    bundleDiscount: 0,
    couponDiscount: 0,
    memberDiscount: 0,
    discount: 0,
    net: 0,
    tax: 0,
    shipmentGroup: ruleForDepartment(l.departmentSlug).group,
  }));

  // 2. bundles — a line gets at most one bundle discount
  const appliedBundles: string[] = [];
  for (const b of bundles) {
    const complete = b.productIds.length > 0 && b.productIds.every((id) => lines.some((l) => l.productId === id));
    if (!complete) continue;
    appliedBundles.push(b.slug);
    for (const l of lines) {
      if (b.productIds.includes(l.productId) && !l.bundleSlug) {
        const d = pct(l.gross, b.discountPct);
        l.bundleDiscount = d;
        l.discount += d;
        l.bundleSlug = b.slug;
      }
    }
  }

  // 3. coupon
  let coupon: PriceResult['coupon'] = null;
  let freeDeliveryCoupon = false;
  if (input.coupon) {
    const r = validateCoupon(input.coupon, lines, user, now);
    if (r.ok) {
      distribute(r.amount, r.eligible);
      freeDeliveryCoupon = input.coupon.type === 'FREE_DELIVERY';
      coupon = { code: input.coupon.code, applied: true, freeDelivery: freeDeliveryCoupon };
    } else {
      coupon = { code: input.coupon.code, applied: false, reason: r.reason };
    }
  }

  // 4. Maggy+
  const memberEligible = (l: PricedLine) => !MEMBER_DISCOUNT_EXCLUDED_DEPTS.includes(l.departmentSlug);
  if (user?.isMember) {
    for (const l of lines) {
      if (!memberEligible(l)) continue;
      const s = pct(l.gross - l.discount, MEMBER_DISCOUNT_PCT);
      l.memberDiscount = s;
      l.discount += s;
    }
  }

  // 6. net + tax per line
  for (const l of lines) {
    l.net = l.gross - l.discount;
    const rate = gstFor(l.departmentSlug);
    l.tax = Math.round((l.net * rate) / (100 + rate));
  }

  const subtotal = sumBy(lines, (l) => l.gross);
  const discountTotal = sumBy(lines, (l) => l.discount);
  const afterDiscount = subtotal - discountTotal;
  const groups = groupShipments(lines);

  // 5. delivery
  const free = lines.length === 0 || !!user?.isMember || freeDeliveryCoupon || afterDiscount >= FREE_DELIVERY_MIN;
  const deliveryFee = free ? 0 : Math.min(groups.length * DELIVERY_FEE_PER_GROUP, DELIVERY_FEE_CAP);

  return {
    lines,
    groups,
    subtotal,
    bundleDiscount: sumBy(lines, (l) => l.bundleDiscount),
    couponDiscount: sumBy(lines, (l) => l.couponDiscount),
    memberSavings: sumBy(lines, (l) => l.memberDiscount),
    discountTotal,
    deliveryFee,
    tax: sumBy(lines, (l) => l.tax),
    total: afterDiscount + deliveryFee,
    freeDeliveryGap: user?.isMember ? 0 : Math.max(0, FREE_DELIVERY_MIN - afterDiscount),
    memberPreviewSavings: user?.isMember
      ? 0
      : sumBy(lines.filter(memberEligible), (l) => pct(l.gross - l.discount, MEMBER_DISCOUNT_PCT)),
    coupon,
    appliedBundles,
  };
}
