import { v4 as uuidv4 } from 'uuid';
import { logger } from './logger';

/**
 * Mock payment gateway for demo / offline use.
 * PAYMENT_MODE=mock: simulates Razorpay with 1.5s delay.
 */

interface MockOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

const mockOrders = new Map<string, MockOrder>();

export async function createMockOrder(amount: number, receipt: string): Promise<MockOrder> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const order: MockOrder = {
    id: `mock_${uuidv4().slice(0, 12)}`,
    amount,
    currency: 'INR',
    receipt,
    status: 'created',
  };

  mockOrders.set(order.id, order);
  logger.info({ orderId: order.id, amount }, 'Mock order created');
  return order;
}

export function verifyMockSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  // In mock mode, accept "mock" as valid signature
  return signature === 'mock' && mockOrders.has(orderId);
}

export function getMockOrder(orderId: string): MockOrder | undefined {
  return mockOrders.get(orderId);
}
