import { prisma } from '../../lib/prisma';

interface Note { type: string; title: string; body: string; link?: string }

/** Notify the department's managers + all admins (dedupes identical unread alerts). */
export async function notifyStaff(departmentId: string | null, note: Note) {
  const staff = await prisma.user.findMany({
    where: { OR: [{ role: 'ADMIN' }, ...(departmentId ? [{ role: 'DEPT_MANAGER' as const, departmentId }] : [])] },
    select: { id: true },
  });
  for (const s of staff) {
    const exists = await prisma.notification.findFirst({
      where: { userId: s.id, title: note.title, body: note.body, readAt: null },
      select: { id: true },
    });
    if (!exists) await prisma.notification.create({ data: { userId: s.id, ...note } });
  }
}

export async function listNotifications(userId: string, unreadOnly: boolean) {
  return prisma.notification.findMany({
    where: { userId, ...(unreadOnly ? { readAt: null } : {}) },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

export async function markRead(userId: string, id?: string) {
  await prisma.notification.updateMany({
    where: { userId, readAt: null, ...(id ? { id } : {}) },
    data: { readAt: new Date() },
  });
}
