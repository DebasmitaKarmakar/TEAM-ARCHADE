import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { AppError } from '../utils/AppError';

/**
 * Requires the user to have one of the specified roles.
 */
export const requireRole = (...roles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(new AppError(401, 'Authentication required'));
    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, 'Forbidden'));
    }
    next();
  };
};

/**
 * For department-scoped operations:
 * ADMIN can access everything, DEPT_MANAGER only their own department.
 * `getDeptId` extracts the target department from the request.
 */
export const requireDeptScope = (getDeptId: (req: Request) => Promise<string>) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) return next(new AppError(401, 'Authentication required'));
    if (req.user.role === 'ADMIN' || req.user.role === 'SUPPORT') return next();

    if (req.user.role === 'DEPT_MANAGER') {
      try {
        const targetDeptId = await getDeptId(req);
        if (targetDeptId === req.user.deptId) return next();
      } catch {
        // getDeptId threw — likely a 404
      }
    }

    next(new AppError(403, 'Outside your department'));
  };
};
