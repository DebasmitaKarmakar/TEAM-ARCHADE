import { createApp } from './app';
import { env } from './config/env';
import { startJobs } from './jobs';
import { logger } from './lib/logger';
import { prisma } from './lib/prisma';

const app = createApp();
const server = app.listen(env.PORT, () => {
  logger.info(`🛍  BLOWMAGGY API on http://localhost:${env.PORT}/api/v1  (payments: ${env.PAYMENT_MODE})`);
});
if (env.CRON_ENABLED) startJobs();

async function shutdown(signal: string) {
  logger.info({ signal }, 'shutting down');
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
