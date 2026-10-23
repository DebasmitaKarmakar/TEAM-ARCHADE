/** Money helpers. Every amount is an integer number of PAISE. Never use floats for money. */

export const rupees = (r: number) => Math.round(r * 100);
export const pct = (paise: number, percent: number) => Math.round((paise * percent) / 100);
export const sumBy = <T>(xs: readonly T[], f: (x: T) => number) => xs.reduce((a, x) => a + f(x), 0);
export const fmtINR = (paise: number) =>
  '₹' + (paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
export const discountPct = (price: number, mrp: number) => (mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0);
