import Razorpay from 'razorpay';
import crypto from 'crypto';
import { env } from '../config/env';
import { timingSafeEqual } from './tokens';

// Only initialize if not in mock mode
const razorpay = env.PAYMENT_MODE === 'razorpay'
  ? new Razorpay({ key_id: env.RAZORPAY_KEY_ID, key_secret: env.RAZORPAY_KEY_SECRET })
  : null;

export interface RazorpayOrderInput {
  amount: number; // paise
  currency?: string;
  receipt: string;
}

/** Create a Razorpay order */
export async function createRazorpayOrder(input: RazorpayOrderInput) {
  if (!razorpay) throw new Error('Razorpay not configured');
  return razorpay.orders.create({
    amount: input.amount,
    currency: input.currency ?? 'INR',
    receipt: input.receipt,
  });
}

/** Verify Razorpay payment signature (HMAC SHA256) */
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const expected = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  return timingSafeEqual(expected, signature);
}

/** Verify webhook signature */
export function verifyWebhookSignature(rawBody: Buffer, signature: string): boolean {
  const expected = crypto
    .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');
  return timingSafeEqual(expected, signature);
}

/** Issue a refund */
export async function createRefund(paymentId: string, amount?: number) {
  if (!razorpay) throw new Error('Razorpay not configured');
  return razorpay.payments.refund(paymentId, { amount });
}
