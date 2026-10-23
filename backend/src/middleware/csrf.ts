import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Lightweight CSRF protection:
 * Requires X-Requested-With: XMLHttpRequest on all state-changing requests.
 * Combined with SameSite=Lax cookies this blocks CSRF from other origins.
 */
export function csrf(req: Request, _res: Response, next: NextFunction): void {
  if (SAFE_METHODS.has(req.method)) return next();

  // Skip for webhook endpoint (raw body, different auth)
  if (req.path.includes('/payments/webhook')) return next();

  const header = req.headers['x-requested-with'];
  if (!header || header !== 'XMLHttpRequest') {
    return next(new AppError(403, 'CSRF check failed'));
  }

  next();
}
