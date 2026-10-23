import 'dotenv/config';
import { z } from 'zod';

const bool = z
  .string()
  .optional()
  .transform((v) => v === undefined || v === '' ? undefined : ['1', 'true', 'yes'].includes(v.toLowerCase()));

const schema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().default(4000),
    CLIENT_URL: z.string().default('http://localhost:5173'),
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
    JWT_ACCESS_SECRET: z.string().default('dev-access-secret-change-me-dev-access-secret'),
    JWT_REFRESH_SECRET: z.string().default('dev-refresh-secret-change-me-dev-refresh-secret'),
    ACCESS_TTL: z.string().default('15m'),
    REFRESH_TTL_DAYS: z.coerce.number().default(7),
    PAYMENT_MODE: z.enum(['mock', 'razorpay']).default('mock'),
    RAZORPAY_KEY_ID: z.string().optional().default(''),
    RAZORPAY_KEY_SECRET: z.string().optional().default(''),
    RAZORPAY_WEBHOOK_SECRET: z.string().optional().default(''),
    RESEND_API_KEY: z.string().optional().default(''),
    SMTP_HOST: z.string().optional().default(''),
    SMTP_PORT: z.coerce.number().default(587),
    SMTP_USER: z.string().optional().default(''),
    SMTP_PASS: z.string().optional().default(''),
    MAIL_FROM: z.string().default('Blowmaggy <orders@blowmaggy.demo>'),
    CRON_ENABLED: bool,
    LOG_LEVEL: z.string().default('info'),
  })
  .superRefine((e, ctx) => {
    if (e.NODE_ENV === 'production') {
      if (e.JWT_ACCESS_SECRET.startsWith('dev-') || e.JWT_ACCESS_SECRET.length < 32)
        ctx.addIssue({ code: 'custom', path: ['JWT_ACCESS_SECRET'], message: 'Set a strong secret (32+ chars) in production' });
      if (e.JWT_REFRESH_SECRET.startsWith('dev-') || e.JWT_REFRESH_SECRET.length < 32)
        ctx.addIssue({ code: 'custom', path: ['JWT_REFRESH_SECRET'], message: 'Set a strong secret (32+ chars) in production' });
    }
    if (e.PAYMENT_MODE === 'razorpay' && (!e.RAZORPAY_KEY_ID || !e.RAZORPAY_KEY_SECRET))
      ctx.addIssue({ code: 'custom', path: ['RAZORPAY_KEY_ID'], message: 'Razorpay keys required when PAYMENT_MODE=razorpay' });
  });

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌ Invalid environment:\n', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  ...parsed.data,
  CRON_ENABLED: parsed.data.CRON_ENABLED ?? parsed.data.NODE_ENV !== 'test',
  clientOrigins: parsed.data.CLIENT_URL.split(',').map((s) => s.trim()).filter(Boolean),
  isProd: parsed.data.NODE_ENV === 'production',
  isTest: parsed.data.NODE_ENV === 'test',
};
