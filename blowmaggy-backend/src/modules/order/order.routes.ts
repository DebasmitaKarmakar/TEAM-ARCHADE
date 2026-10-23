import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/AppError';
import { pageMeta, paging, param, requireUser, send } from '../../utils/http';
import { cancelOrder, getMyOrder, listMyOrders, requestReturn } from './order.service';
import { renderInvoice } from './invoice';

export const orderRoutes = Router();
orderRoutes.use(requireAuth);

orderRoutes.get('/', async (req, res) => {
  const { page, limit } = paging(req.query as { page?: number; limit?: number }, 50);
  const out = await listMyOrders(requireUser(req).id, page, limit);
  send(res, out.orders, pageMeta(page, limit, out.total));
});

orderRoutes.get('/:orderNumber', async (req, res) => send(res, await getMyOrder(requireUser(req).id, param(req, 'orderNumber'))));

orderRoutes.post(
  '/:orderNumber/cancel',
  validate({ body: z.object({ itemIds: z.array(z.string()).optional(), reason: z.string().max(200).optional() }).default({}) }),
  async (req, res) => {
    const user = requireUser(req);
    const o = await prisma.order.findUnique({ where: { orderNumber: param(req, 'orderNumber') }, select: { id: true, userId: true } });
    if (!o || o.userId !== user.id) throw new AppError(404, 'Order not found');
    send(res, await cancelOrder(user, o.id, res.locals.body.itemIds, res.locals.body.reason ?? 'Cancelled by customer'));
  },
);

orderRoutes.post(
  '/:orderNumber/return',
  validate({ body: z.object({ itemIds: z.array(z.string()).min(1), reason: z.string().trim().min(3).max(200) }) }),
  async (req, res) => send(res, await requestReturn(requireUser(req), param(req, 'orderNumber'), res.locals.body.itemIds, res.locals.body.reason)),
);

orderRoutes.get('/:orderNumber/invoice', async (req, res) => {
  const html = await renderInvoice(requireUser(req).id, param(req, 'orderNumber'));
  res.type('html').send(html);
});
