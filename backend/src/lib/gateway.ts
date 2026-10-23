import crypto from 'node:crypto';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';
import { randomToken } from '../utils/ids';

/**
 * Payment gateway abstraction.
 *  - razorpay: Razorpay TEST mode via REST (UPI + card + RuPay)
 *  - mock:     offline demo gateway (stage Wi-Fi died? flip PAYMENT_MODE=mock)
 */
export interface PaymentGateway {
  name: 'razorpay' | 'mock';
  keyId: string;
  createOrder(input: { amount: number; receipt: string; notes?: Record<string, string> }): Promise<{ id: string }>;
  verifySignature(input: { orderId: string; paymentId: string; signature: string }): boolean;
  verifyWebhook(rawBody: Buffer, signature: string | undefined): boolean;
  refund(paymentId: string, amount: number): Promise<{ id: string }>;
}

const hmac = (secret: string, data: string | Buffer) => crypto.createHmac('sha256', secret).update(data).digest('hex');

export function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

const razorpay: PaymentGateway = {
  name: 'razorpay',
  get keyId() { return env.RAZORPAY_KEY_ID; },
  async createOrder({ amount, receipt, notes }) {
    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString('base64'),
      },
      body: JSON.stringify({ amount, currency: 'INR', receipt, notes }),
    });
    if (!res.ok) throw new AppError(502, `Payment gateway error (${res.status})`, 'GATEWAY_ERROR');
    const body = (await res.json()) as { id: string };
    return { id: body.id };
  },
  verifySignature({ orderId, paymentId, signature }) {
    return safeEqual(hmac(env.RAZORPAY_KEY_SECRET, `${orderId}|${paymentId}`), signature);
  },
  verifyWebhook(rawBody, signature) {
    if (!signature || !env.RAZORPAY_WEBHOOK_SECRET) return false;
    return safeEqual(hmac(env.RAZORPAY_WEBHOOK_SECRET, rawBody), signature);
  },
  async refund(paymentId, amount) {
    const res = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString('base64'),
      },
      body: JSON.stringify({ amount }),
    });
    if (!res.ok) throw new AppError(502, `Refund failed (${res.status})`, 'GATEWAY_ERROR');
    const body = (await res.json()) as { id: string };
    return { id: body.id };
  },
};

/** Mock secret is public on purpose — mock mode is only for demos/tests. */
export const MOCK_SECRET = 'blowmaggy_mock_secret';
export const mockSignature = (orderId: string, paymentId: string) => hmac(MOCK_SECRET, `${orderId}|${paymentId}`);

const mock: PaymentGateway = {
  name: 'mock',
  keyId: 'rzp_test_mock',
  async createOrder() {
    return { id: `mock_order_${randomToken(9)}` };
  },
  verifySignature({ orderId, paymentId, signature }) {
    // Demo frontends can send signature "mock"; tests use a real HMAC.
    return signature === 'mock' || safeEqual(mockSignature(orderId, paymentId), signature);
  },
  verifyWebhook(rawBody, signature) {
    return !!signature && safeEqual(hmac(MOCK_SECRET, rawBody), signature);
  },
  async refund() {
    return { id: `mock_rfnd_${randomToken(9)}` };
  },
};

export const gateway: PaymentGateway = env.PAYMENT_MODE === 'razorpay' ? razorpay : mock;
export const webhookSignatureFor = (rawBody: string | Buffer) => hmac(MOCK_SECRET, rawBody);
