import { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger';

/**
 * Logs request duration on response finish.
 */
export function timing(req: Request, res: Response, next: NextFunction): void {
  req.startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    logger.info({
      requestId: req.requestId,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
}
