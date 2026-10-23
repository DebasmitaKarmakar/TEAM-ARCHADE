import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { MAX_QTY_PER_LINE } from '../../config/constants';
import { ensureGuestId } from '../../middleware/guestCart';
import { validate } from '../../middleware/validate';
import { param, send } from '../../utils/http';
import * as cart from './cart.service';

/** Cart identity: logged-in user, else guest cookie (created on first write). */
const ctx = (req: Request, res: Response, create = false): cart.CartCtx =>
  req.user ? { userId: req.user.id } : { guestId: create ? ensureGuestId(req, res) : req.guestId };

export const cartRoutes = Router();

cartRoutes.get('/', async (req, res) => send(res, await cart.getCart(ctx(req, res))));

cartRoutes.post(
  '/items',
  validate({ body: z.object({ variantId: z.string().min(1), qty: z.coerce.number().int().min(1).max(MAX_QTY_PER_LINE).default(1) }) }),
  async (req, res) => send(res, await cart.addItem(ctx(req, res, true), res.locals.body.variantId, res.locals.body.qty)),
);

cartRoutes.patch(
  '/items/:id',
  validate({ body: z.object({ qty: z.coerce.number().int().min(0).max(MAX_QTY_PER_LINE) }) }),
  async (req, res) => send(res, await cart.updateItem(ctx(req, res), param(req, 'id'), res.locals.body.qty)),
);

cartRoutes.delete('/items/:id', async (req, res) => send(res, await cart.removeItem(ctx(req, res), param(req, 'id'))));

cartRoutes.post(
  '/coupon',
  validate({ body: z.object({ code: z.string().trim().min(2).max(30) }) }),
  async (req, res) => send(res, await cart.applyCoupon(ctx(req, res, true), res.locals.body.code)),
);
cartRoutes.delete('/coupon', async (req, res) => send(res, await cart.removeCoupon(ctx(req, res))));

cartRoutes.post(
  '/grocery-slot',
  validate({ body: z.object({ slot: z.string().min(3).max(40) }) }),
  async (req, res) => send(res, await cart.setGrocerySlot(ctx(req, res, true), res.locals.body.slot)),
);

cartRoutes.post(
  '/bundles/:slug',
  validate({ body: z.object({ picks: z.record(z.string()).optional() }).default({}) }),
  async (req, res) => send(res, await cart.addBundle(ctx(req, res, true), param(req, 'slug'), res.locals.body.picks)),
);
