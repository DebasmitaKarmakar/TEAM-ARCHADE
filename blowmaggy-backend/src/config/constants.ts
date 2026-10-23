/** All money values are integer paise. */
export const FREE_DELIVERY_MIN = 99_900; // ₹999
export const DELIVERY_FEE_PER_GROUP = 4_900; // ₹49
export const DELIVERY_FEE_CAP = 9_900; // ₹99
export const MEMBER_DISCOUNT_PCT = 10;
/** Departments excluded from the Maggy+ 10% (margin protection). Empty = all departments. */
export const MEMBER_DISCOUNT_EXCLUDED_DEPTS: string[] = [];
export const MAX_QTY_PER_LINE = 10;
export const RESERVATION_TTL_MIN = 10;
export const RETURN_WINDOW_DAYS = 7;
export const BUNDLE_NUDGE_THRESHOLD = 0.6;

/** Bayesian rating: prior mean m and confidence weight C. */
export const BAYES_PRIOR_MEAN = 4.0;
export const BAYES_WEIGHT = 20;

export const MEMBERSHIP_PLANS = {
  MONTHLY: { amount: 9_900, days: 30, label: 'Maggy+ Monthly' },
  YEARLY: { amount: 79_900, days: 365, label: 'Maggy+ Yearly' },
} as const;

export const GROCERY_SLOTS = ['Tomorrow 7–9 AM', 'Tomorrow 9–11 AM', 'Tomorrow 5–7 PM', 'Tomorrow 7–9 PM'];
