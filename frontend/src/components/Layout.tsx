import { Outlet } from 'react-router-dom';
import Header from './Header';
import CartSidebar from './CartSidebar';

export default function Layout() {
  return (
    <div className="min-h-screen" style={{ background: '#0C0D10' }}>
      <Header />
      <main style={{ paddingTop: '9rem' }}>
        <Outlet />
      </main>
      <CartSidebar />
    </div>
  );
}
