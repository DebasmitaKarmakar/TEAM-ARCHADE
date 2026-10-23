import express, { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { requireUser, send } from '../../utils/http';
import { handleWebhook, paymentModeInfo, verifyPayment } from './payment.service';

export const paymentRoutes = Router();

paymentRoutes.get('/config', (_req, res) => send(res, paymentModeInfo()));

paymentRoutes.post(
  '/verify',
  requireAuth,
  validate({ body: z.object({ razorpay_order_id: z.string().min(3), razorpay_payment_id: z.string().min(3), razorpay_signature: z.string().min(3) }) }),
  async (req, res) => send(res, await verifyPayment(requireUser(req), res.locals.body)),
);

/**
 * Webhook router — must be mounted BEFORE express.json() so we can HMAC the exact raw bytes.
 * Razorpay dashboard → Webhooks → https://<api>/api/v1/payments/webhook
 */
export const webhookRouter = Router();
webhookRouter.post('/', express.raw({ type: '*/*', limit: '1mb' }), async (req, res) => {
  const raw = Buffer.isBuffer(req.body) ? req.body : Buffer.from('');
  const out = await handleWebhook(raw, req.header('x-razorpay-signature'), req.header('x-razorpay-event-id'));
  send(res, out);
});
