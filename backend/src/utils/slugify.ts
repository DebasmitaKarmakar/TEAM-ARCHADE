/**
 * Generate a URL-safe slug from a string.
 * "10% Vitamin C Serum" → "10-vitamin-c-serum"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80);
}
