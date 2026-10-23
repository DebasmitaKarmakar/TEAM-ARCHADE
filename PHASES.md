# BLOWMAGGY Development Phases

This plan records the frontend delivery sequence and the path from a competition-ready demonstration to a safe production storefront.

## Phase 1 — Product framing and success measures

**Goal:** establish the multi-department proposition, personas and non-goals.

- Define the shopper, department-manager and store-admin journeys.
- Prioritise Must/Should/Could/Won't scope in [the MVP document](docs/MVP_SCOPE.md).
- Set a measurable demo outcome: a shopper can find a variant, check out across departments and track an order; staff can complete their scoped operations.
- Label local data, identity, payments and email as simulations.

**Exit criteria:** a reviewer can understand the value proposition and MVP boundary in under a minute.

## Phase 2 — Experience and system design

**Goal:** turn the proposition into information architecture, screen flows and state boundaries.

- Map the shopper route: home → department/search → product → cart → checkout → receipt/history/tracking.
- Map operations routes for manager inventory and administrator product, coupon and order controls.
- Establish core entities: department, product, variant, inventory, cart, order, payment, coupon and review.
- Define responsive layout, Indian-rupee formatting and light/dark theme behavior.

**Exit criteria:** each feature has a primary screen, a state owner and a clear role permission.

## Phase 3 — Frontend foundation

**Goal:** create a reliable React/Vite baseline.

- Keep TypeScript contracts in `src/types`, fixtures in `src/data`, currency helpers in `src/lib`, and admin flows in `src/features`.
- Use `StoreContext` as the local-state seam for catalogue, cart, orders, coupons, reviews, theme and session data.
- Build the shared shell: header, navigation, command palette, toast, login modal and role gate.
- Configure linting, production builds, a Node engine declaration and Vercel SPA routing.

**Exit criteria:** a clean lockfile install produces a deployable `dist` directory.

## Phase 4 — Shopper MVP

**Goal:** deliver the full shopper route without leaving the app.

- Seed 37 products across fashion, beauty, electronics, home, grocery, kids and toys.
- Build department discovery plus a dedicated results page with a desktop filter sidebar and narrow-screen filter drawer.
- Provide variant selection, unified cart, wishlist, coupon calculation, INR totals and demo UPI/card checkout.
- Show receipt simulation, shopper order history, tracked order states, ratings/reviews and product pairings.

**Exit criteria:** a shopper completes a cross-department order from both desktop and narrow layouts.

## Phase 5 — Operations, permissions and polish

**Goal:** make the staff experience credible and show visible shopper impact.

- Add demo credentials and client-side role gates.
- Bind a manager's scope to the signed-in account's assigned department IDs.
- Implement local admin product CRUD, stock adjustment, coupon management and order-status updates.
- Add theme switching, keyboard focus treatment, reduced-motion support and responsive navigation.
- Keep connected views in sync during a browser session through shared state.

**Exit criteria:** the manager and administrator capabilities are visibly distinct, with shopper-facing results of their actions.

## Phase 6 — Verification, deployment and production handoff

**Goal:** package a dependable demo while documenting its production boundary.

- Run `npm run lint` and `npm run build` before delivery.
- Check the core journey in current Chrome/Edge, Firefox and Safari on desktop plus representative Android/iOS widths. React 19 excludes IE11.
- Deploy through Vercel with `vercel.json`, which uses lockfile installation, Vite build output and SPA rewrites.
- Document the real-launch requirements: server-side RBAC, persistent database, payment verification, email provider, automated tests, security controls and observability.

**Exit criteria:** a fresh Vercel deployment succeeds and a reviewer can run each demo role using only the README.
