import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { uuid } from '../utils/ids';

export const GUEST_COOKIE = 'bm_guest';
const UUID_RE = /^[0-9a-f-]{36}$/i;

export function readGuestCookie(req: Request, _res: Response, next: NextFunction) {
  const v = req.cookies?.[GUEST_COOKIE];
  if (typeof v === 'string' && UUID_RE.test(v)) req.guestId = v;
  next();
}

/** Creates the guest id cookie lazily (only when a guest first adds to cart). */
export function ensureGuestId(req: Request, res: Response): string {
  if (req.guestId) return req.guestId;
  const id = uuid();
  res.cookie(GUEST_COOKIE, id, {
    httpOnly: true,
    sameSite: env.isProd ? 'none' : 'lax',
    secure: env.isProd,
    maxAge: 30 * 24 * 3600 * 1000,
    path: '/',
  });
  req.guestId = id;
  return id;
}

export function clearGuestCookie(res: Response) {
  res.clearCookie(GUEST_COOKIE, { path: '/' });
}
