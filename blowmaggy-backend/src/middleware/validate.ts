import type { NextFunction, Request, Response } from 'express';
import type { ZodTypeAny, z } from 'zod';
import { AppError } from '../utils/AppError';

/** Validate & coerce req.body / req.query / req.params with zod. Parsed values land in res.locals. */
export function validate(schemas: { body?: ZodTypeAny; query?: ZodTypeAny; params?: ZodTypeAny }) {
  return (req: Request, res: Response, next: NextFunction) => {
    for (const key of ['body', 'query', 'params'] as const) {
      const schema = schemas[key];
      if (!schema) continue;
      const result = schema.safeParse(req[key] ?? {});
      if (!result.success) {
        return next(new AppError(400, 'Invalid request', 'VALIDATION_ERROR', result.error.flatten()));
      }
      res.locals[key] = result.data;
    }
    next();
  };
}

export const body = <S extends ZodTypeAny>(res: Response, _s?: S) => res.locals.body as z.infer<S>;
export const query = <S extends ZodTypeAny>(res: Response, _s?: S) => res.locals.query as z.infer<S>;
