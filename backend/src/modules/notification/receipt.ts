import { env } from '../../config/env';
import { fmtINR } from '../../lib/money';
import { sendMail } from '../../lib/mailer';
import { prisma } from '../../lib/prisma';

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export async function sendOrderReceipt(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true, shipments: { include: { items: true } }, items: true },
  });
  if (!order) return null;
  const depts = await prisma.department.findMany();
  const deptById = new Map(depts.map((d) => [d.id, d]));
  const client = env.clientOrigins[0] ?? '';

  const groups = new Map<string, typeof order.items>();
  for (const it of order.items) {
    const key = it.departmentId;
    groups.set(key, [...(groups.get(key) ?? []), it]);
  }

  const rows = [...groups.entries()].map(([deptId, items]) => {
    const d = deptById.get(deptId);
    const lines = items.map((i) => {
      const opts = Object.values((i.optionsSnapshot ?? {}) as Record<string, string>).join(' · ');
      return `<tr><td style="padding:6px 0">${esc(i.nameSnapshot)}<br><span style="color:#6B6475;font-size:12px">${esc(opts)} × ${i.qty}</span></td>
        <td style="padding:6px 0;text-align:right">${fmtINR(i.lineTotal)}</td></tr>`;
    }).join('');
    return `<tr><td colspan="2" style="padding-top:14px;border-left:4px solid ${d?.accentHex ?? '#FF4F8B'};padding-left:8px;font:600 12px Inter,Arial;letter-spacing:.2em;text-transform:uppercase">${esc(d?.name ?? 'Items')}</td></tr>${lines}`;
  }).join('');

  const etas = order.shipments.map((s) =>
    `<li>${esc(s.group === 'grocery' ? 'Grocery' : s.group === 'electronics' ? 'Electronics' : 'Fashion, Beauty, Home & Kids')}: ${s.slot ? esc(s.slot) : s.eta.toDateString()}</li>`).join('');

  const html = `<!doctype html><html><body style="margin:0;background:#FAF7F2;font-family:Inter,Arial,sans-serif;color:#16131C">
  <div style="max-width:600px;margin:0 auto;background:#fff">
    <div style="background:linear-gradient(135deg,#0B0A0F,#3A1C4A 60%,#E0457B);color:#fff;padding:32px 28px">
      <div style="font:600 11px Inter,Arial;letter-spacing:.25em">VOL. 01 · THE EVERYTHING ISSUE</div>
      <div style="font:900 40px Georgia,serif;margin-top:8px">BLOWMAGGY</div>
      <div style="font:italic 20px Georgia,serif;color:#FF8AB0">Thanks, ${esc(order.user.name.split(' ')[0])} — it's in the issue.</div>
    </div>
    <div style="padding:24px 28px">
      <p style="margin:0 0 4px">Order <b>${order.orderNumber}</b></p>
      <p style="margin:0;color:#6B6475;font-size:13px">${order.createdAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} · ${order.paymentMethod}</p>
      <table style="width:100%;border-collapse:collapse;margin-top:12px;font-size:14px">${rows}
        <tr><td colspan="2"><hr style="border:none;border-top:1px solid #EDE7DF;margin:16px 0"></td></tr>
        <tr><td>Subtotal</td><td style="text-align:right">${fmtINR(order.subtotal)}</td></tr>
        <tr><td>Discounts</td><td style="text-align:right">−${fmtINR(order.discountTotal)}</td></tr>
        <tr><td>Delivery</td><td style="text-align:right">${order.deliveryFee ? fmtINR(order.deliveryFee) : 'FREE'}</td></tr>
        <tr><td style="font:700 18px Georgia,serif;padding-top:8px">Total</td><td style="text-align:right;font:700 18px Georgia,serif;padding-top:8px">${fmtINR(order.total)}</td></tr>
        <tr><td colspan="2" style="color:#6B6475;font-size:12px">Includes GST of ${fmtINR(order.tax)}</td></tr>
      </table>
      <p style="margin-top:20px;font-weight:600">Arriving</p><ul style="margin:4px 0 0;padding-left:18px;font-size:14px">${etas}</ul>
      <p style="margin-top:24px"><a href="${client}/orders/${order.orderNumber}" style="background:linear-gradient(135deg,#E23A76,#6D3FE0);color:#fff;padding:12px 20px;border-radius:12px;text-decoration:none;font-weight:600">Track your order</a></p>
    </div>
    <div style="padding:16px 28px;color:#6B6475;font-size:12px;border-top:1px solid #EDE7DF">One cart. Every aisle. · 7-day easy returns · Need help? Reply to this email.</div>
  </div></body></html>`;

  return sendMail({ to: order.user.email, subject: `Your Blowmaggy order ${order.orderNumber} is confirmed`, html });
}
