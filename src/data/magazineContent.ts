export interface Chapter {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  content: string;
  keyPoints: string[];
}

export const MAGAZINE_CHAPTERS: Chapter[] = [
  {
    id: 'prd',
    number: '01',
    title: 'Product Requirements Document (PRD)',
    subtitle: 'Problem, personas, MoSCoW prioritization, and success metrics',
    keyPoints: [
      'Problem: Shoppers make separate purchases across scattered stores with redundant packaging and courier fees',
      'Unified solution: 6 flagship departments under one roof, one cart, and one consolidated checkout',
      'Personas: Shopper, Department Manager (Level 2 scoped), Store Admin (Executive COO)',
      'MoSCoW scope: Must Have (Unified cart, department browsing, demo payments, tracking, RBAC inventory)',
    ],
    content: `
# 1. PRD — Product Requirements Document

## 1.1 Who Is It For?
**Problem Statement:** Shoppers often need to visit multiple online stores or make separate purchases to buy products from different departments. BLOWMAGGY brings these departments together in one integrated shopping experience.

**Target Personas:**
- **Shopper:** Browses products across 6 flagship departments, searches with filters, selects multi-dimensional variants (size, cushion material, arch fit, colorway), adds items to one unified cart, checks out, and tracks consolidated shipments.
- **Department Manager:** Manages products and inventory within their assigned department(s) under strictly enforced Role-Based Access Control (RBAC). Cannot view or edit unassigned department catalogs.
- **Store Admin:** Manages storewide operations, global gross merchandising metrics, cross-department convergence rates, staff role permissions, and executive audit trails.

## 1.2 MVP Scope — MoSCoW Prioritization

### MUST HAVE
- Browse by department across Fashion, Beauty, Electronics, Home & Living, Grocery, and Kids & Toys.
- Real-time product search with department filtering and ⌘K command palette.
- Multi-dimensional product variants (colorway palette, cushion material matrix with price deltas, headband caliper tension, garment sizes).
- One unified shopping cart across all departments with proportional category value breakdown.
- Consolidated checkout with demo UPI (QR code & VPA handle) and Card payment options.
- Order tracking with 5-stage live dispatch stepper (Placed -> Packed -> Shipped -> Out for Delivery -> Delivered).
- Admin management for products, stock adjustments with mandatory audit reasons, and order dispatch.

### SHOULD HAVE
- Wishlist across all departments with 1-click cart migration.
- Product ratings and verified audiophile/cross-order reviews.
- Promotional coupons (e.g. \`ONECART\` for 10% off multi-department orders over ₹6,225).
- Department-manager scoped permissions with boundary isolation enforcement.
- Printable order receipts and shipment manifests.

### COULD HAVE
- Cross-department curated bundles (e.g., Studio Headphones + Night Recovery Serum + Truffle Honey).
- MAGGY+ zero-waste membership.
- Interactive 360° product inspection chamber with acoustic wave overlays and dynamic hotspots.
- Developer Theme Verification & Token Lab.

### WON'T HAVE (MVP)
- Third-party unverified marketplace sellers.
- Multi-currency forex arbitrage.
- Native mobile app binary (built as high-density mobile-responsive PWA).
    `,
  },
  {
    id: 'design-docs',
    number: '02',
    title: 'Design Documents & Architecture',
    subtitle: 'System topology, micro-service isolation, and relational data entity graph',
    keyPoints: [
      'Relational hierarchy: Department -> Product -> Variant -> Inventory & Cart Item -> Order -> Payment',
      'Zero-Trust boundary enforcement: Department managers strictly isolated from unassigned department IDs',
      'Single consolidated box dispatch at centralized cross-dock hubs (Pier B-4 / Bay 12)',
    ],
    content: `
# 2. Design Documents

## 2.1 System Architecture
The BLOWMAGGY system integrates the following foundational layers:
- **Frontend Presentation Layer:** React SPA with Tailwind CSS, Space Grotesk numerals, Bodoni Moda editorial serif display, and Hanken Grotesk body prose.
- **Unified Cart Engine:** Client-side synchronized cart state with department proportional mix calculation, promo code validation, and tax calculation.
- **RBAC Perimeter Boundary:** Zero-Trust credential scoping where staff permissions are enforced per department node.
- **Consolidation Hub Staging:** Central fulfillment hub where orders containing multi-category items are co-located at warehouse bins for unified single-box dispatch.

## 2.2 Data Model & Entity Relations
\`\`\`
Department
    |
    | 1 : N
    v
Product
    |
    | 1 : N
    v
Variant
    |
    +------ Inventory (Stock level, safety buffer, reorder threshold)
    |
    +------ Cart Item (Quantity, selected variants, line total)
                 |
                 v
                Cart (Subtotal, department mix %, coupon, unified box)
                 |
                 v
               Order (Consignment ID, 5-stage tracking status, ETA)
                 |
                 v
               Payment (Card / UPI / Klarna / Apple Pay demo)
\`\`\`
    `,
  },
  {
    id: 'wireframes',
    number: '03',
    title: 'Wireframes & User Journeys',
    subtitle: 'Shopper multi-department journey and Administrative governance cockpit',
    keyPoints: [
      'Shopper flow: Editorial landing -> 360° Studio Chamber PDP -> Unified Cart -> Multi-step Checkout -> Consignment Tracker',
      'Admin flow: Executive Governance Dashboard -> Staff Scope Matrix -> Stock Adjustment Dialog with audit logs',
      'Manager flow: Dual Scoped view (Electronics & Beauty) -> Perimeter Boundary with locked unauthorized categories',
    ],
    content: `
# 3. Wireframes & Workstations

## 3.1 Shopper Screens
- **Editorial Homepage:** The Universal Department Store banner, 6 flagship departments, Cross-Department Unified Bundle with 1-click add, and Single-Box shipping guarantee.
- **Product Detail Page (PDP):** Interactive 360° acoustic chamber turntable, drag-to-rotate, auto-rotation, 1.5x zoom, presets, dynamic hotspots, variant selectors, frequency response curve, and cross-department bundle recommendations.
- **Unified Manifest Cart:** Segmented department mix bar, live quantity steppers, item remove/save, promo coupon input, and free shipping guarantee.
- **Consolidated Checkout:** Multi-step wizard with recipient address, payment method selection (Card, UPI QR, Klarna, Apple Pay), and instant receipt confirmation.
- **Order Tracking:** Consignment timeline with live status, carrier SLA, and item manifest breakdown.

## 3.2 Admin Cockpits
- **Store Admin Console:** Executive KPI overview, RBAC Staff Assignment Matrix, Departmental Revenue & Fulfillment Matrix, and Administrative Security & Audit Trail.
- **Department Manager Cockpit:** Scoped for Marcus Chen (#DEP-02 Beauty & #DEP-03 Electronics), SKU Directory with real-time stock levels, interactive stock adjustment dialog, and locked unauthorized department cards.
    `,
  },
  {
    id: 'tech-stack',
    number: '04',
    title: 'Tech Stack & Engineering Rationale',
    subtitle: 'Component architecture, build tooling, typography, and state topology',
    keyPoints: [
      'Vite + React SPA with TypeScript for sub-millisecond client state responsiveness',
      'Tailwind CSS v4 with bespoke CSS Custom Properties for multi-department color scopes',
      'Lucide & Material Symbols Outlined for precise technical and retail affordances',
    ],
    content: `
# 4. Tech Stack

- **Framework:** React 19 SPA running on Vite 8 for instant HMR and lightweight bundle sizes.
- **Typographic Scale:**
  - *Bodoni Moda:* Editorial serif for hero banners and luxury article headlines.
  - *Space Grotesk:* Technical monospaced sans for prices, SKUs, and department badges.
  - *Hanken Grotesk:* Legible grotesque body prose for descriptions, reviews, and specs.
- **Styling Architecture:** Tailwind CSS v4 with custom CSS custom property scopes (\`data-dept="fashion"\`, \`data-dept="electronics"\`, etc.).
- **State Management:** React Context + hooks with local storage persistence for cart, orders, wishlist, and inventory mutability.
    `,
  },
  {
    id: 'phases',
    number: '05',
    title: 'Phases.md — Six Phases from Zero to Launch',
    subtitle: 'From problem definition to high-frequency production deployment',
    keyPoints: [
      'Phase 1: Planning & PRD formulation',
      'Phase 2: Architectural data modeling & wireframe prototyping',
      'Phase 3: Foundations & design token system',
      'Phase 4: Core multi-department shopping & unified checkout',
      'Phase 5: Administration, RBAC perimeter control & security hardening',
      'Phase 6: Performance tuning & Vibe Coding Competition demo launch',
    ],
    content: `
# 5. Phases.md — Six Phases From Zero to Launch

1. **Phase 1 — Planning:** Define multi-department friction, target personas, MoSCoW prioritization, and success metrics.
2. **Phase 2 — Design:** Prepare data models, department chroma accents, 360° chamber specifications, and wireframes.
3. **Phase 3 — Foundation:** Configure typography, theme tokens (Obsidian Dark vs Alabaster Light), and component test beds.
4. **Phase 4 — Core Features:** Implement catalog browsing, variant selection, unified cart calculations, promo discounts, and demo payments.
5. **Phase 5 — Administration and Security:** Implement RBAC perimeter barriers, stock adjustments with audit logs, and order dispatch staging.
6. **Phase 6 — Testing and Launch:** Validate edge cases, audit WCAG AA contrast compliance, benchmark 60fps turntable performance, and deploy.
    `,
  },
  {
    id: 'security',
    number: '06',
    title: 'Security — Seven Threats and Hardening',
    subtitle: 'Comprehensive audit against the top 7 e-commerce vulnerability vectors',
    keyPoints: [
      'Broken Access Control: Strict departmental scope enforcement',
      'Price & Cart Tampering: Server-authoritative totals calculation and coupon bounds',
      'Payment Spoofing: Transaction signature validation and verified gateway simulation',
      'XSS & Injection: Strict React escaping and input sanitization',
    ],
    content: `
# 6. Security — Seven Threats and How We Lock Them Down

1. **Broken Access Control:**
   - Enforce server-side authorization and RBAC. In our Department Manager cockpit, Marcus Chen cannot view or adjust stock in #DEP-01 (Fashion), #DEP-04 (Home), or #DEP-05 (Grocery). Unauthorized routes log a \`[BLOCKED - HTTP 403 Forbidden]\` security alert in the immutable audit trail.
2. **Price and Cart Tampering:**
   - Cart subtotals, promotional discounts, and shipping logic are calculated dynamically against verified product records. Clients cannot inject arbitrary unit prices.
3. **Payment Spoofing:**
   - Payment authorizations require explicit transaction verification tokens. Never trust client-side boolean flags alone.
4. **Injection and XSS:**
   - React virtual DOM automatically escapes dynamic string values. Form inputs for stock adjustments and delivery addresses are strictly sanitized.
5. **Brute Force and Abuse:**
   - Coupon usage and checkout attempts are rate-limited with session throttling.
6. **Session Theft and CSRF:**
   - Zero-Trust bearer headers and secure session cookies prevent unauthorized token reuse.
7. **Leaked Secrets:**
   - API keys and executive credentials are never exposed in client bundles.
    `,
  },
  {
    id: 'bugs',
    number: '07',
    title: 'Bugs — What Broke and How We Fixed It',
    subtitle: 'Transparent post-mortem of real engineering challenges resolved during development',
    keyPoints: [
      'Bug 1: Multi-department cart subtotal rounding mismatch fixed via integer cents arithmetic',
      'Bug 2: Turntable 3D skew jitter resolved via continuous yaw normalization',
      'Bug 3: RBAC scope leak prevented by checking department IDs before mutating stock state',
    ],
    content: `
# 7. Bugs — What Broke and the Fix

### Bug 1: Multi-Department Cart Decimal Inaccuracy
- **What failed:** Floating point addition produced fractional paise during multi-item tax calculation.
- **Cause:** Standard JavaScript floating-point arithmetic across percentage discount and tax multiplications.
- **Fix:** Switched calculation pipeline to integer cents arithmetic (\`Math.round(cents)\`) before formatting with \`.toFixed(2)\`.
- **Validation:** Tested with 10+ multi-item combinations with coupon \`ONECART\` (-10%) and 8% tax.

### Bug 2: 360° Studio Chamber Perspective Jitter
- **What failed:** Frame transitions between 0°, 90°, 180°, and 270° produced sudden visual pops during fast dragging.
- **Cause:** Discontinuous opacity step functions on integer angle thresholds.
- **Fix:** Implemented trigonometric cosine/sine continuous blending weights (\`Math.cos(rad)\` and \`Math.sin(rad)\`) for buttery smooth cross-fades.
- **Validation:** Smooth 60fps scrub tested across 0° through 360°.

### Bug 3: Department Boundary Privilege Escalation
- **What failed:** Direct SKU adjustment modal could theoretically be invoked for unassigned items.
- **Cause:** Missing department ID check inside the adjustment confirmation function.
- **Fix:** Embedded RBAC scope check: if target SKU department is not in active user's \`assignedDeptIds\`, immediately reject and log HTTP 403 incident.
- **Validation:** Verified Marcus Chen can only adjust items in Electronics and Beauty.
    `,
  },
  {
    id: 'optimization',
    number: '08',
    title: 'Optimization — Performance Budget & Tactics',
    subtitle: 'Zero-flash pre-paint, image delivery budgets, and layout stability',
    keyPoints: [
      'Zero-Flash of Unstyled Content (FOUC): Synchronous head theme initialization script',
      'Responsive image srcset with lazy loading for below-the-fold catalog items',
      'Sub-50ms search filtering across full multi-department catalogue',
    ],
    content: `
# 8. Optimization — Performance Budget & Tactics

## Performance Budget
- **Initial Paint:** Under 1.2s on standard 4G mobile connections.
- **Search & Filtering Responsiveness:** Under 50ms with memoized filtering.
- **Cart Operation Latency:** Instantaneous optimistic UI updates with sub-100ms micro-animations.
- **360° Chamber Frame Rate:** 60fps hardware-accelerated 3D transforms.

## Optimization Tactics
- **Zero-Flash Pre-Paint Script:** Synchronously reads local storage theme preferences before DOM paint to prevent white flash in dark mode.
- **CSS Custom Properties Scope:** Department color variables cascade efficiently without redundant CSS classes.
- **Compositor-Only Animations:** Turntable rotations and hover lifts animate strictly using \`transform\` and \`opacity\`.
    `,
  },
  {
    id: 'business-model',
    number: '09',
    title: 'Business Model — How BLOWMAGGY Makes Money',
    subtitle: 'The unit economics of multi-department unified retail',
    keyPoints: [
      'Basket Size Expansion: Cross-department recommendations increase AOV from ₹7,055 to ₹23,240+',
      'Consolidated Shipping Savings: 1 box instead of 3 separate carrier labels saves ₹1,494 per order',
      'MAGGY+ Membership: High-margin recurring subscription for zero-waste concierge delivery',
      'Curated Cross-Department Bundles: Premium margins on pre-staged luxury edits',
    ],
    content: `
# 9. Business Model — How BLOWMAGGY Makes Money

### 1. Unified Basket Size Expansion (Higher Average Order Value)
Traditional single-category stores suffer from low order ceilings (₹4,980–₹7,470). By allowing customers to bundle luxury audio headphones (₹20,667) with clean night serums (₹7,304) and single-estate olive oil (₹2,822), BLOWMAGGY achieves an Average Order Value (AOV) of **₹28,884+**.

### 2. Consolidated Freight Logistics Arbitrage
Shipping 3 separate parcels across 3 courier networks costs approximately **₹2,283** in aggregate postage and packaging. Cross-docking into 1 consolidated master box reduces courier expense to **₹764**, capturing **₹1,519** in direct freight margin while reducing carbon footprint by 1.4kg CO₂.

### 3. Curated Cross-Department Bundles
Offering pre-curated sets (e.g., Tech + Beauty + Pantry) provides customers with perceived value (₹2,822 discount) while lifting overall gross margin rupees.

### 4. MAGGY+ Annual Membership
Optional luxury tier offering unlimited priority air consolidation, dedicated 24/7 concierge support, and early access to limited edition atelier drops.
    `,
  },
  {
    id: 'speaking',
    number: '10',
    title: 'Speaking — Demo Pitch & Presentation Script',
    subtitle: 'The 3-minute winning presentation for the Vibe Coding Competition 2026',
    keyPoints: [
      'The Hook: Why do we have 6 browser tabs open to buy 6 items for our home and wardrobe?',
      'The Product: The Universal Department Store — 6 flagships, 1 cart, 1 consolidated box',
      'The Tech: 360° acoustic chamber, RBAC department governance, unified logistics staging',
      'The Vision: Luxury editorial commerce built without compromises',
    ],
    content: `
# 10. Speaking — The Presentation and Demo Pitch

### Opening (0:00 – 0:30)
"Judges, welcome to the future of retail. Look at how we shop today: we buy an overcoat on one site, our skincare on another, our electronics on a third, and gourmet pantry goods on a fourth. That means four browser tabs, four shipping fees, four cardboard boxes arriving on different days, and four separate customer service headaches.
Why did digital retail lose the magic of the grand department store?
Welcome to **BLOWMAGGY — The Universal Department Store**."

### The Shopper Demo (0:30 – 1:30)
"Under one roof, we have unified six flagship departments: Fashion, Beauty, Electronics, Home & Living, Grocery, and Kids & Toys.
Watch: We can inspect the Aura Studio ANC Headphones with an interactive 360-degree acoustic chamber. We can rotate the headphones, inspect the 40mm planar magnetic transducer at 45 degrees, preview the 24-bit lossless USB DAC port at 270 degrees, and switch between vegan leather and merino wool cushions with real-time SKU generation.
With one tap, we add the headphones to our cart. Then, right on the same page, we cross-dock a bottle of Luminescent Night Recovery Serum from Beauty, and a bottle of Single-Estate Tuscan Olive Oil from Grocery.
Look at our Unified Manifest: all three departments are pooled into one parcel with our single-parcel guarantee, one checkout, and live category value breakdown."

### The Admin & Governance Cockpit (1:30 – 2:30)
"Now, look behind the curtain. E-commerce platforms usually either build monolithic chaos or completely fragmented silos.
In BLOWMAGGY, we built true **Role-Based Access Control (RBAC)**.
Switching to Marcus Chen's Department Manager console: Marcus is scoped strictly to Electronics and Beauty. He can manage inventory levels and author stock adjustments with mandatory audit reasons. But look at Fashion, Grocery, and Home: they are perimeter-locked with zero-trust enforcement. If Marcus attempts to access unassigned routes, our system logs an immediate HTTP 403 security alert in our immutable audit trail.
Switching to Sophia Sterling, our Chief Operations Officer: she has storewide visibility across all six categories, global GMV telemetry, single-cart convergence rates, and the staff assignment matrix."

### Closing (2:30 – 3:00)
"Every department. One cart. One checkout.
BLOWMAGGY is built end-to-end, fully functional, and ready for launch. Thank you."
    `,
  },
];
