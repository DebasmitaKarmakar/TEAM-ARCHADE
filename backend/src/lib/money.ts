/**
 * Money helpers — ALL amounts are integer paise (₹1,499 = 149900).
 * Never use floating point for money.
 */

/** Calculate percentage of an amount in paise */
export const pct = (paise: number, p: number): number =>
  Math.round((paise * p) / 100);

/** Sum a numeric field from an array */
export const sum = <T>(xs: T[], f: (x: T) => number): number =>
  xs.reduce((a, x) => a + f(x), 0);

/** Format paise as ₹ string for display */
export const fmtINR = (paise: number): string =>
  '₹' + (paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 });

/** Convert rupees to paise */
export const toPaise = (rupees: number): number => Math.round(rupees * 100);

/** Convert paise to rupees */
export const toRupees = (paise: number): number => paise / 100;
