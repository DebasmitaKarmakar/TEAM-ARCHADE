/**
 * Creates/refreshes the test database: drop schema → apply migrations (same SQL Prisma deploys) → seed.
 */
import 'dotenv/config';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';
import { testDbUrl } from './setupEnv';

export default async function setup() {
  const url = testDbUrl();
  const target = new URL(url);
  const dbName = target.pathname.slice(1);

  // create the database if missing
  const admin = new URL(url);
  admin.pathname = '/postgres';
  const a = new pg.Client({ connectionString: admin.toString() });
  await a.connect();
  const exists = await a.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
  if (!exists.rowCount) await a.query(`CREATE DATABASE "${dbName}"`);
  await a.end();

  const c = new pg.Client({ connectionString: url });
  await c.connect();
  await c.query('DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;');
  const dir = path.resolve('prisma/migrations');
  for (const m of fs.readdirSync(dir).filter((d) => fs.statSync(path.join(dir, d)).isDirectory()).sort()) {
    await c.query(fs.readFileSync(path.join(dir, m, 'migration.sql'), 'utf8'));
  }
  await c.end();

  execSync('npx tsx prisma/seed/index.ts', {
    stdio: 'pipe',
    env: { ...process.env, DATABASE_URL: url, NODE_ENV: 'test', CRON_ENABLED: 'false' },
  });
}
