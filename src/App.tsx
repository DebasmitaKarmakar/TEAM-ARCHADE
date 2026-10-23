/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CommandPalette } from './components/CommandPalette';
import { Toast } from './components/Toast';

import { StorefrontHome } from './views/StorefrontHome';
import { ProductDetailPage } from './views/ProductDetailPage';
import { DepartmentView } from './views/DepartmentView';
import { CartView } from './views/CartView';
import { CheckoutView } from './views/CheckoutView';
import { OrderTrackingView } from './views/OrderTrackingView';
import { WishlistView } from './views/WishlistView';
import { StoreAdminConsole } from './views/StoreAdminConsole';
import { DepartmentManagerView } from './views/DepartmentManagerView';
import { ThemeVerificationLab } from './views/ThemeVerificationLab';
import { EverythingIssueMagazine } from './views/EverythingIssueMagazine';

const MainContent: React.FC = () => {
  const { activeView } = useStore();

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeView]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0E0E10] text-[#E8E8E8]">
      <Header />
      <main className="flex-1 pt-[104px] sm:pt-[110px]">
        {activeView === 'home' && <StorefrontHome />}
        {activeView === 'pdp' && <ProductDetailPage />}
        {activeView === 'department' && <DepartmentView />}
        {activeView === 'cart' && <CartView />}
        {activeView === 'checkout' && <CheckoutView />}
        {activeView === 'order-tracking' && <OrderTrackingView />}
        {activeView === 'wishlist' && <WishlistView />}
        {(activeView === 'store-admin' || activeView === 'store_admin') && <StoreAdminConsole />}
        {(activeView === 'dept-manager' || activeView === 'dept_manager') && <DepartmentManagerView />}
        {activeView === 'theme-lab' && <ThemeVerificationLab />}
        {activeView === 'magazine' && <EverythingIssueMagazine />}
      </main>
      <Footer />
      <CommandPalette />
      <Toast />
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
