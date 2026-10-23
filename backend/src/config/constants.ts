/** All money values are integer paise. ₹1,499 = 149900 */

// Business constants
export const FREE_DELIVERY_MIN = 99900;  // ₹999 in paise
export const DELIVERY_FEE = 4900;        // ₹49 per shipment group
export const MAX_DELIVERY_FEE = 9900;    // ₹99 cap
export const RESERVE_TTL_MIN = 10;       // minutes before reservation expires
export const MAX_QTY = 10;               // max qty per item in cart
export const MEMBER_DISCOUNT_PCT = 10;   // Maggy+ discount percentage
export const BAYES_C = 20;               // Bayesian score prior weight
export const BAYES_M = 4.0;              // Bayesian score prior mean

// Membership plans (paise)
export const MEMBERSHIP_PLANS = {
  MONTHLY: { price: 9900, days: 30 },
  YEARLY: { price: 79900, days: 365 },
} as const;

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 24;
export const MAX_PAGE_SIZE = 100;
