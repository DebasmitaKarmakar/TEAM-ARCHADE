/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { lazy, Suspense, useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CommandPalette } from './components/CommandPalette';
import { Toast } from './components/Toast';
import { LoginModal } from './components/auth/LoginModal';
import { RoleGate } from './components/auth/RoleGate';
import { BlowmaggyIntro } from './components/intro/BlowmaggyIntro';

const StorefrontHome = lazy(() => import('./features/storefront/StorefrontHome').then((module) => ({ default: module.StorefrontHome })));
const ProductDetailPage = lazy(() => import('./features/catalog/ProductDetailPage').then((module) => ({ default: module.ProductDetailPage })));
const DepartmentView = lazy(() => import('./features/catalog/DepartmentView').then((module) => ({ default: module.DepartmentView })));
const CartView = lazy(() => import('./features/cart/CartView').then((module) => ({ default: module.CartView })));
const CheckoutView = lazy(() => import('./features/checkout/CheckoutView').then((module) => ({ default: module.CheckoutView })));
const OrderTrackingView = lazy(() => import('./features/orders/OrderTrackingView').then((module) => ({ default: module.OrderTrackingView })));
const WishlistView = lazy(() => import('./features/wishlist/WishlistView').then((module) => ({ default: module.WishlistView })));
const StoreAdminConsole = lazy(() => import('./features/operations/StoreAdminConsole').then((module) => ({ default: module.StoreAdminConsole })));
const DepartmentManagerView = lazy(() => import('./features/operations/DepartmentManagerView').then((module) => ({ default: module.DepartmentManagerView })));
const ThemeVerificationLab = lazy(() => import('./features/theme/ThemeVerificationLab').then((module) => ({ default: module.ThemeVerificationLab })));
const EverythingIssueMagazine = lazy(() => import('./features/editorial/EverythingIssueMagazine').then((module) => ({ default: module.EverythingIssueMagazine })));
const SearchResultsView = lazy(() => import('./features/catalog/SearchResultsView').then((module) => ({ default: module.SearchResultsView })));
const OrderHistoryView = lazy(() => import('./features/orders/OrderHistoryView').then((module) => ({ default: module.OrderHistoryView })));

const MainContent: React.FC = () => {
  const { activeView } = useStore();

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeView]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0E0E10] text-[#E8E8E8]">
      <Header />
      {/* Header contains campaign, primary controls and horizontal department nav. */}
      <main className="flex-1 pt-[146px] sm:pt-[150px]">
        <Suspense fallback={<div className="min-h-[45vh] grid place-items-center text-xs uppercase tracking-[0.2em] text-[#999]">Loading BLOWMAGGY</div>}>
        {activeView === 'home' && <StorefrontHome />}
        {activeView === 'pdp' && <ProductDetailPage />}
        {activeView === 'department' && <DepartmentView />}
        {activeView === 'cart' && <CartView />}
        {activeView === 'checkout' && <CheckoutView />}
        {activeView === 'order-tracking' && <OrderTrackingView />}
        {activeView === 'wishlist' && <WishlistView />}
        {activeView === 'search' && <SearchResultsView />}
        {activeView === 'order-history' && <OrderHistoryView />}
        {(activeView === 'store-admin' || activeView === 'store_admin') && (
          <RoleGate allow={['store_admin']}><StoreAdminConsole /></RoleGate>
        )}
        {(activeView === 'dept-manager' || activeView === 'dept_manager') && (
          <RoleGate allow={['dept_manager', 'store_admin']}><DepartmentManagerView /></RoleGate>
        )}
        {activeView === 'theme-lab' && <ThemeVerificationLab />}
        {activeView === 'magazine' && <EverythingIssueMagazine />}
        </Suspense>
      </main>
      <Footer />
      <CommandPalette />
      <Toast />
      <LoginModal />
      <BlowmaggyIntro />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainContent />
    </StoreProvider>
  );
}
