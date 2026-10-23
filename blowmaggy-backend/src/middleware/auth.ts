import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { verifyAccessToken } from '../lib/tokens';
import { AppError } from '../utils/AppError';

/** Reads `Authorization: Bearer <access token>` if present and loads a fresh user row. Never throws for guests. */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next();
  try {
    const claims = verifyAccessToken(header.slice(7));
    const u = await prisma.user.findUnique({
      where: { id: claims.sub },
      select: { id: true, email: true, name: true, role: true, departmentId: true, memberUntil: true },
    });
    if (u) {
      req.user = {
        id: u.id, email: u.email, name: u.name, role: u.role, deptId: u.departmentId,
        isMember: !!u.memberUntil && u.memberUntil > new Date(),
      };
    }
    next();
  } catch {
    next(new AppError(401, 'Session expired — please refresh', 'TOKEN_INVALID'));
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) return next(new AppError(401, 'Please log in'));
  next();
}
