import { Request, Response, NextFunction } from 'express';
import { LRUCache } from 'lru-cache';
import { AppError } from '../utils/AppError';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  keyGenerator?: (req: Request) => string;
}

/**
 * In-memory rate limiter using LRU cache.
 * Default key: IP address.
 */
export const rateLimit = (opts: RateLimitOptions) => {
  const { windowMs, max, keyGenerator } = opts;

  const hits = new LRUCache<string, number>({
    max: 10000,
    ttl: windowMs,
  });

  return (req: Request, _res: Response, next: NextFunction): void => {
    const key = keyGenerator ? keyGenerator(req) : (req.ip ?? 'unknown');
    const current = hits.get(key) ?? 0;

    if (current >= max) {
      return next(new AppError(429, 'Too many requests, please try again later'));
    }

    hits.set(key, current + 1);
    next();
  };
};

// Pre-configured limiters for common routes
export const loginLimiter = rateLimit({
  windowMs: 60_000,
  max: 5,
  keyGenerator: (req) => `login:${req.ip}:${req.body?.email ?? ''}`,
});

export const searchLimiter = rateLimit({
  windowMs: 60_000,
  max: 60,
});

export const reviewLimiter = rateLimit({
  windowMs: 3600_000,
  max: 5,
});

export const checkoutLimiter = rateLimit({
  windowMs: 60_000,
  max: 10,
});
