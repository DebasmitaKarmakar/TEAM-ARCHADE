import request from 'supertest';
import { createApp } from '../src/app';
import { mockSignature } from '../src/lib/gateway';
import { prisma } from '../src/lib/prisma';

export const app = createApp();
export { prisma };

const H = { 'X-Requested-With': 'XMLHttpRequest' };

/** A small client that keeps cookies (guest cart, refresh token) and the bearer token. */
export function client() {
  const agent = request.agent(app);
  let token: string | undefined;
  const auth = () => (token ? { ...H, Authorization: `Bearer ${token}` } : H);
  const c = {
    agent,
    get token() { return token; },
    set token(t: string | undefined) { token = t; },
    get: (url: string) => agent.get(`/api/v1${url}`).set(auth()),
    post: (url: string, body?: object, headers: Record<string, string> = {}) => agent.post(`/api/v1${url}`).set({ ...auth(), ...headers }).send(body ?? {}),
    patch: (url: string, body?: object) => agent.patch(`/api/v1${url}`).set(auth()).send(body ?? {}),
    put: (url: string, body?: object) => agent.put(`/api/v1${url}`).set(auth()).send(body ?? {}),
    del: (url: string) => agent.delete(`/api/v1${url}`).set(auth()),
    async login(email: string, password = 'Demo@123') {
      const r = await c.post('/auth/login', { email, password });
      if (r.status !== 200) throw new Error(`login failed ${r.status} ${JSON.stringify(r.body)}`);
      token = r.body.data.accessToken;
      return r.body.data.user;
    },
    async register(name = 'Test User') {
      const email = `t${Date.now()}${Math.floor(Math.random() * 1e6)}@test.dev`;
      const r = await c.post('/auth/register', { name, email, password: 'Password123' });
      if (r.status !== 201) throw new Error(`register failed ${r.status} ${JSON.stringify(r.body)}`);
      token = r.body.data.accessToken;
      return { ...r.body.data.user, email };
    },
  };
  return c;
}

export async function variantOf(code: string, options?: Record<string, string>) {
  const p = await prisma.product.findUniqueOrThrow({ where: { code }, include: { variants: true } });
  const v = options
    ? p.variants.find((x) => Object.entries(options).every(([k, val]) => (x.options as Record<string, string>)[k] === val))
    : p.variants[0];
  if (!v) throw new Error(`variant not found ${code} ${JSON.stringify(options)}`);
  return v;
}

export const address = {
  name: 'Test Buyer', phone: '9876543210', line1: '1 Test Street', city: 'Guwahati', state: 'Assam', pincode: '781001',
};

/** checkout + mock payment verification → returns orderNumber */
export async function checkoutAndPay(c: ReturnType<typeof client>, method: 'UPI' | 'CARD' = 'UPI', key = `k-${Date.now()}-${Math.random()}`) {
  const r = await c.post('/checkout', { paymentMethod: method, address }, { 'Idempotency-Key': key });
  if (r.status !== 201) throw new Error(`checkout failed ${r.status} ${JSON.stringify(r.body)}`);
  const { razorpayOrderId } = r.body.data;
  const paymentId = `pay_test_${Math.random().toString(36).slice(2)}`;
  const v = await c.post('/payments/verify', {
    razorpay_order_id: razorpayOrderId, razorpay_payment_id: paymentId, razorpay_signature: mockSignature(razorpayOrderId, paymentId),
  });
  if (v.status !== 200) throw new Error(`verify failed ${v.status} ${JSON.stringify(v.body)}`);
  return { checkout: r.body.data, orderNumber: v.body.data.orderNumber as string, paymentId };
}
