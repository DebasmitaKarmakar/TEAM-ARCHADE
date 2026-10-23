import { Coupon } from '../types/store';

export const INITIAL_COUPONS: Coupon[] = [
  {
    code: 'ONECART',
    label: 'One Cart Edit',
    description: '10% off a consolidated order above ₹6,225.',
    discountPercent: 10,
    minimumSubtotal: 75,
    isActive: true,
  },
  {
    code: 'WELCOME5',
    label: 'First Dispatch',
    description: '5% off your first BLOWMAGGY edit above ₹3,320.',
    discountPercent: 5,
    minimumSubtotal: 40,
    isActive: true,
  },
  {
    code: 'FESTIVE15',
    label: 'Festive Curation',
    description: '15% off curated departments above ₹12,450.',
    discountPercent: 15,
    minimumSubtotal: 150,
    isActive: false,
  },
];
