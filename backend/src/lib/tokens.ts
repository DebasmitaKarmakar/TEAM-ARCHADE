import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import type { Role } from '../generated/prisma/enums';

export interface AccessClaims {
  sub: string;
  role: Role;
  deptId: string | null;
}

export function signAccessToken(claims: AccessClaims) {
  return jwt.sign(claims, env.JWT_ACCESS_SECRET, {
    expiresIn: env.ACCESS_TTL as SignOptions['expiresIn'],
    issuer: 'blowmaggy',
  });
}

export function verifyAccessToken(token: string): AccessClaims {
  const payload = jwt.verify(token, env.JWT_ACCESS_SECRET, { issuer: 'blowmaggy' }) as jwt.JwtPayload;
  return { sub: String(payload.sub), role: payload.role as Role, deptId: (payload.deptId as string | null) ?? null };
}
