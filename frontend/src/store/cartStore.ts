import { create } from 'zustand';
import api from '../lib/api';

interface CartItem {
  id: string;
  variantId: string;
  qty: number;
  product: {
    name: string;
    brand: string;
    department: string;
    image: string;
  };
  variant: {
    options: Record<string, string>;
    price: number;
    available: number;
  };
  priceAtAdd: number;
  warnings: string[];
}

interface CartState {
  items: CartItem[];
  subtotal: number;
  discountTotal: number;
  deliveryFee: number;
  total: number;
  couponCode: string | null;
  couponError: string | null;
  freeDeliveryGap: number;
  memberPreviewSavings: number;
  isOpen: boolean;
  isLoading: boolean;

  fetchCart: () => Promise<void>;
  addItem: (variantId: string, qty?: number) => Promise<void>;
  updateItem: (itemId: string, qty: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => Promise<void>;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  itemCount: () => number;
}

export const useCartStore = create<CartState>()((set, get) => ({
  items: [],
  subtotal: 0,
  discountTotal: 0,
  deliveryFee: 0,
  total: 0,
  couponCode: null,
  couponError: null,
  freeDeliveryGap: 0,
  memberPreviewSavings: 0,
  isOpen: false,
  isLoading: false,

  itemCount: () => get().items.reduce((sum, i) => sum + i.qty, 0),

  fetchCart: async () => {
    try {
      const { data } = await api.get('/cart');
      const cart = data.data;
      set({
        items: cart.lines ?? [],
        subtotal: cart.subtotal ?? 0,
        discountTotal: cart.discountTotal ?? 0,
        deliveryFee: cart.deliveryFee ?? 0,
        total: cart.total ?? 0,
        couponCode: cart.couponCode ?? null,
        couponError: cart.couponError ?? null,
        freeDeliveryGap: cart.freeDeliveryGap ?? 0,
        memberPreviewSavings: cart.memberPreviewSavings ?? 0,
      });
    } catch {}
  },

  addItem: async (variantId, qty = 1) => {
    set({ isLoading: true });
    try {
      await api.post('/cart/items', { variantId, qty });
      await get().fetchCart();
      set({ isOpen: true });
    } finally {
      set({ isLoading: false });
    }
  },

  updateItem: async (itemId, qty) => {
    try {
      await api.patch(`/cart/items/${itemId}`, { qty });
      await get().fetchCart();
    } catch {}
  },

  removeItem: async (itemId) => {
    try {
      await api.delete(`/cart/items/${itemId}`);
      await get().fetchCart();
    } catch {}
  },

  applyCoupon: async (code) => {
    try {
      await api.post('/cart/coupon', { code });
      await get().fetchCart();
    } catch {}
  },

  removeCoupon: async () => {
    try {
      await api.delete('/cart/coupon');
      await get().fetchCart();
    } catch {}
  },

  openCart:   () => set({ isOpen: true }),
  closeCart:  () => set({ isOpen: false }),
  toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
}));
