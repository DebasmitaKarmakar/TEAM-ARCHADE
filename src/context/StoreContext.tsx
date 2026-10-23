import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  DepartmentId,
  UserRole,
  Product,
  CartItem,
  Order,
  StaffMember,
  AuditLogItem,
  Coupon,
  Review,
} from '../types/store';
import { PRODUCTS, DEPARTMENTS, STAFF_MEMBERS, INITIAL_AUDIT_LOGS } from '../data/mockData';
import { DemoAccount, getDemoAccount } from '../config/demoAccounts';
import { INITIAL_COUPONS } from '../data/coupons';
import { INITIAL_REVIEWS } from '../data/reviews';
import { formatInr } from '../lib/currency';

export type ActiveView =
  | 'home'
  | 'pdp'
  | 'department'
  | 'cart'
  | 'checkout'
  | 'order-tracking'
  | 'wishlist'
  | 'search'
  | 'order-history'
  | 'store-admin'
  | 'store_admin'
  | 'dept-manager'
  | 'dept_manager'
  | 'magazine'
  | 'theme-lab';


interface ToastState {
  show: boolean;
  title: string;
  message: string;
  price?: string;
}

interface StoreContextType {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentUser: DemoAccount | null;
  isLoginModalOpen: boolean;
  setLoginModalOpen: (open: boolean) => void;
  loginWithDemo: (email: string, password: string) => { success: boolean; message: string };
  logout: () => void;
  selectedDeptId: DepartmentId;
  setSelectedDeptId: (dept: DepartmentId) => void;
  selectedProductId: string;
  setSelectedProductId: (id: string) => void;
  selectedProduct: Product;
  selectedOrderId: string;
  setSelectedOrderId: (id: string) => void;
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, variants?: { color?: string; cushion?: string; archFit?: string; size?: string; priceAdd?: number }) => void;
  updateCartQuantity: (cartItemId: string, delta: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  couponCode: string;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  couponDiscountAmount: number;
  coupons: Coupon[];
  addCoupon: (coupon: Coupon) => void;
  toggleCoupon: (code: string) => void;
  cartSubtotal: number;
  cartTax: number;
  cartShipping: number;
  cartTotal: number;
  cartTotalQuantity: number;
  departmentMix: Record<DepartmentId, number>;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  orders: Order[];
  placeOrder: (shippingAddress: Order['shippingAddress'], paymentMethod: Order['paymentMethod']) => Order;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  catalogStatus: Record<string, 'live' | 'paused'>;
  updateCatalogStatus: (productId: string, status: 'live' | 'paused') => void;
  reviews: Review[];
  addReview: (review: Omit<Review, 'id' | 'createdAt' | 'verifiedPurchase'>) => void;
  staffList: StaffMember[];
  assignManager: (name: string, email: string, assignedDeptIds: DepartmentId[]) => void;
  revokeStaff: (id: string) => void;
  inventory: Record<string, { stock: number; buffer: number; status: 'optimal' | 'low_warning' | 'critical' }>;
  adjustStock: (sku: string, title: string, delta: number, reason: string, department: string) => void;
  auditLogs: AuditLogItem[];
  addAuditLog: (item: Omit<AuditLogItem, 'id' | 'timestamp' | 'timeAgo'>) => void;
  toast: ToastState;
  showToastNotification: (title: string, message: string, price?: string) => void;
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  navigateToPDP: (productId: string) => void;
  navigateToDept: (deptId: DepartmentId) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [currentRole, setCurrentRole] = useState<UserRole>('shopper');
  const [currentUser, setCurrentUser] = useState<DemoAccount | null>(null);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState<DepartmentId>('electronics');
  const [selectedProductId, setSelectedProductId] = useState<string>('prod-aura-anc');
  const [selectedOrderId, setSelectedOrderId] = useState<string>('BM-99214-FASH-ELEC-HOME');
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [theme, setThemeState] = useState<'dark' | 'light'>('light');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);

  // Initial products inventory state
  const [inventory, setInventory] = useState<Record<string, { stock: number; buffer: number; status: 'optimal' | 'low_warning' | 'critical' }>>(() => {
    const map: Record<string, { stock: number; buffer: number; status: 'optimal' | 'low_warning' | 'critical' }> = {};
    PRODUCTS.forEach((p) => {
      map[p.sku] = {
        stock: p.stockCount,
        buffer: p.safetyBuffer,
        status: p.stockStatus,
      };
    });
    return map;
  });

  const [catalogStatus, setCatalogStatus] = useState<Record<string, 'live' | 'paused'>>(() =>
    Object.fromEntries(PRODUCTS.map((product) => [product.id, 'live']))
  );

  // Initial staff
  const [staffList, setStaffList] = useState<StaffMember[]>(STAFF_MEMBERS);

  // Initial Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);

  // Initial Wishlist
  const [wishlist, setWishlist] = useState<string[]>(['prod-aura-anc', 'prod-night-serum', 'prod-wool-coat', 'prod-dutch-oven']);

  // Initial multi-department demo cart.
  const [cart, setCart] = useState<CartItem[]>(() => {
    const p1 = PRODUCTS.find((p) => p.id === 'prod-aura-anc')!;
    const p2 = PRODUCTS.find((p) => p.id === 'prod-night-serum')!;
    const p3 = PRODUCTS.find((p) => p.id === 'prod-olive-oil')!;

    return [
      {
        cartItemId: 'item-electronics-1',
        product: p1,
        quantity: 1,
        selectedColor: 'Matte Obsidian',
        selectedCushion: 'Memory Foam Vegan Protein Leather',
        selectedArchFit: 'Standard Fit',
        unitPrice: 249.0,
      },
      {
        cartItemId: 'item-beauty-2',
        product: p2,
        quantity: 1,
        selectedColor: 'Standard Pipette',
        unitPrice: 88.0,
      },
      {
        cartItemId: 'item-grocery-3',
        product: p3,
        quantity: 2,
        selectedColor: 'Single Estate 2024',
        unitPrice: 34.0,
      },
    ];
  });

  const [couponCode, setCouponCode] = useState<string>('ONECART');

  // Toast
  const [toast, setToast] = useState<ToastState>({
    show: false,
    title: '',
    message: '',
    price: '',
  });

  const showToastNotification = (title: string, message: string, price?: string) => {
    setToast({
      show: true,
      title,
      message,
      price,
    });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3200);
  };

  const loginWithDemo = (email: string, password: string) => {
    const account = getDemoAccount(email, password);
    if (!account) {
      return { success: false, message: 'That demo login ID and password do not match.' };
    }

    setCurrentUser(account);
    setCurrentRole(account.role);
    setLoginModalOpen(false);
    setActiveView(account.role === 'shopper' ? 'home' : account.role === 'dept_manager' ? 'dept_manager' : 'store_admin');
    showToastNotification('Demo Access Granted', `${account.name} signed in as ${account.roleLabel}.`);
    return { success: true, message: 'Signed in.' };
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentRole('shopper');
    setActiveView('home');
    showToastNotification('Signed Out', 'You are browsing the BLOWMAGGY storefront as a guest.');
  };

  // Pre-seed an order matching the timeline in Image 10
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'BLW-8942-UF',
      consignmentId: 'BM-99214-FASH-ELEC-HOME',
      items: [
        {
          cartItemId: 'order-item-1',
          product: PRODUCTS.find((p) => p.id === 'prod-aura-anc')!,
          quantity: 1,
          selectedColor: 'Matte Obsidian',
          unitPrice: 249.0,
        },
        {
          cartItemId: 'order-item-2',
          product: PRODUCTS.find((p) => p.id === 'prod-night-serum')!,
          quantity: 1,
          selectedColor: 'Standard Pipette',
          unitPrice: 88.0,
        },
        {
          cartItemId: 'order-item-3',
          product: PRODUCTS.find((p) => p.id === 'prod-olive-oil')!,
          quantity: 2,
          selectedColor: 'Single Estate 2024',
          unitPrice: 34.0,
        },
      ],
      subtotal: 405.0,
      discount: 40.5,
      couponCode: 'ONECART',
      shipping: 0,
      tax: 29.16,
      total: 393.66,
      createdAt: '2026-10-23T08:14:00Z',
      status: 'out_for_delivery',
      eta: 'Today, 4:30 PM in 1 consolidated shipment',
      shippingAddress: {
        fullName: 'Elena Vance',
        street: '742 Evergreen Promenade, Suite 400',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94107',
        country: 'United States',
      },
      paymentMethod: 'card',
      paymentReference: 'TXN-99420-CARD-AUTH',
      departmentCount: 3,
    },
  ]);

  // Selected product object
  const selectedProduct = useMemo(() => {
    return products.find((p) => p.id === selectedProductId) || products[0];
  }, [selectedProductId, products]);

  // Calculations
  const { cartSubtotal, cartTotalQuantity, departmentMix } = useMemo(() => {
    let subtotal = 0;
    let qty = 0;
    const mix: Record<DepartmentId, number> = {
      fashion: 0,
      beauty: 0,
      electronics: 0,
      home: 0,
      grocery: 0,
      kids: 0,
    };

    cart.forEach((item) => {
      const lineTotal = item.unitPrice * item.quantity;
      subtotal += lineTotal;
      qty += item.quantity;
      if (mix[item.product.department] !== undefined) {
        mix[item.product.department] += lineTotal;
      }
    });

    return {
      cartSubtotal: subtotal,
      cartTotalQuantity: qty,
      departmentMix: mix,
    };
  }, [cart]);

  const couponDiscountAmount = useMemo(() => {
    const coupon = coupons.find((item) => item.code === couponCode && item.isActive);
    return coupon && cartSubtotal >= coupon.minimumSubtotal
      ? Math.round(cartSubtotal * (coupon.discountPercent / 100) * 100) / 100
      : 0;
  }, [couponCode, cartSubtotal, coupons]);

  const cartShipping = useMemo(() => {
    if (cartSubtotal >= 75 || cart.length === 0) return 0;
    return 15.0;
  }, [cartSubtotal, cart.length]);

  const cartTax = useMemo(() => {
    const taxable = Math.max(0, cartSubtotal - couponDiscountAmount);
    return Math.round(taxable * 0.08 * 100) / 100;
  }, [cartSubtotal, couponDiscountAmount]);

  const cartTotal = useMemo(() => {
    if (cart.length === 0) return 0;
    const taxable = Math.max(0, cartSubtotal - couponDiscountAmount);
    return Math.round((taxable + cartTax + cartShipping) * 100) / 100;
  }, [cartSubtotal, couponDiscountAmount, cartTax, cartShipping, cart.length]);

  // Keyboard shortcut for Command Palette (⌘K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const addToCart = (
    product: Product,
    quantity = 1,
    variants?: { color?: string; cushion?: string; archFit?: string; size?: string; priceAdd?: number }
  ) => {
    if (catalogStatus[product.id] === 'paused') {
      showToastNotification('Product Paused', `${product.name} is temporarily unavailable while the catalog is updated.`);
      return;
    }
    const price = product.price + (variants?.priceAdd || 0);
    const cartItemId = `item-${product.id}-${Date.now()}`;

    setCart((prev) => {
      // Check if identical variant already exists
      const existingIdx = prev.findIndex(
        (i) =>
          i.product.id === product.id &&
          i.selectedColor === variants?.color &&
          i.selectedCushion === variants?.cushion &&
          i.selectedArchFit === variants?.archFit &&
          i.selectedSize === variants?.size
      );

      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx].quantity += quantity;
        return next;
      }

      return [
        ...prev,
        {
          cartItemId,
          product,
          quantity,
          selectedColor: variants?.color,
          selectedCushion: variants?.cushion,
          selectedArchFit: variants?.archFit,
          selectedSize: variants?.size,
          unitPrice: price,
        },
      ];
    });

    showToastNotification(
      'Added to Universal Cart',
      `${quantity}x ${product.name} pooled into single box`,
      `+${formatInr(price * quantity)}`
    );
  };

  const updateCartQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
    showToastNotification('Removed from Cart', 'Item removed from shipment manifest');
  };

  const clearCart = () => {
    setCart([]);
    showToastNotification('Cart Emptied', 'All items cleared from universal box');
  };

  const addProduct = (product: Product) => {
    if (products.some((item) => item.sku === product.sku)) {
      showToastNotification('Duplicate SKU', 'Choose a unique SKU before adding this product.');
      return;
    }
    setProducts((previous) => [product, ...previous]);
    setCatalogStatus((previous) => ({ ...previous, [product.id]: 'live' }));
    setInventory((previous) => ({ ...previous, [product.sku]: { stock: product.stockCount, buffer: product.safetyBuffer, status: product.stockStatus } }));
    addAuditLog({ type: 'config_update', title: `${product.name} added to the catalog`, description: `New ${product.department} SKU ${product.sku} is now live in the demo catalog.`, badgeText: product.sku, badgeType: 'success', actor: currentUser?.name || 'Store Admin' });
    showToastNotification('Product Added', `${product.name} is live in the catalogue.`);
  };

  const updateProduct = (product: Product) => {
    setProducts((previous) => previous.map((item) => (item.id === product.id ? product : item)));
    setCart((previous) => previous.map((item) => (item.product.id === product.id ? { ...item, product } : item)));
    addAuditLog({ type: 'config_update', title: `${product.name} catalog details updated`, description: `Store Admin changed the shopper-facing product information for ${product.sku}.`, badgeText: product.sku, badgeType: 'success', actor: currentUser?.name || 'Store Admin' });
    showToastNotification('Product Updated', `${product.name} changes are now visible.`);
  };

  const deleteProduct = (productId: string) => {
    const product = products.find((item) => item.id === productId);
    if (!product) return;
    setProducts((previous) => previous.filter((item) => item.id !== productId));
    setCart((previous) => previous.filter((item) => item.product.id !== productId));
    setWishlist((previous) => previous.filter((id) => id !== productId));
    setCatalogStatus((previous) => {
      const { [productId]: _removed, ...remaining } = previous;
      return remaining;
    });
    addAuditLog({ type: 'config_update', title: `${product.name} removed from catalog`, description: `SKU ${product.sku} was removed from active catalogue and shopper cart lines.`, badgeText: product.sku, badgeType: 'danger', actor: currentUser?.name || 'Store Admin' });
    showToastNotification('Product Deleted', `${product.name} was removed from the catalogue.`);
  };

  const applyCoupon = (code: string) => {
    const coupon = coupons.find((item) => item.code === code.trim().toUpperCase() && item.isActive);
    if (coupon && cartSubtotal >= coupon.minimumSubtotal) {
      setCouponCode(coupon.code);
      showToastNotification('Coupon Applied', `${coupon.code} activated: ${coupon.discountPercent}% off this edit.`);
      return true;
    }
    const existingCoupon = coupons.find((item) => item.code === code.trim().toUpperCase());
    showToastNotification(existingCoupon ? 'Cart Minimum Not Met' : 'Invalid Coupon', existingCoupon ? `Add at least ${formatInr(existingCoupon.minimumSubtotal)} to use ${existingCoupon.code}.` : 'Code not recognized or currently inactive.');
    return false;
  };

  const removeCoupon = () => {
    setCouponCode('');
  };

  const addCoupon = (coupon: Coupon) => {
    const normalized = { ...coupon, code: coupon.code.trim().toUpperCase() };
    if (!normalized.code || coupons.some((item) => item.code === normalized.code)) {
      showToastNotification('Coupon Not Added', 'Coupon codes must be unique.');
      return;
    }
    setCoupons((previous) => [normalized, ...previous]);
    addAuditLog({ type: 'config_update', title: `Coupon ${normalized.code} created`, description: `${normalized.discountPercent}% promotion created with ${formatInr(normalized.minimumSubtotal)} cart minimum.`, badgeText: normalized.code, badgeType: 'success', actor: currentUser?.name || 'Store Admin' });
    showToastNotification('Coupon Created', `${normalized.code} is ready for shoppers.`);
  };

  const toggleCoupon = (code: string) => {
    setCoupons((previous) => previous.map((item) => item.code === code ? { ...item, isActive: !item.isActive } : item));
    const coupon = coupons.find((item) => item.code === code);
    if (coupon) showToastNotification('Coupon Updated', `${coupon.code} is now ${coupon.isActive ? 'inactive' : 'active'}.`);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToastNotification('Removed from Wishlist', 'Item removed from saved list');
        return prev.filter((id) => id !== productId);
      }
      showToastNotification('Saved to Wishlist', 'Item saved to your executive curation list');
      return [...prev, productId];
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const addReview = (review: Omit<Review, 'id' | 'createdAt' | 'verifiedPurchase'>) => {
    setReviews((previous) => [{ ...review, id: `review-${Date.now()}`, createdAt: new Date().toISOString(), verifiedPurchase: false }, ...previous]);
    showToastNotification('Review Submitted', 'Thank you — your review is visible in this demo.');
  };

  const placeOrder = (
    shippingAddress: Order['shippingAddress'],
    paymentMethod: Order['paymentMethod']
  ) => {
    const orderNum = Math.floor(1000 + Math.random() * 9000);
    const newOrder: Order = {
      id: `BLW-${orderNum}-UF`,
      consignmentId: `BM-${orderNum}-CONSOLIDATED`,
      items: [...cart],
      subtotal: cartSubtotal,
      discount: couponDiscountAmount,
      couponCode,
      shipping: cartShipping,
      tax: cartTax,
      total: cartTotal,
      createdAt: new Date().toISOString(),
      status: 'placed',
      eta: 'Thursday, Oct 29 in 1 consolidated shipment',
      shippingAddress,
      paymentMethod,
      paymentReference: `TXN-${orderNum}-${paymentMethod.toUpperCase()}-VERIFIED`,
      departmentCount: Object.values(departmentMix).filter((val) => val > 0).length,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setSelectedOrderId(newOrder.consignmentId);
    setCart([]);
    showToastNotification('Order Confirmed!', `Manifest ${newOrder.consignmentId} cross-dock dispatched`, formatInr(newOrder.total));

    // Add to audit trail
    addAuditLog({
      type: 'approval',
      title: `Unified Order ${newOrder.id} dispatched to Pier B-4 consolidation bay`,
      description: `${newOrder.items.length} items from ${newOrder.departmentCount} departments merged into 1 parcel`,
      badgeText: newOrder.id,
      badgeType: 'success',
      actor: shippingAddress.fullName,
    });

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    const order = orders.find((item) => item.id === orderId);
    if (!order || order.status === status) return;

    setOrders((previous) => previous.map((item) => (item.id === orderId ? { ...item, status } : item)));
    addAuditLog({
      type: 'approval',
      title: `Order ${order.id} moved to ${status.replaceAll('_', ' ')}`,
      description: `Store-level fulfillment state was updated in the demo order workflow.`,
      badgeText: order.id,
      badgeType: 'success',
      actor: currentUser?.name || 'Store Admin',
    });
    showToastNotification('Order Status Updated', `${order.id} is now ${status.replaceAll('_', ' ')}.`);
  };

  const updateCatalogStatus = (productId: string, status: 'live' | 'paused') => {
    const product = products.find((item) => item.id === productId);
    if (!product || catalogStatus[productId] === status) return;

    setCatalogStatus((previous) => ({ ...previous, [productId]: status }));
    addAuditLog({
      type: 'config_update',
      title: `${product.name} catalog listing ${status}`,
      description: `Product visibility was ${status === 'live' ? 'restored to shopper browse and search' : 'paused from shopper browse and search'}.`,
      badgeText: product.sku,
      badgeType: status === 'live' ? 'success' : 'warning',
      actor: currentUser?.name || 'Store Admin',
    });
    showToastNotification('Catalog Updated', `${product.name} is now ${status}.`);
  };

  const assignManager = (name: string, email: string, assignedDeptIds: DepartmentId[]) => {
    const newStaff: StaffMember = {
      id: `staff-${Date.now()}`,
      name,
      role: 'Department Manager',
      systemRole: 'Department Manager',
      email,
      photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAdXN1P2ZSBxNq2Ore6bJ5niOayEuaMRgbQT0V43MxNbODyv6JNbG8De1AcnStEZuwobzxeN5BUBvzNB8elm5_K-OqyrqLRrwEpIikRG-yi53KNzK0cKISY8po4V2Xbj_Ka4B3Ep3NtzRpcDs_YSoommzXCZ8-FIgKQLVl3uB6G62r6f2xfhZiR20l6AP44arCZG5Sw7MeWpVVsUgvtFsrinfD6p_HwABr5pC9Lwj5WmtNJsa4h6KmVeg',
      assignedDeptIds,
      status: 'Active',
    };

    setStaffList((prev) => [newStaff, ...prev]);
    addAuditLog({
      type: 'approval',
      title: `Executive Sophia S. bound new Manager credential: ${name}`,
      description: `Scoped authorization granted for: ${assignedDeptIds.map((d) => DEPARTMENTS[d]?.title || d).join(', ')}`,
      badgeText: 'RBAC-ASSIGN',
      badgeType: 'success',
      actor: 'Sophia Sterling',
    });
    showToastNotification('Manager Scope Bound', `Granted ${assignedDeptIds.length} department authorizations to ${name}`);
  };

  const revokeStaff = (id: string) => {
    const member = staffList.find((s) => s.id === id);
    setStaffList((prev) => prev.filter((s) => s.id !== id));
    if (member) {
      addAuditLog({
        type: 'security_alert',
        title: `Manager credential revoked for ${member.name}`,
        description: `Active sessions terminated and department tokens invalidated.`,
        badgeText: 'CRED-REVOKED',
        badgeType: 'danger',
        actor: 'Sophia Sterling',
      });
      showToastNotification('Scope Revoked', `Terminated permissions for ${member.name}`);
    }
  };

  const adjustStock = (sku: string, title: string, delta: number, reason: string, department: string) => {
    setInventory((prev) => {
      const current = prev[sku] || { stock: 0, buffer: 20, status: 'optimal' };
      const newStock = Math.max(0, current.stock + delta);
      let status: 'optimal' | 'low_warning' | 'critical' = 'optimal';
      if (newStock < 5) status = 'critical';
      else if (newStock < current.buffer) status = 'low_warning';

      return {
        ...prev,
        [sku]: {
          ...current,
          stock: newStock,
          status,
        },
      };
    });

    addAuditLog({
      type: 'inventory_adjustment',
      title: `${currentUser?.name || 'Department Manager'} signed stock variance (${delta > 0 ? `+${delta}` : delta}) for ${title} [${sku}]`,
      description: `Audit reason: ${reason} • Demo permission boundary checked before mutation.`,
      badgeText: sku,
      badgeType: 'neutral',
      actor: currentUser?.name || 'Department Manager',
    });

    showToastNotification('Stock Mutation Signed', `${delta > 0 ? `+${delta}` : delta} units logged to distributed operations ledger`);
  };

  const addAuditLog = (item: Omit<AuditLogItem, 'id' | 'timestamp' | 'timeAgo'>) => {
    const newLog: AuditLogItem = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      timeAgo: 'Just now',
      ...item,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setThemeState(next);
    const root = document.documentElement;
    if (next === 'light') {
      root.classList.remove('dark');
      root.classList.add('theme-light');
    } else {
      root.classList.remove('theme-light');
      root.classList.add('dark');
    }
  };

  const setTheme = (t: 'dark' | 'light') => {
    setThemeState(t);
    const root = document.documentElement;
    if (t === 'light') {
      root.classList.remove('dark');
      root.classList.add('theme-light');
    } else {
      root.classList.remove('theme-light');
      root.classList.add('dark');
    }
  };

  const navigateToPDP = (productId: string) => {
    setSelectedProductId(productId);
    setActiveView('pdp');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToDept = (deptId: DepartmentId) => {
    setSelectedDeptId(deptId);
    setActiveView('department');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <StoreContext.Provider
      value={{
        activeView,
        setActiveView,
        currentRole,
        setCurrentRole,
        currentUser,
        isLoginModalOpen,
        setLoginModalOpen,
        loginWithDemo,
        logout,
        selectedDeptId,
        setSelectedDeptId,
        selectedProductId,
        setSelectedProductId,
        selectedProduct,
        selectedOrderId,
        setSelectedOrderId,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        searchQuery,
        setSearchQuery,
        couponCode,
        applyCoupon,
        removeCoupon,
        couponDiscountAmount,
        coupons,
        addCoupon,
        toggleCoupon,
        cartSubtotal,
        cartTax,
        cartShipping,
        cartTotal,
        cartTotalQuantity,
        departmentMix,
        wishlist,
        toggleWishlist,
        isInWishlist,
        orders,
        placeOrder,
        updateOrderStatus,
        catalogStatus,
        updateCatalogStatus,
        reviews,
        addReview,
        staffList,
        assignManager,
        revokeStaff,
        inventory,
        adjustStock,
        auditLogs,
        addAuditLog,
        toast,
        showToastNotification,
        isCommandPaletteOpen,
        setCommandPaletteOpen,
        theme,
        setTheme,
        toggleTheme,
        navigateToPDP,
        navigateToDept,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
