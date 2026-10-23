/** Side effects that run AFTER a transaction commits (never inside the payment request path). */
import { logger } from '../../lib/logger';

export function afterCommit(label: string, fn: () => Promise<unknown>) {
  setImmediate(() => {
    fn().catch((err) => logger.error({ err, label }, 'background task failed'));
  });
}
