# Frontend Architecture

The app is deliberately a self-contained frontend demo. The new boundaries below keep role, local data and visual components separate enough to replace mock services without rewriting shopper screens.

```text
src/
├── App.tsx                         # View composition and role gates
├── main.tsx                        # React bootstrap
├── index.css                       # Global tokens, typography and shared effects
├── components/
│   ├── auth/
│   │   ├── LoginModal.tsx           # Demo credential chooser and sign-in form
│   │   └── RoleGate.tsx             # UI permission boundary for cockpits
│   ├── CommandPalette.tsx           # Global product/department discovery
│   ├── Footer.tsx
│   ├── Header.tsx
│   └── Toast.tsx
├── config/
│   └── demoAccounts.ts              # Explicit demo-only account fixture
├── context/
│   └── StoreContext.tsx             # Cart, order, inventory, catalog and demo session state
├── data/
│   ├── mockData.ts                  # Department, product, staff and audit fixtures
│   ├── coupons.ts                   # Seeded demo coupon definitions
│   ├── reviews.ts                   # Seeded demo review definitions
│   └── magazineContent.ts            # Editorial storefront content
├── lib/
│   └── currency.ts                  # Central INR formatting helpers
├── types/
│   └── store.ts                     # Shared domain contracts
└── features/
    ├── storefront/                 # Home/discovery experience
    ├── catalog/                    # Department, search and product-detail screens
    ├── cart/                       # Unified-cart screen
    ├── checkout/                   # Checkout and receipt simulation
    ├── orders/                     # Tracking and shopper history
    ├── wishlist/                   # Saved-item screen
    ├── operations/                 # Manager/admin screens plus CRUD controls
    ├── editorial/                  # Everything Issue experience
    └── theme/                      # Theme diagnostics screen
```

## State and flow

```text
Mock catalogue + demo accounts
            ↓
      StoreContext
  ↙      ↓      ↘
Shopper  Manager  Admin
 browse   stock   catalog / stock / orders
    ↓       ↓             ↓
 unified cart → sandbox checkout → tracked order
```

## Production replacement seam

Replace `data/mockData.ts`, `config/demoAccounts.ts`, and write operations in `StoreContext.tsx` with typed API clients. Keep the screen contracts (`Product`, `CartItem`, `Order`, `DepartmentId`) stable. Authentication, cart pricing, stock reservation, payment confirmation and email must become server-authoritative before deployment.
