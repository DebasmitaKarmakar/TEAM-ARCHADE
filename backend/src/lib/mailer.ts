import { logger } from './logger';
import { env } from '../config/env';

/**
 * Email sending — uses Resend in production, logs to console in dev/demo.
 * For demo: use Ethereal (fake SMTP) and log the preview URL.
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  if (!env.RESEND_API_KEY || env.RESEND_API_KEY === 'xxx') {
    // Dev/demo mode: just log the email
    logger.info({
      to: options.to,
      subject: options.subject,
      preview: `📧 Email would be sent: "${options.subject}" to ${options.to}`,
    }, 'Email logged (no API key configured)');
    return;
  }

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(env.RESEND_API_KEY);

    await resend.emails.send({
      from: env.MAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    logger.info({ to: options.to, subject: options.subject }, 'Email sent');
  } catch (err) {
    logger.error({ err, to: options.to }, 'Failed to send email');
  }
}

/** Generate order receipt email HTML */
export function buildReceiptHtml(order: {
  orderNumber: string;
  items: Array<{ nameSnapshot: string; qty: number; unitPrice: number; lineTotal: number }>;
  total: number;
  deliveryFee: number;
  discountTotal: number;
}): string {
  const fmtINR = (p: number) => '₹' + (p / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 });

  const itemRows = order.items.map(it => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${it.nameSnapshot}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${it.qty}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${fmtINR(it.lineTotal)}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #6c5ce7; font-size: 28px; margin: 0;">Blowmaggy</h1>
        <p style="color: #888; margin: 4px 0;">Order Confirmation</p>
      </div>
      <div style="background: #f8f8fc; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <h2 style="margin: 0 0 8px; font-size: 18px;">Order ${order.orderNumber}</h2>
        <p style="color: #666; margin: 0;">Thank you for your order! Here's your receipt.</p>
      </div>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
        <thead>
          <tr style="background: #f0f0f5;">
            <th style="padding: 8px; text-align: left;">Item</th>
            <th style="padding: 8px; text-align: center;">Qty</th>
            <th style="padding: 8px; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
      <div style="text-align: right; margin-top: 16px;">
        ${order.discountTotal > 0 ? `<p style="color: #00b894;">Discount: −${fmtINR(order.discountTotal)}</p>` : ''}
        ${order.deliveryFee > 0 ? `<p>Delivery: ${fmtINR(order.deliveryFee)}</p>` : '<p style="color: #00b894;">Free Delivery ✓</p>'}
        <p style="font-size: 20px; font-weight: 700; color: #6c5ce7;">Total: ${fmtINR(order.total)}</p>
      </div>
      <div style="text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #eee;">
        <p style="color: #aaa; font-size: 12px;">Made with 💜 by Blowmaggy</p>
      </div>
    </div>
  `;
}
