import crypto from 'node:crypto';

export const randomToken = (bytes = 32) => crypto.randomBytes(bytes).toString('base64url');
export const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex');
export const uuid = () => crypto.randomUUID();

/** BM-YYYY-MM-12345 (uniqueness is enforced by the DB; callers retry on conflict). */
export function makeOrderNumber(date = new Date()) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const n = crypto.randomInt(10_000, 99_999);
  return `BM-${y}-${m}-${n}`;
}

export const slugify = (s: string) =>
  s.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-');
