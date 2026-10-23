import type { Request, Response } from 'express';
import { AppError } from './AppError';

/** Standard success envelope: { data, error: null, meta? } */
export const send = (res: Response, data: unknown, meta?: Record<string, unknown>, status = 200) =>
  res.status(status).json({ data, error: null, ...(meta ? { meta } : {}) });

export const created = (res: Response, data: unknown) => send(res, data, undefined, 201);

export function paging(q: { page?: number; limit?: number }, maxLimit = 100) {
  const page = Math.max(1, Number(q.page) || 1);
  const limit = Math.min(maxLimit, Math.max(1, Number(q.limit) || 24));
  return { page, limit, skip: (page - 1) * limit };
}

export const pageMeta = (page: number, limit: number, total: number) => ({
  page, limit, total, pages: Math.max(1, Math.ceil(total / limit)),
});

export function requireUser(req: Request) {
  if (!req.user) throw new AppError(401, 'Please log in');
  return req.user;
}

/** Express 5 route params are typed loosely; this narrows to string. */
export const param = (req: Request, name: string) => {
  const v = req.params[name];
  if (typeof v !== 'string' || !v) throw new AppError(400, `Missing parameter ${name}`);
  return v;
};
