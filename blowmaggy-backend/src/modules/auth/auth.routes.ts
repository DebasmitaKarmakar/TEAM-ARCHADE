import { Router, type Response } from 'express';
import { z } from 'zod';
import { env } from '../../config/env';
import { requireAuth } from '../../middleware/auth';
import { clearGuestCookie } from '../../middleware/guestCart';
import { limits } from '../../middleware/security';
import { validate } from '../../middleware/validate';
import { requireUser, send } from '../../utils/http';
import { mergeGuestCart } from '../cart/cart.service';
import * as auth from './auth.service';

export const REFRESH_COOKIE = 'bm_rt';
const cookiePath = '/api/v1/auth';

function setRefreshCookie(res: Response, token: string, expires: Date) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: env.isProd ? 'none' : 'lax',
    path: cookiePath,
    expires,
  });
}

const registerBody = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  password: z.string().min(8, 'Use at least 8 characters').max(100),
  phone: z.string().trim().regex(/^[0-9+\- ]{8,15}$/).optional(),
});
const loginBody = z.object({ email: z.string().trim().email(), password: z.string().min(1).max(100) });

export const authRoutes = Router();

authRoutes.post('/register', limits.login, validate({ body: registerBody }), async (req, res) => {
  const out = await auth.register(res.locals.body);
  await mergeGuestCart(req.guestId, out.user.id);
  clearGuestCookie(res);
  setRefreshCookie(res, out.refreshToken, out.refreshExpiresAt);
  send(res, { accessToken: out.accessToken, user: out.user }, undefined, 201);
});

authRoutes.post('/login', limits.login, validate({ body: loginBody }), async (req, res) => {
  const out = await auth.login(res.locals.body);
  await mergeGuestCart(req.guestId, out.user.id);
  clearGuestCookie(res);
  setRefreshCookie(res, out.refreshToken, out.refreshExpiresAt);
  send(res, { accessToken: out.accessToken, user: out.user });
});

authRoutes.post('/refresh', async (req, res) => {
  const out = await auth.refresh(req.cookies?.[REFRESH_COOKIE]);
  setRefreshCookie(res, out.refreshToken, out.refreshExpiresAt);
  send(res, { accessToken: out.accessToken, user: out.user });
});

authRoutes.post('/logout', async (req, res) => {
  await auth.logout(req.cookies?.[REFRESH_COOKIE]);
  res.clearCookie(REFRESH_COOKIE, { path: cookiePath });
  send(res, { ok: true });
});

authRoutes.get('/me', requireAuth, async (req, res) => send(res, await auth.me(requireUser(req).id)));

authRoutes.patch(
  '/me',
  requireAuth,
  validate({ body: z.object({ name: z.string().trim().min(2).max(80).optional(), phone: z.string().trim().regex(/^[0-9+\- ]{8,15}$/).optional() }) }),
  async (req, res) => send(res, await auth.updateProfile(requireUser(req).id, res.locals.body)),
);

authRoutes.post(
  '/change-password',
  requireAuth,
  validate({ body: z.object({ current: z.string().min(1), next: z.string().min(8).max(100) }) }),
  async (req, res) => {
    await auth.changePassword(requireUser(req).id, res.locals.body.current, res.locals.body.next);
    res.clearCookie(REFRESH_COOKIE, { path: cookiePath });
    send(res, { ok: true, message: 'Password changed — please log in again' });
  },
);
