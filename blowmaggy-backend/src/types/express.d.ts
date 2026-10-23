import type { Role } from '../generated/prisma/enums';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  deptId: string | null;
  isMember: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      guestId?: string;
      id?: string;
    }
  }
}

export {};
