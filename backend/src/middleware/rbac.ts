import type { NextFunction, Request, Response } from 'express';
import type { Role } from '../generated/prisma/enums';
import type { AuthUser } from '../types/express';
import { AppError } from '../utils/AppError';

export const requireRole =
  (...roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError(401, 'Please log in'));
    if (!roles.includes(req.user.role)) return next(new AppError(403, 'You do not have access to this'));
    next();
  };

/** Staff = anyone who can open the admin cockpit. */
export const STAFF: Role[] = ['ADMIN', 'DEPT_MANAGER', 'SUPPORT'];

/**
 * Department scope for the current staff user.
 *  - ADMIN / SUPPORT → undefined (all departments)
 *  - DEPT_MANAGER    → their departmentId
 */
export function deptScope(user: AuthUser): string | undefined {
  return user.role === 'DEPT_MANAGER' ? user.deptId ?? '__none__' : undefined;
}

/** Throws 403 if a DEPT_MANAGER touches a resource outside their department. */
export function assertDeptAccess(user: AuthUser, departmentId: string | string[]) {
  if (user.role !== 'DEPT_MANAGER') return;
  const ids = Array.isArray(departmentId) ? departmentId : [departmentId];
  if (!user.deptId || !ids.includes(user.deptId)) throw new AppError(403, 'Outside your department');
}

/** Only these roles may write (SUPPORT is read-only for catalog). */
export function assertCanEditCatalog(user: AuthUser) {
  if (user.role !== 'ADMIN' && user.role !== 'DEPT_MANAGER') throw new AppError(403, 'Read-only access');
}
