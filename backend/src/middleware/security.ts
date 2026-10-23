import type { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';

const limiter = (windowMs: number, max: number, message: string) =>
  rateLimit({
    windowMs,
    limit: env.isTest ? 10_000 : max,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (_req, _res, next) => next(new AppError(429, message)),
  });

export const limits = {
  global: limiter(60_000, 600, 'Too many requests, slow down'),
  login: rateLimit({
    windowMs: 60_000,
    limit: env.isTest ? 10_000 : 5,
    keyGenerator: (req) => `${req.ip}:${String(req.body?.email ?? '').toLowerCase()}`,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (_req, _res, next) => next(new AppError(429, 'Too many login attempts. Try again in a minute.')),
  }),
  search: limiter(60_000, 120, 'Too many searches'),
  checkout: limiter(60_000, 10, 'Too many checkout attempts'),
  reviews: limiter(60 * 60_000, 10, 'Too many reviews in an hour'),
};

/**
 * CSRF defence for cookie-based endpoints: state-changing requests must carry a custom header,
 * which a cross-site <form> cannot set. (axios: headers: { 'X-Requested-With': 'XMLHttpRequest' })
 */
export function requireCustomHeader(req: Request, _res: Response, next: NextFunction) {
  const unsafe = !['GET', 'HEAD', 'OPTIONS'].includes(req.method);
  if (unsafe && !req.headers['x-requested-with']) {
    return next(new AppError(403, 'Missing X-Requested-With header', 'CSRF'));
  }
  next();
}
