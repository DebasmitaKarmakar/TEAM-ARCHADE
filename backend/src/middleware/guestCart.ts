import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

const GUEST_COOKIE = 'bm_guest';
const GUEST_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * For unauthenticated users: reads or creates the bm_guest cookie
 * and sets req.guestId for cart operations.
 * Logged-in users: req.guestId is undefined (cart keyed by userId).
 */
export function guestCart(req: Request, res: Response, next: NextFunction): void {
  if (req.user) {
    // Clear guest cookie if user is now logged in (merge happens in auth service)
    if (req.cookies[GUEST_COOKIE]) {
      req.guestId = req.cookies[GUEST_COOKIE];
    }
    return next();
  }

  let guestId = req.cookies[GUEST_COOKIE];
  if (!guestId) {
    guestId = uuidv4();
    res.cookie(GUEST_COOKIE, guestId, {
      httpOnly: true,
      maxAge: GUEST_MAX_AGE,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
  }

  req.guestId = guestId;
  next();
}
