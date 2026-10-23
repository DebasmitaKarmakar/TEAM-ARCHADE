# BLOWMAGGY — Backend API
**The Everything Issue** · one store · six departments · one cart · one checkout
Node 20 · Express 5 · TypeScript · Prisma 7 · PostgreSQL · Razorpay (test) / mock gateway

---

## 1. Quick start (5 minutes)

```bash
# 1. Postgres: either Docker…
docker compose up -d
# …or a free Neon database (copy its connection string)

# 2. Install + configure
npm install                    # also runs `prisma generate`
cp .env.example .env           # set DATABASE_URL (default works with docker compose)

# 3. Create tables + load demo data
npm run setup                  # = prisma migrate deploy + seed

# 4. Run
npm run dev                    # http://localhost:4000/api/v1/health
```

Before every demo: `npm run db:reset` (wipes and re-seeds the same data, deterministically).

### Demo logins (password `Demo@123`)
| Role | Email | Notes |
|---|---|---|
| Shopper | shopper@blowmaggy.demo | 0 orders, so `MAGGY10` works; wishlist shows price drops |
| Maggy+ shopper | plus@blowmaggy.demo | member: 10% off + free delivery; 2 past orders to track |
| Dept manager | electronics.mgr@blowmaggy.demo | sees only Electronics |
| Dept manager | fashion.mgr@blowmaggy.demo | sees only Fashion |
| Support | support@blowmaggy.demo | read access + orders, refunds, reviews |
| Admin | admin@blowmaggy.demo | everything |

## 2. Scripts
| Script | What it does |
|---|---|
| `npm run dev` | Dev server with reload (tsx watch) |
| `npm run build` / `npm start` | Bundle to `dist/` / run production build |
| `npm run setup` | Migrate + seed (first run) |
| `npm run db:migrate` | `prisma migrate deploy` (apply migrations) |
| `npm run db:migrate:dev -- --name x` | Create a new migration after editing the schema |
| `npm run db:seed` / `db:reset` | Wipe + seed demo data |
| `npm run db:studio` | Prisma Studio (good to show judges the data) |
| `npm test` | 35 tests on a separate `<db>_test` database (pricing, full demo path, race conditions, RBAC) |
| `npm run typecheck` | TypeScript check |

## 3. Folder structure
```
├── prisma/
│   ├── schema.prisma                 # 27 models, money in integer paise
│   ├── migrations/                   # 0001 init · 0002 full-text search + CHECK constraints
│   └── seed/                         # deterministic demo data (data/*.ts = the tables in the DB guide)
├── src/
│   ├── server.ts · app.ts            # bootstrap · middleware order · route mounting
│   ├── config/                       # env (zod), constants, shipping rules, GST, department moods
│   ├── lib/                          # prisma, logger, money, cache, tokens, gateway (razorpay|mock), mailer
│   ├── middleware/                   # auth, rbac, validate, security (rate limit + CSRF), guest cart, errors
│   ├── modules/
│   │   ├── auth/                     # register · login · rotating refresh · me
│   │   ├── catalog/                  # departments · products · PDP · delivery check · home · bundles
│   │   ├── search/                   # full-text + trigram + JSONB variant filters + facets + suggest
│   │   ├── cart/                     # unified guest/user cart, merge on login, warnings, bundle nudges
│   │   ├── pricing/                  # PURE pricing engine + coupon validation (unit-tested)
│   │   ├── inventory/                # reserve → commit → release · restock · adjust · low-stock alerts
│   │   ├── checkout/                 # idempotent checkout → order + shipments + gateway order
│   │   ├── payment/                  # verify · webhook · markOrderPaid (idempotent) · refunds
│   │   ├── order/                    # tracking view · cancel · return · state machine · invoice
│   │   ├── review/ recommend/ membership/ notification/ account/
│   │   └── admin/                    # stats · products/variants/CSV · inventory · orders · coupons · reviews · users
│   ├── jobs/                         # cron: release reservations (1 min) · low-stock digest (1 h) · co-purchase (nightly)
│   └── generated/prisma/             # generated client (not committed)
├── tests/                            # vitest + supertest against real Postgres
├── requests.http                     # click-through demo requests (VS Code REST Client)
└── docker-compose.yml                # local Postgres 16
```
Layering: **routes** (HTTP + validation) → **services** (business logic, transactions) → **Prisma**. Pricing and the order state machine are pure functions.

