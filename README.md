# BLOWMAGGY — The Everything Issue

> One elevated department store: six departments, one cart, one checkout, one delivery story.

BLOWMAGGY is a frontend-led commerce demonstration for fashion, beauty, electronics, home, grocery, and kids. It is designed for a fast, judgeable walkthrough: browse a department, configure a variant, add across categories, complete a UPI or card sandbox checkout, then update the same order from the admin cockpit and watch the tracking view respond.

## What is working in this demo

- Browse all six departments and a 37-product catalogue. Use the dedicated results page with department, category, price, and rating filters; select variants; save a wishlist; add reviews; and discover cross-department pairings.
- Use one shared cart with quantities, multiple coupons, consolidated shipping and Indian-rupee price calculation.
- Complete a clearly labelled UPI or card **demo** payment, see an email-receipt simulation, then use shopper order history and order tracking.
- Sign in using three distinct demo accounts. The manager sees a dynamically scoped inventory console; the admin can add, edit, pause, and delete products, manage stock/coupons/orders, staff assignments, and the audit log.
- Switch between the dark editorial theme and a light theme from the header.

## Demo accounts

| Perspective | Login ID | Password | Purpose |
| --- | --- | --- | --- |
| Shopper | `shopper@blowmaggy.demo` | `shopper2026` | Browse, cart, checkout and order tracking |
| Department Manager | `manager@blowmaggy.demo` | `manager2026` | Electronics and beauty inventory controls |
| Store Admin | `admin@blowmaggy.demo` | `admin2026` | Catalog visibility, stock, orders, staff and audit actions |

These credentials are intentional local mock data for the competition demo. They are not secure authentication and must never be used in a deployed production system.

## Run locally

Prerequisite: Node.js **20.19+** (or a newer Node LTS release).

```bash
npm ci
npm run dev
```

Validation commands:

```bash
npm run lint
npm run build
```

## Deploy to Vercel

The included [vercel.json](vercel.json) is ready for a Vite single-page application: it installs from the lockfile, builds `dist`, and rewrites deep links to `index.html`.

1. Import this repository into Vercel.
2. Use Node 20 or newer and keep this folder as the project root.
3. Deploy using the supplied configuration; no environment variables are required for this local-data demo.

The failed deployments in the supplied screenshot are already-created historical records. This change prepares a fresh deployment; it cannot edit their old build logs or statuses.

## Browser, OS and accessibility baseline

The app is standard browser code and is ready for current Chrome, Edge, Firefox and Safari releases across Windows, macOS, Linux, Android and iOS. It intentionally does not target Internet Explorer 11 because React 19 no longer supports it. Responsive layouts, visible keyboard focus styles, reduced-motion handling, and an ES2018 production target are included. Complete a physical-device/browser QA pass before a public release.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4 for responsive presentation
- Local React context and hardcoded catalogue data for a self-contained demo
- Lucide icons, CSS motion, central INR formatting, and light/dark token overrides

## Product documents

- [MVP scope and MoSCoW priorities](docs/MVP_SCOPE.md)
- [Cross-verified audit and implementation plan](docs/PRODUCT_AUDIT_AND_PLAN.md)
- [Frontend architecture](docs/ARCHITECTURE.md)
- [Six-phase development plan](PHASES.md)

## Team

TEAM-ARCHADE

## Production note

The demo intentionally has no live payment, email, database, or production identity provider. `docs/PRODUCT_AUDIT_AND_PLAN.md` describes the backend and security work required before a real launch.
