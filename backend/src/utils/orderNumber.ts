import { prisma } from '../lib/prisma';

/**
 * Generate an order number in the format BM-YYYY-MM-XXXXX.
 * Uses random 5-digit suffix with retry on collision.
 */
export async function generateOrderNumber(): Promise<string> {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `BM-${yyyy}-${mm}-`;

  for (let attempt = 0; attempt < 5; attempt++) {
    const suffix = String(Math.floor(10000 + Math.random() * 90000));
    const orderNumber = `${prefix}${suffix}`;

    // Check if already used
    const existing = await prisma.order.findUnique({
      where: { orderNumber },
      select: { id: true },
    });

    if (!existing) return orderNumber;
  }

  // Fallback: use timestamp-based suffix
  const ts = Date.now().toString(36).toUpperCase().slice(-5);
  return `${prefix}${ts}`;
}
