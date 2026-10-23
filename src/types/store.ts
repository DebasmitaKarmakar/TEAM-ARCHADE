export type DepartmentId =
  | 'fashion'
  | 'beauty'
  | 'electronics'
  | 'home'
  | 'grocery'
  | 'kids';

export type UserRole = 'shopper' | 'dept_manager' | 'store_admin';

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  priceDelta: number;
  stock: number;
  colorHex?: string;
  attributes: Record<string, string>;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  department: DepartmentId;
  deptLabel: string;
  deptNumber: string;
  category: string;
  price: number;
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  stockCount: number;
  safetyBuffer: number;
  stockStatus: 'optimal' | 'low_warning' | 'critical';
  description: string;
  extendedDescription?: string;
  badge?: string;
  tagline?: string;
  images: {
    front: string;
    oblique?: string;
    chamber?: string;
    case?: string;
    model?: string;
  };
  variants?: {
    colors?: { name: string; sku: string; hex: string; stockDesc: string }[];
    cushions?: { name: string; sku: string; priceAdd: number; desc: string }[];
    archFits?: { name: string; sku: string; desc: string }[];
    sizes?: string[];
  };
  specs?: { label: string; value: string; desc: string; icon: string }[];
  pairings?: {
    id: string;
    name: string;
    department: DepartmentId;
    deptLabel: string;
    price: number;
    image: string;
    desc: string;
  }[];
}

export interface Coupon {
  code: string;
  label: string;
  description: string;
  discountPercent: number;
  minimumSubtotal: number;
  isActive: boolean;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
  verifiedPurchase: boolean;
}

export interface CartItem {
  cartItemId: string;
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedCushion?: string;
  selectedArchFit?: string;
  selectedSize?: string;
  unitPrice: number;
}

export interface DepartmentInfo {
  id: DepartmentId;
  deptNumber: string;
  title: string;
  subtitle: string;
  skuCount: string;
  manager: string;
  managerEmail: string;
  managerPhoto: string;
  colorAccent: string;
  colorAccent2: string;
  revenue: number;
  revenueShare: string;
  stockHealth: number;
  image: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  systemRole: 'Store Admin' | 'Department Manager' | 'Shopper';
  email: string;
  photo: string;
  assignedDeptIds: DepartmentId[];
  status: 'Active' | 'Customer Account' | 'Suspended';
  isCurrentUser?: boolean;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  timeAgo: string;
  type: 'approval' | 'security_alert' | 'config_update' | 'inventory_adjustment';
  title: string;
  description: string;
  badgeText: string;
  badgeType: 'neutral' | 'danger' | 'success' | 'warning';
  actor: string;
  ipAddress?: string;
}

export interface Order {
  id: string;
  consignmentId: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  shipping: number;
  tax: number;
  total: number;
  createdAt: string;
  status: 'placed' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered';
  eta: string;
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: 'card' | 'upi' | 'apple_pay' | 'klarna';
  paymentReference: string;
  departmentCount: number;
}
