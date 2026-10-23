/**
 * The seeded catalogue was initially authored in USD-like base units. The demo
 * is presented in INR, using one fixed showcase conversion factor so totals are
 * internally consistent without relying on a volatile exchange-rate API.
 */
export const INR_RATE = 83;

export const toInr = (amount: number) => Math.round(amount * INR_RATE);

export const formatInr = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(toInr(amount));

export const formatInrCompact = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(toInr(amount));
