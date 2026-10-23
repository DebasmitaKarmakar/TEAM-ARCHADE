import fs from 'node:fs/promises';
import path from 'node:path';
import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from './logger';

export interface Mail { to: string; subject: string; html: string }

/**
 * Sends email via Resend (RESEND_API_KEY) → SMTP (SMTP_HOST) → local file fallback (./tmp/emails).
 * Retries 3× with backoff. Never throws to the caller (email must not break checkout).
 */
export async function sendMail(mail: Mail): Promise<{ via: string; ref?: string } | null> {
  const delays = [0, 1000, 5000];
  for (let attempt = 0; attempt < delays.length; attempt++) {
    if (delays[attempt]) await new Promise((r) => setTimeout(r, env.isTest ? 0 : delays[attempt]));
    try {
      return await deliver(mail);
    } catch (err) {
      logger.warn({ err, attempt, to: mail.to }, 'email send failed');
    }
  }
  logger.error({ to: mail.to, subject: mail.subject }, 'email permanently failed');
  return null;
}

async function deliver(mail: Mail) {
  if (env.RESEND_API_KEY) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: env.MAIL_FROM, to: [mail.to], subject: mail.subject, html: mail.html }),
    });
    if (!res.ok) throw new Error(`Resend ${res.status}`);
    const body = (await res.json()) as { id?: string };
    return { via: 'resend', ref: body.id };
  }
  if (env.SMTP_HOST) {
    const transport = nodemailer.createTransport({
      host: env.SMTP_HOST, port: env.SMTP_PORT, secure: env.SMTP_PORT === 465,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    });
    const info = await transport.sendMail({ from: env.MAIL_FROM, ...mail });
    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) logger.info({ preview }, 'email preview (Ethereal)');
    return { via: 'smtp', ref: info.messageId };
  }
  const dir = path.resolve('tmp/emails');
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, `${Date.now()}-${mail.to.replace(/[^a-z0-9@.]/gi, '_')}.html`);
  await fs.writeFile(file, mail.html, 'utf8');
  logger.info({ file, to: mail.to, subject: mail.subject }, 'email saved locally (no provider configured)');
  return { via: 'file', ref: file };
}
