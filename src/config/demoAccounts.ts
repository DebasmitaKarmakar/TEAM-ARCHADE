import { UserRole } from '../types/store';
import { DepartmentId } from '../types/store';

export interface DemoAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  roleLabel: string;
  departmentScope: string;
  initials: string;
  assignedDeptIds: DepartmentId[];
}

/**
 * Deliberately local-only credentials for the competition demo. These are not
 * production credentials and must be replaced by a server-side identity flow.
 */
export const DEMO_ACCOUNTS: readonly DemoAccount[] = [
  {
    id: 'demo-shopper',
    name: 'Elena Vance',
    email: 'shopper@blowmaggy.demo',
    password: 'shopper2026',
    role: 'shopper',
    roleLabel: 'Shopper',
    departmentScope: 'Storefront, unified cart, checkout & tracking',
    initials: 'EV',
    assignedDeptIds: [],
  },
  {
    id: 'demo-manager',
    name: 'Marcus Chen',
    email: 'manager@blowmaggy.demo',
    password: 'manager2026',
    role: 'dept_manager',
    roleLabel: 'Department Manager',
    departmentScope: 'Electronics & Beauty inventory only',
    initials: 'MC',
    assignedDeptIds: ['electronics', 'beauty'],
  },
  {
    id: 'demo-admin',
    name: 'Sophia Sterling',
    email: 'admin@blowmaggy.demo',
    password: 'admin2026',
    role: 'store_admin',
    roleLabel: 'Store Admin',
    departmentScope: 'All departments, catalog, stock & orders',
    initials: 'SS',
    assignedDeptIds: ['fashion', 'beauty', 'electronics', 'home', 'grocery', 'kids', 'pharmacy'],
  },
];

export const getDemoAccount = (email: string, password: string): DemoAccount | undefined =>
  DEMO_ACCOUNTS.find(
    (account) => account.email.toLowerCase() === email.trim().toLowerCase() && account.password === password
  );
