import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';
import { AccessPayload } from '../lib/tokens';

/**
 * Extracts and verifies the access JWT from Authorization header.
 * Sets req.user if valid. Does NOT throw if no token is present.
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next();

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessPayload;
    req.user = {
      id: payload.sub,
      role: payload.role as any,
      deptId: payload.deptId,
      isMember: false, // Will be set by service layer when needed
    };
  } catch {
    // Invalid/expired token — treat as unauthenticated
  }
  next();
}

/**
 * Requires a valid access token. Returns 401 if not present.
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    return next(new AppError(401, 'Authentication required'));
  }
  next();
}