## 4. How the important parts work
| Concern | Where | How |
|---|---|---|
| Server-side pricing | `modules/pricing/pricing.ts` | line → bundle → coupon (eligible lines only, split per line) → Maggy+ 10% → delivery (₹49/shipment, cap ₹99, free ≥ ₹999) → GST portion. Demo cart: ₹6,035 − MAGGY10 (cap ₹500) = **₹5,535** |
| No overselling | `modules/inventory` | `UPDATE … SET reserved = reserved + q WHERE stock − reserved ≥ q`; sorted ids (no deadlocks); DB `CHECK (reserved ≤ stock)` as a safety net |
| Reservation timeout | `jobs/index.ts` | unpaid after 10 min → cancel, release stock + coupon |
| Idempotent checkout | `checkout.service.ts` | `Idempotency-Key` header (unique on Order); concurrent duplicates return the same order |
| Payments | `payment.service.ts` | HMAC signature (timing-safe), webhook on raw body + dedupe table, `markOrderPaid` guarded by `WHERE status = 'PENDING_PAYMENT'`, amount check, late payment auto-refund |
| One order, many shipments | `config/shipping.ts` | general (fashion/beauty/home/kids) · electronics · grocery (slot). Order status = least-advanced shipment |
| State machine | `order/stateMachine.ts` | Placed → Packed → Shipped → Out for delivery → Delivered (→ Return); every change writes an `OrderEvent` (timeline + audit) |
| Search | `search/search.service.ts` | generated `tsvector` (name A, brand B, tags C, description D) + prefix tsquery + `word_similarity` typo tolerance; facets exclude their own filter |
| Ratings | `review.service.ts` | Bayesian score `(20·4.0 + Σ)/(20 + n)` for "Top rated" |
| Recommendations | `recommend.service.ts` | co-purchase matrix + category affinity + 7-day popularity + freshness, round-robin across departments |
| Roles | `middleware/rbac.ts` + admin routes | ADMIN all · DEPT_MANAGER own department (403 elsewhere) · SUPPORT read + orders/refunds/reviews |
| Auth | `modules/auth` | access JWT 15 min + refresh cookie (hashed, rotated, reuse ⇒ family revoked) |
| CSRF | `middleware/security.ts` | every POST/PATCH/PUT/DELETE must send `X-Requested-With` |

## 5. API reference (base `/api/v1`)
Every response has the shape `{ data, error, meta? }`. **All money is integer paise** (₹1,499 = `149900`). Search `priceMin` and `priceMax` are the exception: they're in **rupees**.

**Auth:** `POST /auth/register` · `POST /auth/login` · `POST /auth/refresh` · `POST /auth/logout` · `GET|PATCH /auth/me` · `POST /auth/change-password`

**Catalog**
| | |
|---|---|
| `GET /home` | strip text, departments, picked-for-you, deals with countdown |
| `GET /departments` · `GET /departments/:slug` | department page: hero, categories, moods, rails, pairs-well-with |
| `GET /products?dept=&category=&tag=&sort=&page=` | listing + facets |
| `GET /products/:slug?size=M` | PDP: variants, optionAxes, breadcrumb, offers, ratings, completeTheLook, alsoBought |
| `GET /products/:slug/delivery?pincode=781001` | delivery estimate |
| `GET /search?q=&dept=a,b&category=&brand=&size=&colour=&priceMin=&priceMax=&rating=&discount=&inStock=true&sort=&page=&limit=` | results + facets + headline |
| `GET /search/suggest?q=` | autocomplete grouped by department (empty q = trending) |
| `GET /bundles` · `GET /recommendations/home` · `GET /recommendations/look/:productId` | |

**Cart** (guest cookie or logged in)
`GET /cart` · `POST /cart/items {variantId, qty}` · `PATCH /cart/items/:id {qty}` (0 = remove) · `DELETE /cart/items/:id` · `POST|DELETE /cart/coupon {code}` · `POST /cart/grocery-slot {slot}` · `POST /cart/bundles/:slug`
The cart response contains `groups` (by department), `shipments`, `summary`, `coupon`, `bundleNudges`, `warnings` and `canCheckout`.

**Checkout & payment**
`POST /checkout` with header `Idempotency-Key` and body `{paymentMethod: UPI|CARD|COD, addressId? | address?, grocerySlot?}`. It returns `{orderNumber, amount, razorpayOrderId, keyId, prefill}`.
`POST /payments/verify {razorpay_order_id, razorpay_payment_id, razorpay_signature}` · `POST /payments/webhook` (Razorpay) · `GET /payments/config`
In mock mode, signature `"mock"` succeeds and `"mock-fail"` simulates a decline.

**Orders:** `GET /orders` · `GET /orders/:orderNumber` (shipments, steps, timeline) · `POST /orders/:orderNumber/cancel {itemIds?}` · `POST /orders/:orderNumber/return {itemIds, reason}` · `GET /orders/:orderNumber/invoice` (printable HTML)

