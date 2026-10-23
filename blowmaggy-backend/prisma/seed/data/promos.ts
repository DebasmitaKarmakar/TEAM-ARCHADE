const DAY = 86_400_000;

/** values: PERCENT → %, FLAT → rupees (converted to paise by the seed) */
export const COUPONS = [
  { code: 'MAGGY10', description: '10% off your first order (max ₹500)', type: 'PERCENT', value: 10, maxDiscount: 500, minCart: 999, firstOrderOnly: true, perUserLimit: 1 },
  { code: 'FLAT200', description: '₹200 off on orders above ₹1,499', type: 'FLAT', value: 200, minCart: 1499, usageLimit: 1000, perUserLimit: 3 },
  { code: 'TECH15', description: '15% off Electronics (max ₹1,500)', type: 'PERCENT', value: 15, maxDiscount: 1500, minCart: 1999, dept: 'electronics', usageLimit: 500, perUserLimit: 2 },
  { code: 'GLOW20', description: '20% off Beauty (max ₹400)', type: 'PERCENT', value: 20, maxDiscount: 400, minCart: 799, dept: 'beauty', usageLimit: 500, perUserLimit: 2 },
  { code: 'FRESH50', description: '₹50 off Grocery on ₹499+', type: 'FLAT', value: 50, minCart: 499, dept: 'grocery', perUserLimit: 5 },
  { code: 'FREESHIP', description: 'Free delivery on any order', type: 'FREE_DELIVERY', value: 0, minCart: 0, perUserLimit: 5 },
  { code: 'PLUS5', description: 'Extra 5% off for Maggy+ members (max ₹300)', type: 'PERCENT', value: 5, maxDiscount: 300, minCart: 0, membersOnly: true, perUserLimit: 5 },
  { code: 'DIWALI25', description: 'Festive 25% off Fashion (expired)', type: 'PERCENT', value: 25, maxDiscount: 750, minCart: 1999, dept: 'fashion', expired: true },
  { code: 'LASTONE', description: 'Single-use test coupon (race test)', type: 'FLAT', value: 100, minCart: 0, usageLimit: 1, perUserLimit: 1 },
] as const;

export const couponWindow = (expired?: boolean) => {
  const now = Date.now();
  return expired
    ? { startsAt: new Date(now - 40 * DAY), endsAt: new Date(now - DAY) }
    : { startsAt: new Date(now - 45 * DAY), endsAt: new Date(now + 90 * DAY) };
};

export const BUNDLES = [
  { slug: 'monthly-stockup', name: 'Monthly Stock-up', description: 'Atta, rice, dal, ghee and chai — the month sorted in one tap.', discountPct: 8, codes: ['G01', 'G02', 'G04', 'G10', 'G11'] },
  { slug: 'new-parent', name: 'New Parent Kit', description: 'A stacker, a cuddle bear, gentle lotion and a frill frock for the newest reader.', discountPct: 10, codes: ['K01', 'K07', 'B13', 'K12'] },
  { slug: 'wfh-desk', name: 'WFH Desk Setup', description: 'Keyboard, mouse, webcam, a warm lamp and two mugs. Monday, upgraded.', discountPct: 12, codes: ['E08', 'E09', 'E11', 'H01', 'H04'] },
];

export const REVIEW_TEMPLATES: Record<string, { title: string; body: string }[]> = {
  fashion: [
    { title: 'Fits perfectly', body: 'Fabric is soft and the fit is true to size. Got compliments the first day I wore it.' },
    { title: 'Exactly like the photo', body: 'Colour is exactly like the pictures. Stitching is neat, no loose threads.' },
    { title: 'Good, runs slightly large', body: 'Quality is good but it runs a little large — consider a size down.' },
    { title: 'Worth it', body: 'Great value for the price. Washed it twice already and it still looks new.' },
    { title: 'Okay-ish', body: 'Material is fine but I expected a slightly thicker fabric.' },
  ],
  beauty: [
    { title: 'My new favourite', body: 'Stays on all day and does not dry out. The shade is gorgeous.' },
    { title: 'Genuine product', body: 'Batch code checks out, packaging was sealed. Works well on my skin.' },
    { title: 'Nice but pricey', body: 'Works as promised, though I wish the pack was a bit bigger.' },
    { title: 'Gentle on skin', body: 'No breakouts, no irritation. Will repurchase.' },
  ],
  electronics: [
    { title: 'Battery is a beast', body: 'Battery easily lasts two days of heavy use. Pairing was instant.' },
    { title: 'Great at this price', body: 'ANC is surprisingly good at this price. Calls are clear too.' },
    { title: 'Solid build', body: 'Feels premium, came sealed with the GST invoice and warranty card.' },
    { title: 'Decent', body: 'Does the job. The app could be better but hardware is good.' },
  ],
  home: [
    { title: 'Looks premium', body: 'Looks even better in person. Instantly made the room feel warmer.' },
    { title: 'Well packed', body: 'Arrived well packed with no damage. Quality is great.' },
    { title: 'Good quality', body: 'Sturdy and well made. Colour slightly different from photos but nice.' },
  ],
  grocery: [
    { title: 'Fresh stock', body: 'Fresh stock, good packaging and delivered right in my slot.' },
    { title: 'Monthly staple', body: 'Been ordering this every month. Consistent quality.' },
    { title: 'Tastes great', body: 'Tastes much better than what I used to buy locally.' },
  ],
  kids: [
    { title: 'Kids love it', body: 'My daughter loves it — sturdy build and bright colours.' },
    { title: 'Safe and well made', body: 'Smooth edges, no strong smell. Feels safe for little ones.' },
    { title: 'Great gift', body: 'Bought it as a birthday gift and it was a hit at the party.' },
  ],
};

export const SHOWCASE_REVIEWS: Record<string, { rating: number; title: string; body: string; photo?: boolean }[]> = {
  F01: [
    { rating: 5, title: 'Wore it for Diwali puja', body: 'The chikankari is so delicate and the cotton breathes even in Guwahati humidity. Paired it with the palazzo and the Rosewood lipstick — the complete look works!', photo: true },
    { rating: 4, title: 'Lovely, size up if between sizes', body: 'Beautiful work and true colour. I am usually M/L and the M was a snug fit, so size up if you like it relaxed.' },
  ],
  E01: [
    { rating: 5, title: 'ANC beats buds twice the price', body: 'Took them on a Delhi–Guwahati flight: engine noise basically disappeared. The Pro ANC edition is worth the extra ₹1,000.', photo: true },
    { rating: 4, title: 'Great battery, fit takes getting used to', body: 'Battery is excellent — two days without the case. Try all three ear-tip sizes to get the seal right.' },
  ],
};
