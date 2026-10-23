/** GST rates per department (included in price, extracted for invoice) */
export const TAX_RATES: Record<string, number> = {
  fashion:     5,   // 5% GST on apparel
  beauty:      18,  // 18% GST on cosmetics
  electronics: 18,  // 18% GST on electronics
  home:        12,  // 12% GST on home goods
  grocery:     0,   // 0% GST on essentials (simplified)
  kids:        5,   // 5% GST on kids items
};

/** Extract tax from an inclusive price: round(price * rate / (100 + rate)) */
export function extractTax(inclusiveAmount: number, departmentSlug: string): number {
  const rate = TAX_RATES[departmentSlug] ?? 0;
  if (rate === 0) return 0;
  return Math.round((inclusiveAmount * rate) / (100 + rate));
}
