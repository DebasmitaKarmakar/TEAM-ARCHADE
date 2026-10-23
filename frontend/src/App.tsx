import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import DepartmentPage from './pages/DepartmentPage';
import ProductPage from './pages/ProductPage';
import SearchPage from './pages/SearchPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import DeptManagerPage from './pages/admin/DeptManagerPage';
import NotFoundPage from './pages/NotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="departments/:slug" element={<DepartmentPage />} />
            <Route path="products/:slug" element={<ProductPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/:orderNumber" element={<OrderDetailPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="admin/dept" element={<DeptManagerPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#292a2d',
              color: '#e3e2e6',
              border: '1px solid #44474a',
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '13px',
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
