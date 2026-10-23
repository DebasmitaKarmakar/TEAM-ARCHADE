import 'dotenv/config';

// Tests always run against a separate database: TEST_DATABASE_URL, or <DATABASE_URL db>_test.
process.env.NODE_ENV = 'test';
process.env.PAYMENT_MODE = 'mock';
process.env.CRON_ENABLED = 'false';
process.env.DATABASE_URL = testDbUrl();

export function testDbUrl() {
  if (process.env.TEST_DATABASE_URL) return process.env.TEST_DATABASE_URL;
  const base = process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/blowmaggy';
  const u = new URL(base);
  if (!u.pathname.endsWith('_test')) u.pathname = `${u.pathname}_test`;
  return u.toString();
}
