import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env';
import { logger } from '../lib/logger';
import { AppError } from '../utils/AppError';

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(new AppError(404, `Route ${req.method} ${req.path} not found`));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  let status = 500;
  let code = 'INTERNAL';
  let message = 'Something went wrong';
  let details: unknown;

  if (err instanceof AppError) {
    ({ status, code, message, details } = err);
  } else if (err instanceof ZodError) {
    status = 400; code = 'VALIDATION_ERROR'; message = 'Invalid request'; details = err.flatten();
  } else if (isPrismaKnown(err)) {
    if (err.code === 'P2002') { status = 409; code = 'DUPLICATE'; message = 'Already exists'; }
    else if (err.code === 'P2025') { status = 404; code = 'NOT_FOUND'; message = 'Not found'; }
  } else if (isBodyParseError(err)) {
    status = 400; code = 'BAD_JSON'; message = 'Malformed JSON body';
  } else if (isCheckViolation(err)) {
    status = 409; code = 'CONSTRAINT'; message = 'That change would break a data rule (e.g. stock below reserved)';
  }

  if (status >= 500) logger.error({ err, path: req.path, reqId: req.id }, 'unhandled error');
  res.status(status).json({
    data: null,
    error: { code, message, details, ...(status >= 500 && !env.isProd && err instanceof Error ? { stack: err.stack } : {}) },
  });
}

function isPrismaKnown(e: unknown): e is { code: string } {
  return typeof e === 'object' && e !== null && 'code' in e && typeof (e as { code: unknown }).code === 'string'
    && /^P\d{4}$/.test((e as { code: string }).code);
}
function isBodyParseError(e: unknown) {
  return typeof e === 'object' && e !== null && (e as { type?: string }).type === 'entity.parse.failed';
}
function isCheckViolation(e: unknown) {
  const msg = e instanceof Error ? e.message : '';
  return /violates check constraint|23514/.test(msg);
}
