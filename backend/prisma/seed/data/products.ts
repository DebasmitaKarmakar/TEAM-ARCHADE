/**
 * 73 demo products (12 per department + baby lotion for the New Parent bundle).
 * Prices are in RUPEES here; the seed converts to paise.
 *  axes      → variant matrix (cross product). Omitted = one "Standard" variant.
 *  stock     → per-variant stock, fixed or [min, max] random (deterministic seed)
 *  overrides → exact stock for specific combos, key = option values joined by "|"
 *  prices    → option value → [price, mrp] (e.g. bigger pack costs more)
 */
export interface SeedProduct {
  code: string;
  dept: 'fashion' | 'beauty' | 'electronics' | 'home' | 'grocery' | 'kids';
  name: string;
  brand: string;
  cat: string;
  price: number;
  mrp: number;
  axes?: Record<string, string[]>;
  stock: number | [number, number];
  overrides?: Record<string, number>;
  prices?: Record<string, [number, number]>;
  tags: string[];
  attributes?: Record<string, unknown>;
  description?: string;
  lowStockAt?: number;
  newIn?: boolean;
}

const XS_XXL = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const S_XXL = ['S', 'M', 'L', 'XL', 'XXL'];
const WAIST = ['28', '30', '32', '34', '36'];

export const PRODUCTS: SeedProduct[] = [
  // ───────────── FASHION ─────────────
  { code: 'F01', dept: 'fashion', name: 'Ivory Chikankari Cotton Kurta', brand: 'Noor & Thread', cat: 'kurtas', price: 1499, mrp: 2499,
    axes: { size: XS_XXL, colour: ['Ivory', 'Blush', 'Mint'] }, stock: [6, 25], overrides: { 'XL|Ivory': 0, 'L|Ivory': 2 },
    tags: ['festive', 'ethnic', 'look:festive-ivory', 'white'], attributes: { material: '100% cotton', care: 'Hand wash cold, dry in shade', fit: 'Straight', length: 'Calf length' },
    description: 'Hand-embroidered Lucknowi chikankari on breathable cotton. A festive staple that moves from puja mornings to dinner nights — pair it with the matching palazzo and juttis to complete the look.' },
  { code: 'F02', dept: 'fashion', name: 'Banarasi Silk Blend Saree', brand: 'Noor & Thread', cat: 'sarees', price: 4499, mrp: 6999,
    axes: { colour: ['Maroon', 'Emerald', 'Navy'] }, stock: 6, tags: ['festive', 'wedding', 'ethnic'], attributes: { material: 'Silk blend', length: '6.3 m with blouse piece' } },
  { code: 'F03', dept: 'fashion', name: 'Floral Wrap Midi Dress', brand: 'Urbane Edit', cat: 'dresses', price: 1799, mrp: 2999,
    axes: { size: ['XS', 'S', 'M', 'L', 'XL'], colour: ['Coral', 'Black'] }, stock: 8, tags: ['weekend', 'party', 'black', 'western'], attributes: { material: 'Viscose crepe', fit: 'Wrap' } },
  { code: 'F04', dept: 'fashion', name: 'Rayon Palazzo Pants', brand: 'Noor & Thread', cat: 'palazzos', price: 799, mrp: 1299,
    axes: { size: ['S', 'M', 'L', 'XL'], colour: ['Ivory', 'Black'] }, stock: 15, tags: ['ethnic', 'look:festive-ivory', 'black'], attributes: { material: 'Rayon', waist: 'Elasticated' } },
  { code: 'F05', dept: 'fashion', name: 'Slim Linen Shirt', brand: 'Urbane Edit', cat: 'shirts', price: 1299, mrp: 1999,
    axes: { size: S_XXL, colour: ['White', 'Sky', 'Olive'] }, stock: 10, tags: ['office', 'summer'], attributes: { material: 'Linen-cotton', fit: 'Slim' } },
  { code: 'F06', dept: 'fashion', name: 'Stretch Slim Jeans', brand: 'Urbane Edit', cat: 'jeans', price: 1599, mrp: 2499,
    axes: { size: WAIST, colour: ['Indigo', 'Black'] }, stock: 12, tags: ['everyday', 'black', 'look:weekend-black', 'denim'], attributes: { material: '98% cotton, 2% elastane', fit: 'Slim' } },
  { code: 'F07', dept: 'fashion', name: 'Classic Cotton Chinos', brand: 'Urbane Edit', cat: 'chinos', price: 1199, mrp: 1999,
    axes: { size: WAIST, colour: ['Khaki', 'Navy'] }, stock: 10, tags: ['office'], attributes: { material: 'Cotton twill', fit: 'Regular' } },
  { code: 'F08', dept: 'fashion', name: 'Oversized Fleece Hoodie', brand: 'Urbane Edit', cat: 'hoodies', price: 1399, mrp: 2299,
    axes: { size: S_XXL, colour: ['Black', 'Grey', 'Lilac'] }, stock: 14, tags: ['winter', 'black', 'gym', 'look:weekend-black'], attributes: { material: '320 GSM fleece', fit: 'Oversized' } },
  { code: 'F09', dept: 'fashion', name: 'Cloud Run White Sneakers', brand: 'Stride Lab', cat: 'sneakers', price: 2499, mrp: 3999,
    axes: { size: ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'] }, stock: 6, overrides: { 'UK 9': 1 },
    tags: ['everyday', 'gym', 'look:weekend-black', 'white'], attributes: { upper: 'Knit mesh', sole: 'EVA foam' }, lowStockAt: 2 },
  { code: 'F10', dept: 'fashion', name: 'Embroidered Juttis', brand: 'Noor & Thread', cat: 'juttis', price: 899, mrp: 1499,
    axes: { size: ['UK 4', 'UK 5', 'UK 6', 'UK 7', 'UK 8'], colour: ['Gold', 'Ivory'] }, stock: 7, tags: ['festive', 'ethnic', 'look:festive-ivory'], attributes: { upper: 'Faux leather with zari' } },
  { code: 'F11', dept: 'fashion', name: 'Oxidised Silver Jhumkas', brand: 'Kaya Bloom', cat: 'jewellery', price: 549, mrp: 999,
    stock: 30, tags: ['festive', 'look:festive-ivory', 'gifting'], attributes: { material: 'Oxidised brass', weight: '18 g' } },
  { code: 'F12', dept: 'fashion', name: 'Canvas Everyday Tote', brand: 'Urbane Edit', cat: 'bags', price: 699, mrp: 1299,
    axes: { colour: ['Natural', 'Black'] }, stock: 25, tags: ['everyday', 'black', 'look:weekend-black'], attributes: { material: '12 oz canvas', size: '40 × 38 cm' } },

  // ───────────── BEAUTY ─────────────
  { code: 'B01', dept: 'beauty', name: 'Velvet Matte Lipstick', brand: 'Glossé', cat: 'lipstick', price: 549, mrp: 799,
    axes: { shade: ['Rosewood', 'Brick Red', 'Nude Pink', 'Berry'] }, stock: 40, tags: ['party', 'look:festive-ivory', 'makeup'],
    attributes: { finish: 'Matte', weight: '4.2 g', vegan: true, crueltyFree: true },
    description: 'A one-swipe velvet matte that stays put for 12 hours without drying. Rosewood is the shade our stylists pair with ivory festive looks.' },
  { code: 'B02', dept: 'beauty', name: 'Smudge-proof Kajal', brand: 'Glossé', cat: 'eyes', price: 249, mrp: 399,
    axes: { shade: ['Jet Black', 'Brown'] }, stock: 60, tags: ['everyday', 'black', 'makeup'], attributes: { wear: '16 hours', waterproof: true } },
  { code: 'B03', dept: 'beauty', name: '10% Vitamin C Serum 30ml', brand: 'Kaya Bloom', cat: 'serums', price: 649, mrp: 899,
    stock: 35, tags: ['self-care', 'glow', 'skincare'], attributes: { skinType: 'All', volume: '30 ml' } },
  { code: 'B04', dept: 'beauty', name: 'Invisible Sunscreen SPF 50', brand: 'Kaya Bloom', cat: 'sunscreen', price: 499, mrp: 699,
    axes: { volume: ['50 g', '100 g'] }, prices: { '100 g': [849, 1199] }, stock: 30, overrides: { '50 g': 40, '100 g': 20 }, tags: ['everyday', 'summer', 'skincare'], attributes: { spf: 50, pa: 'PA++++' } },
  { code: 'B05', dept: 'beauty', name: 'Argan Repair Shampoo', brand: 'Mane Story', cat: 'shampoo', price: 399, mrp: 599,
    axes: { volume: ['250 ml', '500 ml'] }, prices: { '500 ml': [699, 999] }, stock: 20, overrides: { '250 ml': 30, '500 ml': 15 }, tags: ['self-care', 'haircare'], attributes: { sulphateFree: true } },
  { code: 'B06', dept: 'beauty', name: 'Oud Noir Eau de Parfum', brand: 'Maison Velour', cat: 'fragrance', price: 1999, mrp: 2999,
    axes: { volume: ['50 ml', '100 ml'] }, prices: { '100 ml': [2999, 4499] }, stock: 8, overrides: { '50 ml': 10, '100 ml': 6 }, tags: ['party', 'gifting', 'black'], attributes: { notes: 'Oud, black pepper, amber' } },
  { code: 'B07', dept: 'beauty', name: 'Gentle Foaming Face Wash', brand: 'Kaya Bloom', cat: 'cleansers', price: 299, mrp: 399,
    stock: 50, tags: ['everyday', 'skincare'], attributes: { volume: '150 ml', skinType: 'All' } },
  { code: 'B08', dept: 'beauty', name: 'Soft Matte Compact', brand: 'Glossé', cat: 'face', price: 449, mrp: 699,
    axes: { shade: ['Ivory', 'Beige', 'Honey'] }, stock: 20, tags: ['everyday', 'makeup'], attributes: { spf: 15 } },
  { code: 'B09', dept: 'beauty', name: 'Gel Nail Colour Kit', brand: 'Glossé', cat: 'nails', price: 649, mrp: 999,
    axes: { set: ['Pastels', 'Brights'] }, stock: 15, tags: ['party', 'gifting'], attributes: { pieces: 6 } },
  { code: 'B10', dept: 'beauty', name: 'Cedar Beard Oil', brand: 'Grove Men', cat: 'mens-grooming', price: 349, mrp: 549,
    stock: 25, tags: ['grooming', 'self-care'], attributes: { volume: '30 ml' } },
  { code: 'B11', dept: 'beauty', name: 'Keratin Hair Mask', brand: 'Mane Story', cat: 'hair-masks', price: 549, mrp: 799,
    stock: 20, tags: ['self-care', 'haircare'], attributes: { volume: '200 ml' } },
  { code: 'B12', dept: 'beauty', name: 'Hydrating Sheet Masks (Pack of 5)', brand: 'Kaya Bloom', cat: 'masks', price: 349, mrp: 499,
    stock: 40, tags: ['self-care', 'gifting', 'skincare'] },
  { code: 'B13', dept: 'beauty', name: 'Gentle Baby Lotion 200ml', brand: 'Kaya Bloom', cat: 'baby-care', price: 299, mrp: 399,
    stock: 30, tags: ['new-parent', 'baby'], attributes: { tearFree: true, dermatologicallyTested: true } },

  // ───────────── ELECTRONICS ─────────────
  { code: 'E01', dept: 'electronics', name: 'Pulse Buds Pro', brand: 'Voltex', cat: 'earbuds', price: 2999, mrp: 5999,
    axes: { colour: ['Midnight', 'Frost', 'Coral'], edition: ['Standard', 'Pro ANC'] }, prices: { 'Pro ANC': [3999, 6999] },
    stock: [12, 18], overrides: { 'Midnight|Pro ANC': 4, 'Frost|Pro ANC': 8, 'Coral|Pro ANC': 6 },
    tags: ['black', 'gym', 'travel', 'fitness', 'look:weekend-black', 'audio'],
    attributes: { battery: '36 h with case', bluetooth: '5.3', anc: true, waterResistance: 'IPX5', warranty: '1 year' },
    description: 'Hybrid active noise cancellation, 36 hours of battery with the case, and a low-latency mode for games. The Pro ANC edition adds adaptive transparency.' },
  { code: 'E02', dept: 'electronics', name: 'Orbit Smartwatch S2', brand: 'Voltex', cat: 'smartwatches', price: 4499, mrp: 7999,
    axes: { colour: ['Black', 'Silver', 'Rose'] }, stock: 9, tags: ['fitness', 'black', 'wearable'], attributes: { display: '1.43" AMOLED', battery: '10 days', gps: true, warranty: '1 year' } },
  { code: 'E03', dept: 'electronics', name: '20000mAh Power Bank 22.5W', brand: 'Ampere', cat: 'power-banks', price: 1499, mrp: 2499,
    axes: { colour: ['Black', 'White'] }, stock: 20, tags: ['travel', 'black'], attributes: { capacity: '20000 mAh', output: '22.5 W', warranty: '6 months' } },
  { code: 'E04', dept: 'electronics', name: 'Neoprene Laptop Sleeve', brand: 'Ampere', cat: 'laptop-sleeves', price: 799, mrp: 1299,
    axes: { fit: ['13 inch', '15 inch'], colour: ['Black', 'Grey'] }, stock: 15, tags: ['wfh', 'travel', 'black'], attributes: { material: 'Neoprene' } },
  { code: 'E05', dept: 'electronics', name: 'Boom Mini Bluetooth Speaker', brand: 'Voltex', cat: 'speakers', price: 1799, mrp: 2999,
    axes: { colour: ['Black', 'Teal', 'Red'] }, stock: 12, tags: ['party', 'black', 'audio'], attributes: { output: '10 W', battery: '12 h', waterResistance: 'IPX7', warranty: '1 year' } },
  { code: 'E06', dept: 'electronics', name: 'MagSafe Clear Phone Case', brand: 'Ampere', cat: 'phone-cases', price: 499, mrp: 999,
    axes: { model: ['Phone 15', 'Phone 16'] }, stock: 40, tags: ['everyday'], attributes: { material: 'Polycarbonate + TPU' } },
  { code: 'E07', dept: 'electronics', name: '65W GaN USB-C Charger', brand: 'Ampere', cat: 'chargers', price: 1699, mrp: 2999,
    stock: 25, tags: ['travel', 'wfh'], attributes: { output: '65 W', ports: '2× USB-C, 1× USB-A', warranty: '1 year' } },
  { code: 'E08', dept: 'electronics', name: 'Low-profile Wireless Keyboard', brand: 'Keycraft', cat: 'keyboards', price: 2199, mrp: 3499,
    axes: { colour: ['Graphite', 'White'] }, stock: 10, tags: ['wfh', 'look:wfh-desk'], attributes: { connectivity: 'Bluetooth + 2.4 GHz', battery: '6 months', warranty: '1 year' } },
  { code: 'E09', dept: 'electronics', name: 'Silent Ergonomic Mouse', brand: 'Keycraft', cat: 'mice', price: 899, mrp: 1499,
    axes: { colour: ['Graphite', 'White'] }, stock: 18, tags: ['wfh', 'look:wfh-desk'], attributes: { dpi: '800–2400', warranty: '1 year' } },
  { code: 'E10', dept: 'electronics', name: 'Wi-Fi Smart Bulb 9W', brand: 'Lumio', cat: 'smart-home', price: 599, mrp: 999,
    axes: { pack: ['Pack of 1', 'Pack of 3'] }, prices: { 'Pack of 3': [1499, 2499] }, stock: 20, overrides: { 'Pack of 1': 30, 'Pack of 3': 15 }, tags: ['smart-home', 'cosy'], attributes: { colours: '16 million', voice: 'Alexa & Google' } },
  { code: 'E11', dept: 'electronics', name: '1080p Webcam with Mic', brand: 'Keycraft', cat: 'webcams', price: 1999, mrp: 3499,
    stock: 8, tags: ['wfh', 'look:wfh-desk'], attributes: { resolution: '1080p 30fps', mic: 'Dual noise-reducing', warranty: '1 year' } },
  { code: 'E12', dept: 'electronics', name: 'Nova Tab 11', brand: 'Voltex', cat: 'tablets', price: 18999, mrp: 24999,
    axes: { colour: ['Grey', 'Blue'], storage: ['128 GB', '256 GB'] }, prices: { '256 GB': [22999, 28999] }, stock: 5, overrides: { 'Grey|256 GB': 3, 'Blue|256 GB': 3 },
    tags: ['wfh', 'study'], attributes: { display: '11" 2K 90 Hz', battery: '8000 mAh', warranty: '1 year' }, newIn: true },

  // ───────────── HOME & LIVING ─────────────
  { code: 'H01', dept: 'home', name: 'Terracotta Table Lamp', brand: 'Hearth & Co.', cat: 'lighting', price: 2199, mrp: 3499,
    axes: { finish: ['Terracotta', 'Sand'] }, stock: 9, overrides: { Sand: 2 }, tags: ['cosy', 'look:wfh-desk', 'decor'],
    attributes: { material: 'Hand-thrown terracotta, linen shade', bulb: 'E27 (not included)', height: '45 cm' },
    description: 'A hand-thrown terracotta base with a natural linen shade — warm light for desks, bedside tables and slow evenings.' },
  { code: 'H02', dept: 'home', name: '300TC Cotton Bedsheet Set', brand: 'Hearth & Co.', cat: 'bedsheets', price: 1799, mrp: 2999,
    axes: { bed: ['Queen', 'King'], colour: ['White', 'Sage', 'Blush'] }, stock: 10, tags: ['cosy', 'white'], attributes: { threadCount: 300, includes: '1 bedsheet + 2 pillow covers' } },
  { code: 'H03', dept: 'home', name: 'Hand-block Cushion Covers (Set of 2)', brand: 'Hearth & Co.', cat: 'cushions', price: 799, mrp: 1299,
    axes: { colour: ['Indigo', 'Mustard', 'Rust'] }, stock: 20, tags: ['festive', 'decor'], attributes: { size: '16 × 16 in', material: 'Cotton' } },
  { code: 'H04', dept: 'home', name: 'Speckled Ceramic Mugs (Set of 2)', brand: 'Kiln Studio', cat: 'mugs', price: 649, mrp: 999,
    axes: { colour: ['Cream', 'Charcoal'] }, stock: 25, tags: ['look:wfh-desk', 'gifting', 'kitchen'], attributes: { capacity: '350 ml each', microwaveSafe: true } },
  { code: 'H05', dept: 'home', name: 'Tri-ply Cookware Set (3 pc)', brand: 'Hearth & Co.', cat: 'cookware', price: 4999, mrp: 7999,
    stock: 6, tags: ['kitchen'], attributes: { material: 'Tri-ply stainless steel', induction: true } },
  { code: 'H06', dept: 'home', name: 'Silent Sweep Wall Clock', brand: 'Kiln Studio', cat: 'clocks', price: 1199, mrp: 1999,
    axes: { colour: ['Walnut', 'Black'] }, stock: 12, tags: ['minimal', 'black', 'decor'], attributes: { diameter: '30 cm', movement: 'Silent sweep' } },
  { code: 'H07', dept: 'home', name: 'Self-watering Planter', brand: 'Greenly', cat: 'planters', price: 749, mrp: 1299,
    axes: { pot: ['Small', 'Medium'] }, prices: { Medium: [999, 1599] }, stock: 10, overrides: { Small: 15, Medium: 10 }, tags: ['balcony', 'decor'] },
  { code: 'H08', dept: 'home', name: 'Blackout Curtains (Pair)', brand: 'Hearth & Co.', cat: 'curtains', price: 1499, mrp: 2499,
    axes: { colour: ['Grey', 'Navy', 'Beige'], length: ['5 ft', '7 ft'] }, stock: 8, tags: ['minimal', 'black'], attributes: { blackout: '90%' } },
  { code: 'H09', dept: 'home', name: 'Zero-twist Bath Towels (Set of 2)', brand: 'Hearth & Co.', cat: 'bath', price: 899, mrp: 1499,
    axes: { colour: ['White', 'Teal'] }, stock: 20, tags: ['everyday', 'white'], attributes: { gsm: 550 } },
  { code: 'H10', dept: 'home', name: 'Rotating Spice Rack', brand: 'Kiln Studio', cat: 'storage', price: 1099, mrp: 1799,
    stock: 10, tags: ['kitchen'], attributes: { jars: 16 } },
  { code: 'H11', dept: 'home', name: 'Soy Wax Candle Set (3)', brand: 'Greenly', cat: 'candles', price: 699, mrp: 1199,
    axes: { scent: ['Sandalwood', 'Jasmine', 'Vanilla'] }, stock: 15, tags: ['cosy', 'gifting', 'festive'], attributes: { burnTime: '25 h each' } },
  { code: 'H12', dept: 'home', name: 'Handwoven Jute Rug', brand: 'Hearth & Co.', cat: 'rugs', price: 2499, mrp: 3999,
    axes: { dimensions: ['3 × 5 ft', '4 × 6 ft'] }, prices: { '4 × 6 ft': [3499, 5499] }, stock: 7, overrides: { '4 × 6 ft': 4 }, tags: ['minimal', 'decor'], newIn: true },

  // ───────────── GROCERY ─────────────
  { code: 'G01', dept: 'grocery', name: 'Whole Wheat Chakki Atta', brand: 'FreshFold', cat: 'atta', price: 289, mrp: 340,
    axes: { weight: ['5 kg', '10 kg'] }, prices: { '10 kg': [549, 650] }, stock: 120, overrides: { '10 kg': 60 },
    tags: ['staples', 'monthly'], attributes: { veg: true, shelfLifeDays: 90 }, lowStockAt: 10,
    description: 'Stone-ground whole wheat from Madhya Pradesh sharbati grain. Soft rotis, every day.' },
  { code: 'G02', dept: 'grocery', name: 'Aged Basmati Rice', brand: 'FreshFold', cat: 'rice', price: 649, mrp: 799,
    axes: { weight: ['5 kg'] }, stock: 80, tags: ['staples', 'monthly'], attributes: { veg: true, aged: '2 years' }, lowStockAt: 10 },
  { code: 'G03', dept: 'grocery', name: 'Cold-pressed Olive Oil', brand: 'Oliva Fresh', cat: 'oil', price: 399, mrp: 499,
    axes: { volume: ['500 ml', '1 L'] }, prices: { '1 L': [699, 899] }, stock: 40, overrides: { '1 L': 30 }, tags: ['healthy'], attributes: { veg: true, type: 'Extra virgin' } },
  { code: 'G04', dept: 'grocery', name: 'Unpolished Toor Dal', brand: 'FreshFold', cat: 'dal', price: 179, mrp: 220,
    axes: { weight: ['1 kg'] }, stock: 100, tags: ['staples', 'monthly'], attributes: { veg: true }, lowStockAt: 10 },
  { code: 'G05', dept: 'grocery', name: 'California Almonds', brand: 'NutriNest', cat: 'dry-fruits', price: 549, mrp: 699,
    axes: { weight: ['250 g', '500 g'] }, prices: { '500 g': [999, 1299] }, stock: 40, overrides: { '500 g': 25 }, tags: ['healthy', 'gifting'], attributes: { veg: true } },
  { code: 'G06', dept: 'grocery', name: 'Darjeeling Green Tea (100 bags)', brand: 'Leaf & Co.', cat: 'tea', price: 399, mrp: 499,
    stock: 50, tags: ['healthy', 'beverages'], attributes: { veg: true } },
  { code: 'G07', dept: 'grocery', name: 'Crunchy Fruit & Nut Muesli', brand: 'Morning Co.', cat: 'breakfast', price: 399, mrp: 499,
    axes: { weight: ['500 g', '1 kg'] }, prices: { '1 kg': [699, 899] }, stock: 35, overrides: { '1 kg': 20 }, tags: ['breakfast', 'healthy'], attributes: { veg: true } },
  { code: 'G08', dept: 'grocery', name: '70% Dark Chocolate', brand: 'Cocoa Craft', cat: 'chocolate', price: 149, mrp: 199,
    stock: 80, tags: ['party-snacks', 'gifting'], attributes: { veg: true, weight: '100 g' } },
  { code: 'G09', dept: 'grocery', name: 'Raw Wild Honey', brand: 'NutriNest', cat: 'sweeteners', price: 349, mrp: 449,
    axes: { weight: ['500 g'] }, stock: 40, tags: ['healthy', 'breakfast'], attributes: { veg: true } },
  { code: 'G10', dept: 'grocery', name: 'Desi Cow Ghee', brand: 'FreshFold', cat: 'ghee', price: 649, mrp: 749,
    axes: { volume: ['500 ml', '1 L'] }, prices: { '1 L': [1199, 1399] }, stock: 30, overrides: { '1 L': 20 }, tags: ['staples', 'monthly'], attributes: { veg: true } },
  { code: 'G11', dept: 'grocery', name: 'Assam Masala Chai', brand: 'Leaf & Co.', cat: 'tea', price: 249, mrp: 299,
    axes: { weight: ['250 g'] }, stock: 60, tags: ['breakfast', 'monthly', 'beverages'], attributes: { veg: true } },
  { code: 'G12', dept: 'grocery', name: 'Cold-pressed Orange Juice 1L', brand: 'Morning Co.', cat: 'juice', price: 169, mrp: 199,
    stock: 25, tags: ['breakfast', 'beverages'], attributes: { veg: true, perishable: true, shelfLifeDays: 5 } },

  // ───────────── KIDS & TOYS ─────────────
  { code: 'K01', dept: 'kids', name: 'Wooden Rainbow Stacker', brand: 'TinyTrail', cat: 'infant-toys', price: 899, mrp: 1299,
    stock: 30, tags: ['0-2', 'new-parent', 'learning'], attributes: { ageBand: '1–3 years', material: 'Pine wood, water-based paint', safety: 'BIS certified' },
    description: 'Seven chunky rainbow arches in sustainable pine — stack, balance, build tunnels. Finished with child-safe water-based colours.' },
  { code: 'K02', dept: 'kids', name: 'Rock Crawler RC Car', brand: 'ZoomKid', cat: 'rc-toys', price: 1799, mrp: 2999,
    axes: { colour: ['Red', 'Blue'] }, stock: 10, tags: ['6-9', 'gifting'], attributes: { ageBand: '6+ years', battery: 'Rechargeable', safety: 'BIS certified' } },
  { code: 'K03', dept: 'kids', name: 'India Map Puzzle (100 pc)', brand: 'BrainBox', cat: 'puzzles', price: 449, mrp: 699,
    stock: 25, tags: ['6-9', 'learning'], attributes: { ageBand: '6+ years', safety: 'BIS certified' } },
  { code: 'K04', dept: 'kids', name: 'Printed Cotton Kids Tee', brand: 'TinyTrail', cat: 'kids-fashion', price: 349, mrp: 599,
    axes: { size: ['2-3Y', '4-5Y', '6-7Y', '8-9Y'], colour: ['Yellow', 'Blue'] }, stock: 15, tags: ['everyday', '3-5', '6-9'], attributes: { material: '100% cotton' } },
  { code: 'K05', dept: 'kids', name: 'Rocket School Bag', brand: 'ZoomKid', cat: 'school-bags', price: 899, mrp: 1499,
    axes: { colour: ['Blue', 'Pink', 'Black'] }, stock: 15, tags: ['school', 'black', '6-9'], attributes: { capacity: '18 L', ageBand: '5–10 years' } },
  { code: 'K06', dept: 'kids', name: 'Jumbo Crayon Set (24)', brand: 'BrainBox', cat: 'art', price: 249, mrp: 399,
    stock: 40, tags: ['3-5', 'school'], attributes: { nonToxic: true } },
  { code: 'K07', dept: 'kids', name: 'Cuddle Bear Plush 40cm', brand: 'TinyTrail', cat: 'plush', price: 649, mrp: 999,
    axes: { colour: ['Honey', 'Cream'] }, stock: 20, tags: ['0-2', 'gifting', 'new-parent'], attributes: { ageBand: '0+ years', safety: 'BIS certified' } },
  { code: 'K08', dept: 'kids', name: 'Builder Blocks (250 pc)', brand: 'BrainBox', cat: 'building', price: 1499, mrp: 2499,
    stock: 12, tags: ['6-9', '10+', 'learning'], attributes: { ageBand: '6+ years' } },
  { code: 'K09', dept: 'kids', name: 'Bedtime Story Books (Set of 5)', brand: 'Little Pages', cat: 'books', price: 599, mrp: 999,
    stock: 25, tags: ['3-5', 'learning'], attributes: { language: 'English', ageBand: '3–6 years' } },
  { code: 'K10', dept: 'kids', name: 'Steel Insulated Kids Bottle', brand: 'ZoomKid', cat: 'bottles', price: 499, mrp: 799,
    axes: { colour: ['Dino Green', 'Unicorn Pink'] }, stock: 30, tags: ['school'], attributes: { capacity: '500 ml', bpaFree: true } },
  { code: 'K11', dept: 'kids', name: 'Family Board Game Night', brand: 'BrainBox', cat: 'games', price: 999, mrp: 1499,
    stock: 15, tags: ['10+', 'gifting'], attributes: { players: '2–6', ageBand: '8+ years' } },
  { code: 'K12', dept: 'kids', name: 'Cotton Frill Frock', brand: 'TinyTrail', cat: 'kids-fashion', price: 699, mrp: 1199,
    axes: { size: ['1-2Y', '3-4Y', '5-6Y'], colour: ['Peach', 'Lilac'] }, stock: 10, tags: ['festive', 'new-parent', '0-2', '3-5'], attributes: { material: 'Cotton voile' } },
];

export const DEPT_BLURB: Record<string, string> = {
  fashion: 'Cut for comfort, finished for compliments. Easy 7-day size exchanges.',
  beauty: 'Dermatologically tested, cruelty-free and 100% genuine — sourced directly from the brand.',
  electronics: 'Brand warranty included. Ships sealed with GST invoice.',
  home: 'Designed for Indian homes, built to be lived with.',
  grocery: 'Packed fresh in our dark store and delivered in your chosen slot.',
  kids: 'Safety-tested, age-graded and made for small hands.',
};
