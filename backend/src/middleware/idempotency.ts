import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AppError } from '../utils/AppError';

/**
 * Idempotency-Key header handling for POST /checkout.
 * If the key was used before by this user, return the cached response.
 * Otherwise, continue and save the response after creation.
 */
export const idempotency = () => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const key = req.headers['idempotency-key'] as string | undefined;

    if (!key) return next(new AppError(400, 'Idempotency-Key header is required'));
    if (!req.user) return next(new AppError(401, 'Authentication required'));

    const existing = await prisma.idempotencyKey.findFirst({
      where: { key, userId: req.user.id },
    });

    if (existing) {
      res.json(existing.response);
      return;
    }

    // Intercept json to store the response
    const originalJson = res.json.bind(res);
    res.json = (body: unknown) => {
      // Store async — don't await, don't block response
      prisma.idempotencyKey
        .create({ data: { key, userId: req.user!.id, response: body as any } })
        .catch(() => {}); // silently ignore duplicate race
      return originalJson(body);
    };

    next();
  };
};
