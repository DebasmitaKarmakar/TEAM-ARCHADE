import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middleware/auth';
import { limits } from '../../middleware/security';
import { validate } from '../../middleware/validate';
import { AppError } from '../../utils/AppError';
import { requireUser, send } from '../../utils/http';
import { checkout } from './checkout.service';

export const addressSchema = z.object({
  label: z.string().trim().max(20).optional(),
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().regex(/^[0-9+\- ]{10,15}$/, 'Enter a valid phone number'),
  line1: z.string().trim().min(3).max(120),
  line2: z.string().trim().max(120).nullish(),
  landmark: z.string().trim().max(80).nullish(),
  city: z.string().trim().min(2).max(60),
  state: z.string().trim().min(2).max(60),
  pincode: z.string().trim().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
});

const body = z.object({
  addressId: z.string().optional(),
  address: addressSchema.optional(),
  paymentMethod: z.enum(['UPI', 'CARD', 'COD']),
  grocerySlot: z.string().max(40).optional(),
});

export const checkoutRoutes = Router();

checkoutRoutes.post('/', requireAuth, limits.checkout, validate({ body }), async (req, res) => {
  const key = req.header('Idempotency-Key');
  if (!key || key.length < 8 || key.length > 100) throw new AppError(400, 'Idempotency-Key header is required', 'IDEMPOTENCY_KEY_REQUIRED');
  send(res, await checkout(requireUser(req), res.locals.body, key), undefined, 201);
});
