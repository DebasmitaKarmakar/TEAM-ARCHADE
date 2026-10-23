/** GST rate (%) per department. Prices are GST-inclusive; tax is only computed for the invoice. */
export const GST_RATE: Record<string, number> = {
  fashion: 12,
  beauty: 18,
  electronics: 18,
  home: 12,
  grocery: 5,
  kids: 12,
};

export const gstFor = (deptSlug: string) => GST_RATE[deptSlug] ?? 18;
