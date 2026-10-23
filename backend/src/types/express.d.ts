import { Role } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      /** Set by auth middleware when a valid access token is present */
      user?: {
        id: string;
        role: Role;
        deptId?: string;
        isMember: boolean;
      };
      /** Request ID for tracing */
      requestId: string;
      /** Start time for timing middleware */
      startTime: number;
      /** Guest cart cookie value */
      guestId?: string;
    }
  }
}

export {};
