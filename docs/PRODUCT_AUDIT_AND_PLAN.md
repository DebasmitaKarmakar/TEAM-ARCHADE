# BLOWMAGGY — Cross-Verified Audit & Implementation Plan

Audit date: 23 October 2026. This assessment is based on the current `src/` implementation, not on the removed backend folders visible in Git status.

## Honest prototype score

| Dimension | Score | Evidence |
| --- | ---: | --- |
| Visual direction | 8.5 / 10 | Strong editorial storefront, coherent dark premium aesthetic, large product storytelling and responsive Tailwind layouts. |
| Shopper journey | 9 / 10 | Department browsing, dedicated filtered search, PDP variants, cart, multiple coupons, checkout receipt, history and tracking all share local state. |
| Admin/manager workflow | 8.5 / 10 | Dynamic manager scope plus admin product CRUD, stock, coupon and order-stage actions work in the browser. |
| Role integrity | 6 / 10 | Demo login and UI gates are now present; the role model is still intentionally frontend-only. |
| Code architecture | 7.5 / 10 | Shared contracts/context/data plus feature-local operational components and currency helpers establish a clear migration seam. |
| Production readiness | 2.5 / 10 | Vercel configuration and a production build exist, but no active backend, persistent database, server-side auth, payment verification, email sender or automated browser tests are present. |
| Overall competition demo | **8.7 / 10** | A polished, complete frontend demo with credible three-role workflows; real production infrastructure remains essential. |

## Completed demo implementation (23 October 2026)

The following gaps from the initial audit are now implemented in the current browser demo:

- Dedicated search-results screen with a responsive filter sidebar/drawer.
- A 37-product, six-department catalogue.
- Admin-side local product add/edit/delete/pause operations and coupon creation/enable/disable controls.
- Dynamic department-manager scope sourced from the signed-in demo account.
- Ratings and review submission/display UI, checkout receipt simulation, shopper order history and updated tracking.
- Central INR money formatting and a header light/dark theme switch.
- Feature-local operations components, Vercel SPA configuration, a lockfile-friendly install command and detailed delivery documentation.

The new capabilities are intentionally local-only. They update all connected views in the current browser session, then reset on page refresh.

## What was already present and verified

- Six departments and 37 seeded products with product metadata, ratings, stock values and selectable variants.
- Search through the command palette; browsing category and sorting controls in department pages.
- A cart with multi-department subtotal, coupon, shipping, tax, quantities and checkout handoff.
- UPI/QR and card sandbox UI; checkout creates a local order, clears the cart and lands in tracking.
- Wishlist, fixed editorial pairings/bundle, manager stock adjustment, staff assignment, audit export and tracking print controls.

## Gaps discovered and the action taken

| Gap | Risk | Demo change now | Production fix later |
| --- | --- | --- | --- |
| Role switcher could bypass any login | The RBAC story was not credible | Added three credentialed demo accounts plus route-level UI gates | Password hashing, sessions/JWT rotation, server middleware and access logs |
| Admin lacked visible product/order controls | Did not meet the Must-have admin story | Added product live/pause, stock `±5`, and fulfillment-stage controls | Catalog/order APIs, validations, optimistic concurrency and persistent audit storage |
| Product pausing did not affect a shopper view | “Management” was cosmetic | Paused items disappear from shopper browse and global search | Server catalogue status and cache invalidation |
| Package dependency versions conflicted | The app could not install or validate | Aligned the declared `esbuild` version with Vite 8 | Lock versions in CI with Dependabot/Renovate |
| README described an unrelated AI Studio starter | Judges could not run or assess it | Replaced with product purpose, demo accounts and run instructions | Add screenshots, a live deployment link and test report |

## Frontend-first plan

### Phase 1 — Ongoing demo quality

1. Keep local seed data and visible sandbox labels.
2. Validate the full three-role script on desktop and a narrow mobile viewport before every public demonstration.
3. Make primary interactive controls keyboard reachable and keep focus states visible.
4. Capture a short demo recording after a clean production build.

### Phase 2 — UI componentisation (next)

1. Split the large `ProductDetailPage`, `StorefrontHome`, `CheckoutView` and cockpit files into feature-local components.
2. Add a `features/` layer such as `features/catalog`, `features/cart`, `features/checkout`, `features/orders`, and `features/operations`.
3. Move duplicate card, table and summary UI into a small design-system component collection.
4. Add browser tests for login selection, variant cart lines, coupon calculation, checkout, and admin order updates.

### Phase 3 — Real application foundation

1. Re-introduce a backend (REST or typed RPC) with a transactional relational database.
2. Model products, variants, inventory by SKU, carts, cart lines, orders, payments, staff scopes, audit events and reviews.
3. Make prices, coupon eligibility, tax, stock reservation and order totals server-authoritative.
4. Use a demo payment adapter behind a payment service; never mark an order paid from browser state.
5. Send email receipts from a trusted queue/provider after verified payment.

### Phase 4 — Security and reliability gate

1. Implement secure password/OAuth authentication, `HttpOnly` secure cookies, CSRF strategy, login throttling and role middleware.
2. Validate all writes server-side; use parameterised queries, output encoding and CSP.
3. Add idempotency to checkout, payment webhook verification and inventory locking/reservations.
4. Centralise structured logs and immutable audit records; add error monitoring and performance budgets.

## Acceptance checklist

- Shopper can browse, search, choose an option, add products from more than one department, apply a coupon, check out using UPI/card demo and track the order.
- Department Manager can only enter the manager cockpit after demo login and can adjust Electronics/Beauty stock.
- Store Admin can only enter the admin cockpit after demo login and can pause/restore a product, adjust stock and change order fulfillment.
- Pausing a product removes it from shopper catalogue/search; order changes appear in the shopper tracking page.
- Documentation labels all mocked security, payment and email behavior clearly.
