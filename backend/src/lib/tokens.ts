import jwt, { JwtPayload } from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env';

export interface AccessPayload {
  sub: string;
  role: string;
  deptId?: string;
}

/** Sign a short-lived access JWT */
export function signAccess(payload: AccessPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.ACCESS_TTL });
}

/** Verify and decode access JWT */
export function verifyAccess(token: string): AccessPayload & JwtPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessPayload & JwtPayload;
}

/** Sign a refresh token (random bytes, stored hashed in DB) */
export function generateRefreshToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/** SHA-256 hash a refresh token for storage */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/** Generate a random family ID for refresh token rotation */
export function generateFamily(): string {
  return crypto.randomUUID();
}

/** Timing-safe string comparison */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
