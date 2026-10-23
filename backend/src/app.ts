import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Router } from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { env } from './config/env';
import { logger } from './lib/logger';
import { prisma } from './lib/prisma';
import { optionalAuth } from './middleware/auth';
import { errorHandler, notFoundHandler } from './middleware/error';
import { readGuestCookie } from './middleware/guestCart';
import { limits, requireCustomHeader } from './middleware/security';
import { accountRoutes } from './modules/account/account.routes';
import { adminRoutes } from './modules/admin/admin.routes';
import { authRoutes } from './modules/auth/auth.routes';
import { cartRoutes } from './modules/cart/cart.routes';
import { catalogRoutes } from './modules/catalog/catalog.routes';
import { checkoutRoutes } from './modules/checkout/checkout.routes';
import { orderRoutes } from './modules/order/order.routes';
import { paymentRoutes, webhookRouter } from './modules/payment/payment.routes';
import { send } from './utils/http';
import { uuid } from './utils/ids';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1); // Render / Railway / Vercel proxies

  app.use((req, res, next) => { req.id = req.header('x-request-id') ?? uuid(); res.setHeader('x-request-id', req.id); next(); });
  if (!env.isTest) app.use(pinoHttp({ logger, genReqId: (req) => (req as express.Request).id ?? uuid(), autoLogging: { ignore: (req) => req.url === '/api/v1/health' },
    serializers: { req: (req) => ({ method: req.method, url: req.url }), res: (res) => ({ statusCode: res.statusCode }) } }));
  app.use(helmet());
  app.use(cors({
    origin: (origin, cb) => cb(null, !origin || env.clientOrigins.includes(origin) || (!env.isProd && /^http:\/\/localhost:\d+$/.test(origin))),
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key', 'X-Requested-With', 'X-Request-Id'],
  }));
  app.use(compression());

  // Webhook needs the RAW body for HMAC → mount before the JSON parser.
  app.use('/api/v1/payments/webhook', webhookRouter);

  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());

  const api = Router();
  api.use(limits.global);
  api.get('/health', async (_req, res) => {
    await prisma.$queryRaw`SELECT 1`;
    send(res, { ok: true, service: 'blowmaggy-api', paymentMode: env.PAYMENT_MODE, time: new Date().toISOString() });
  });
  api.use(requireCustomHeader);
  api.use(optionalAuth);
  api.use(readGuestCookie);

  api.use('/auth', authRoutes);
  api.use('/', catalogRoutes); // /departments /products /search /home /bundles /recommendations/home
  api.use('/cart', cartRoutes);
  api.use('/checkout', checkoutRoutes);
  api.use('/payments', paymentRoutes);
  api.use('/orders', orderRoutes);
  api.use('/admin', adminRoutes);
  api.use('/', accountRoutes); // /addresses /wishlist /products/:id/reviews /membership /notifications

  app.use('/api/v1', api);
  app.get('/', (_req, res) => res.json({ name: 'BLOWMAGGY API', docs: '/api/v1/health', tagline: 'One cart. Every aisle.' }));
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
