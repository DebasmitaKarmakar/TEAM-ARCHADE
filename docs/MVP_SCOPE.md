# BLOWMAGGY MVP Scope — MoSCoW

This is the agreed competition-demo scope. “Demo-ready” means it runs entirely from local React state and seeded data; it does **not** imply a production backend.

| Priority | Capability | Demo status | What the judge can do |
| --- | --- | --- | --- |
| Must | Browse by department | Demo-ready | Navigate Fashion, Beauty, Electronics, Home, Grocery, and Kids & Toys. |
| Must | Search and filters | Demo-ready | Use the command palette for global search; use category and sort controls in department views. |
| Must | Variant / size selection | Demo-ready | Select colour, cushion, fit or size when supplied by the product. |
| Must | One unified cart | Demo-ready | Add from different departments, change quantities, apply `ONECART`, and view consolidated totals. |
| Must | UPI and card checkout | Demo-ready | Complete a labelled sandbox UPI/QR or card payment; no money moves. |
| Must | Order tracking | Demo-ready | View the single-parcel timeline and packing details. Admin status changes update it. |
| Must | Product, stock and order operations | Demo-ready | Admin can pause/restore product listings, correct stock, and move order status; manager adjusts only assigned stock. |
| Should | Wishlist | Demo-ready | Save or remove articles from a shopper wishlist. |
| Should | Ratings and reviews | Demo-ready display | View seeded rating/review totals; authoring/moderation is a post-MVP service. |
| Should | Coupons and sets | Demo-ready | Use `ONECART` and add the curated cross-department set. |
| Should | Department-manager roles | Demo-ready | Sign in as Marcus for a scoped manager dashboard; admin gets an unrestricted cockpit. |
| Should | Email receipt | Demo-visible only | The receipt/tracking confirmation is visible in app. Transactional sending requires a backend email provider. |
| Could | Cross-department personalisation | Deferred | The editorial “complete the look” pairings demonstrate the direction, not an algorithm. |
| Could | MAGGY+ membership | Deferred | Keep as a monetisation concept until account/billing infrastructure exists. |
| Could | Product bundles | Demo-ready, fixed | Curated bundle is hardcoded; dynamic bundle rules are deferred. |
| Could | Complete the Look | Demo-ready, fixed | PDP pairings are curated seed data. |
| Won’t | Third-party sellers | Out of scope | No seller marketplace model. |
| Won’t | Multi-currency | Out of scope | The demo uses USD presentation only. |
| Won’t | Native mobile app | Out of scope | Responsive web is the product for this phase. |
| Won’t | Same-day delivery logistics | Out of scope | One consolidated shipping narrative only. |

## 60-second demo script

1. As a guest or Shopper, use `⌘/Ctrl + K` to search, open a product, select its option, and add it to the unified cart.
2. Add an item from a second department, apply `ONECART`, then use UPI or Card at checkout.
3. Open the confirmed order tracking view.
4. Sign in as the Store Admin and move that order through fulfillment. Return to tracking to show the changed timeline.
5. Sign in as the Department Manager and adjust an Electronics or Beauty SKU to show scoped operational control.
