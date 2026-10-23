/**
 * AUTH — short-lived JWT access token (15 min) + rotating refresh token (httpOnly cookie, hashed in DB).
 * Reusing an already-rotated refresh token ⇒ the whole token family is revoked (stolen-token defence).
 */
import bcrypt from 'bcryptjs';
import { env } from '../../config/env';
import { prisma } from '../../lib/prisma';
import { signAccessToken } from '../../lib/tokens';
import { AppError } from '../../utils/AppError';
import { randomToken, sha256, uuid } from '../../utils/ids';

export const BCRYPT_ROUNDS = env.isTest ? 4 : 12;
const ROTATION_GRACE_MS = 10_000;

type UserRow = NonNullable<Awaited<ReturnType<typeof findUserWithDept>>>;
const findUserWithDept = (where: { id?: string; email?: string }) =>
  prisma.user.findFirst({ where, include: { department: { select: { id: true, slug: true, name: true } } } });

export function publicUser(u: UserRow) {
  const isMember = !!u.memberUntil && u.memberUntil > new Date();
  return {
    id: u.id, email: u.email, name: u.name, phone: u.phone, role: u.role,
    department: u.department ? { id: u.department.id, slug: u.department.slug, name: u.department.name } : null,
    isMember, memberUntil: u.memberUntil, memberPlan: u.memberPlan,
  };
}

async function issueTokens(user: UserRow, family: string = uuid()) {
  const accessToken = signAccessToken({ sub: user.id, role: user.role, deptId: user.departmentId });
  const refreshToken = randomToken(32);
  const expiresAt = new Date(Date.now() + env.REFRESH_TTL_DAYS * 86_400_000);
  await prisma.refreshToken.create({ data: { userId: user.id, tokenHash: sha256(refreshToken), family, expiresAt } });
  return { accessToken, refreshToken, refreshExpiresAt: expiresAt, user: publicUser(user) };
}

export async function register(input: { name: string; email: string; password: string; phone?: string }) {
  const email = input.email.trim().toLowerCase();
  const exists = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (exists) throw new AppError(409, 'An account with this email already exists', 'EMAIL_TAKEN');
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  // Role is ALWAYS SHOPPER here — staff roles are granted by an admin only.
  const u = await prisma.user.create({ data: { email, name: input.name.trim(), phone: input.phone, passwordHash, role: 'SHOPPER' } });
  return issueTokens((await findUserWithDept({ id: u.id }))!);
}

export async function login(input: { email: string; password: string }) {
  const user = await findUserWithDept({ email: input.email.trim().toLowerCase() });
  // constant-ish time: always run bcrypt
  const ok = await bcrypt.compare(input.password, user?.passwordHash ?? '$2a$04$invalidinvalidinvalidinvalidinvalidinvalidinvalidinv');
  if (!user || !ok) throw new AppError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  return issueTokens(user);
}

export async function refresh(raw: string | undefined) {
  if (!raw) throw new AppError(401, 'No session', 'NO_REFRESH');
  const row = await prisma.refreshToken.findUnique({ where: { tokenHash: sha256(raw) } });
  if (!row) throw new AppError(401, 'Session not found', 'REFRESH_INVALID');
  if (row.revokedAt) {
    if (Date.now() - row.revokedAt.getTime() > ROTATION_GRACE_MS) {
      await prisma.refreshToken.updateMany({ where: { family: row.family, revokedAt: null }, data: { revokedAt: new Date() } });
      throw new AppError(401, 'Session ended for security reasons — please log in again', 'REFRESH_REUSED');
    }
    throw new AppError(401, 'Session already refreshed', 'REFRESH_ROTATED');
  }
  if (row.expiresAt < new Date()) throw new AppError(401, 'Session expired', 'REFRESH_EXPIRED');
  const revoked = await prisma.refreshToken.updateMany({ where: { id: row.id, revokedAt: null }, data: { revokedAt: new Date() } });
  if (revoked.count === 0) throw new AppError(401, 'Session already refreshed', 'REFRESH_ROTATED');
  const user = await findUserWithDept({ id: row.userId });
  if (!user) throw new AppError(401, 'User not found');
  return issueTokens(user, row.family);
}

export async function logout(raw: string | undefined) {
  if (!raw) return;
  const row = await prisma.refreshToken.findUnique({ where: { tokenHash: sha256(raw) } });
  if (row) await prisma.refreshToken.updateMany({ where: { family: row.family, revokedAt: null }, data: { revokedAt: new Date() } });
}

export async function me(userId: string) {
  const u = await findUserWithDept({ id: userId });
  if (!u) throw new AppError(404, 'User not found');
  return publicUser(u);
}

export async function updateProfile(userId: string, data: { name?: string; phone?: string }) {
  await prisma.user.update({ where: { id: userId }, data });
  return me(userId);
}

export async function changePassword(userId: string, current: string, next: string) {
  const u = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (!(await bcrypt.compare(current, u.passwordHash))) throw new AppError(400, 'Current password is wrong');
  await prisma.user.update({ where: { id: userId }, data: { passwordHash: await bcrypt.hash(next, BCRYPT_ROUNDS) } });
  await prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
}
