# BLOWMAGGY — Every department. One cart. One checkout.

> A polished, light-first multi-department shopping demo by **Himanshu Yadav and Debasmita Karmakar**.

BLOWMAGGY is a frontend-led commerce experience joining fashion, beauty, electronics, home, grocery, kids, and health & pharmacy into one responsive storefront. It is designed to be demonstrated end-to-end: discover products, choose variants, build one cross-department cart, complete a clearly-labelled demo payment, then manage the same catalogue and orders through role-based operations screens.

## What is working in this demo

- See a premium browser-session intro with a Skip control, reduced-motion handling, and no replay during internal navigation.
- Browse seven departments and a 45+ product catalogue. Electronics includes smartphones, laptops, headphones and earphones; Health & Pharmacy includes eight clearly-labelled demo pharmacy/wellness listings with product information.
- Use the dedicated results page with department, category, price, and rating filters; select variants; save a wishlist; add reviews; discover cross-department pairings; and explore dynamic suggestion, rating and wishlist shelves.
- Use one shared cart with quantities, multiple coupons, consolidated shipping and Indian-rupee price calculation.
- Complete a clearly labelled UPI or card **demo** payment, see an email-receipt simulation, then use shopper order history and order tracking.
- Sign in using three distinct demo accounts. The manager sees a dynamically scoped inventory console; the admin can add, edit, pause, and delete products, manage stock/coupons/orders, staff assignments, and the audit log.
- Browse a responsive, light-first creamy editorial UI with blue, violet, and gold accents, a moving campaign ticker, readable contrast, and non-blocking motion.

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

If `npm ci` reports `EPERM` on Windows, stop Vite/Node and close applications holding `node_modules` (editor, antivirus scan, or another terminal), then remove only this project’s `node_modules` folder and reinstall:

```powershell
Remove-Item -LiteralPath .\node_modules -Recurse -Force
npm ci
```

## GitHub-ready workflow

The repository includes a Node-version file and a GitHub Actions workflow that runs type-checking and a production build for pushes and pull requests. Verify changes locally, inspect the diff, and commit:

```powershell
npm run lint
npm run build
git status
git add -A
git commit -m "feat: polish light-first Blowmaggy storefront"
git push origin main
```

If this clone is not connected to GitHub yet, add your own repository URL before pushing:

```powershell
git remote add origin https://github.com/<your-account>/<your-repository>.git
git push -u origin main
```

Do not commit `.env` files, tokens, API keys, or real payment credentials. The supplied `.gitignore` excludes them.

## Deploy to Vercel

The included [vercel.json](vercel.json) is ready for a Vite single-page application: it installs from the lockfile, builds `dist`, and rewrites deep links to `index.html`.

1. Push the project to GitHub and import the repository in Vercel using **Add New → Project**.
2. Use Node 20 or newer and keep this folder as the project root.
3. Deploy using the supplied configuration; no environment variables are required for this local-data demo.

Or deploy after authenticating with Vercel CLI:

```powershell
npx vercel
npx vercel --prod
```

## Browser, OS and accessibility baseline

The app is standard browser code and is ready for current Chrome, Edge, Firefox and Safari releases across Windows, macOS, Linux, Android and iOS. It intentionally does not target Internet Explorer 11 because React 19 no longer supports it. Responsive layouts, visible keyboard focus styles, reduced-motion handling, and an ES2018 production target are included. Complete a physical-device/browser QA pass before a public release.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4 for responsive presentation
- Local React context and hardcoded catalogue data for a self-contained demo
- Lucide icons, CSS motion, central INR formatting, and light-first design tokens

## Product documents

- [MVP scope and MoSCoW priorities](docs/MVP_SCOPE.md)
- [Cross-verified audit and implementation plan](docs/PRODUCT_AUDIT_AND_PLAN.md)
- [Frontend architecture](docs/ARCHITECTURE.md)
- [Six-phase development plan](PHASES.md)

## Team

TEAM-ARCHADE — Himanshu Yadav and Debasmita Karmakar

## Production note

The demo intentionally has no live payment, email, database, production identity provider, or pharmacy integration. It must be connected to audited backend services, server-side role enforcement, payment verification, and appropriate regulatory review before accepting real customer, health, or transaction data. `docs/PRODUCT_AUDIT_AND_PLAN.md` describes the backend and security work required before a real launch.