**Account:** `GET|POST|PATCH|DELETE /addresses` · `GET|POST /wishlist` · `DELETE /wishlist/:productId` · `GET|POST /products/:id/reviews` · `POST /reviews/:id/helpful` · `GET /membership` · `POST /membership/subscribe {plan}` (then `/payments/verify`) · `GET /notifications` · `POST /notifications/read`

**Admin** (`/admin/*`, staff only)
`GET /me` (scope banner + permission matrix) · `GET /stats?days=30&dept=` · `GET /departments`
`GET|POST /products` · `GET|PATCH|DELETE /products/:id` · `PUT /products/:id/variants` · `POST /products/bulk` · `POST /products/import` (text/csv)
`GET /inventory?lowStock=true` · `PATCH /variants/:id/stock {delta|stock}` · `GET /variants/:id/movements`
`GET /orders?status=&dept=&payment=&q=` · `GET /orders/:id` · `PATCH /shipments/:id/status {to?}` (empty = next step) · `POST /orders/:id/cancel` · `POST /orders/:id/returns/complete` · `POST /orders/:id/refund`
`GET|POST /coupons` · `PATCH /coupons/:id` · `GET /reviews` · `PATCH /reviews/:id {status}` · `GET /users` · `PATCH /users/:id {role, department}`

## 6. Wiring the frontend (Stitch → React)
```ts
// api/client.ts
export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL, withCredentials: true,
  headers: { 'X-Requested-With': 'XMLHttpRequest' } });
api.interceptors.request.use((c) => { const t = authStore.getState().token; if (t) c.headers.Authorization = `Bearer ${t}`; return c; });
// on 401 → POST /auth/refresh once (share one in-flight promise) → retry

// checkout page
const key = useMemo(() => crypto.randomUUID(), []);              // one key per checkout attempt
const { data } = await api.post('/checkout', { paymentMethod: 'UPI', addressId }, { headers: { 'Idempotency-Key': key } });
new window.Razorpay({ key: data.data.keyId, order_id: data.data.razorpayOrderId, amount: data.data.amount, currency: 'INR',
  name: 'BLOWMAGGY', theme: { color: '#FF4F8B' }, prefill: data.data.prefill,
  handler: async (r) => { const v = await api.post('/payments/verify', r); navigate(`/order/${v.data.data.orderNumber}/success`); } }).open();
// PAYMENT_MODE=mock: skip the popup and call /payments/verify with razorpay_signature: 'mock'
```
Format money with `(paise / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })`.

## 7. Payments
- **`PAYMENT_MODE=mock`** (default): no keys needed. Use it as the stage backup if the Wi-Fi fails.
- **`PAYMENT_MODE=razorpay`**:
  1. Add the Razorpay test keys to `.env`.
  2. In the dashboard, add a webhook: `https://<api>/api/v1/payments/webhook`, events `payment.captured` and `payment.failed`, with the same secret as `RAZORPAY_WEBHOOK_SECRET`.
  3. Pay with Razorpay's test UPI ID and card details.

## 8. Deploy (Render + Neon)
1. **Neon:** create a database. Use the pooled URL for `DATABASE_URL` and the direct URL for `DIRECT_URL`.
2. **Render web service** (root = this folder):
   - Build: `npm ci && npm run build && npx prisma migrate deploy`
   - Start: `npm start`
   - Health check: `/api/v1/health`
3. **Environment variables:**
   - `NODE_ENV=production`
   - strong `JWT_*` secrets (32+ chars)
   - `CLIENT_URL=https://your-frontend.vercel.app`
   - the payment variables
4. **Seed once:** `npm run db:seed` from the Render shell.
5. In production, cookies are `Secure; SameSite=None`, which works for a frontend on a different domain.
6. Free Render instances sleep, so open `/api/v1/health` two minutes before the demo.

## 9. Notes
- **Migrations:** the SQL in `prisma/migrations` mirrors `schema.prisma` and follows Prisma's naming conventions. It was verified by:
  - applying it to PostgreSQL 16
  - running the test suite
  - a column-by-column, nullability-checked comparison with the generated client

  If `prisma migrate dev` ever reports drift, run `npx prisma migrate diff --from-migrations prisma/migrations --to-schema prisma/schema.prisma --script` to see the difference.
- **Images:** the seed uses branded placeholder images (placehold.co) in each department's accent colour. Replace `Product.images` with real Cloudinary or Unsplash URLs, either through the admin API or in `prisma/seed/index.ts`.
- **Demo data:** 73 products, 241 variants, 46 users, 150 orders over 30 days (~42% multi-department), about 750 reviews, 9 coupons, 3 bundles, and low-stock alerts.
- **Emails:** with no `RESEND_API_KEY` or `SMTP_HOST`, receipts are saved as HTML files under `tmp/emails/`. You can open them during the demo.
