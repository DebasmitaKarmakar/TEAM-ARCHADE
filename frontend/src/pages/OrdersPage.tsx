import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import api from '../lib/api';

const STATUS_COLOR: Record<string, string> = {
  PENDING_PAYMENT: '#8e929e', PLACED: '#00F0FF', PACKED: '#F59E0B',
  SHIPPED: '#8B5CF6', OUT_FOR_DELIVERY: '#FF3E83', DELIVERED: '#10B981',
  CANCELLED: '#ffb4ab', RETURNED: '#636466',
};

const fmt = (p: number) => '₹' + (p / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 });
const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export default function OrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => api.get('/orders').then(r => r.data),
  });

  const orders = data?.data?.data ?? [];

  return (
    <div className="px-4 md:px-6 lg:px-12 py-10 max-w-4xl mx-auto" style={{ background: '#0C0D10', minHeight: '100vh' }}>
      <h1 style={{ fontFamily: "'Bodoni Moda',serif", fontSize: '36px', fontWeight: 600, color: '#e3e2e6', marginBottom: '32px' }}>My Orders</h1>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: '#15171D' }} />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Package size={48} style={{ color: '#44474a' }} />
          <p style={{ color: '#8e929e', fontFamily: "'Hanken Grotesk',sans-serif" }}>No orders yet</p>
          <Link to="/" className="px-6 py-3 rounded font-label"
            style={{ background: '#fff', color: '#0C0D10', fontFamily: "'Space Grotesk',sans-serif", fontSize: '14px', fontWeight: 600 }}>
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <Link key={order.id} to={`/orders/${order.orderNumber}`}
              className="flex items-center justify-between p-5 rounded-xl transition-all"
              style={{ background: '#15171D', border: '1px solid #232631', display: 'flex' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#44474a')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#232631')}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#1f1f23' }}>
                  <Package size={18} style={{ color: '#8e929e' }} />
                </div>
                <div>
                  <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '14px', fontWeight: 600, color: '#e3e2e6' }}>{order.orderNumber}</p>
                  <p style={{ color: '#636466', fontSize: '12px', fontFamily: "'Hanken Grotesk',sans-serif" }}>
                    {fmtDate(order.createdAt)} · {order.items?.length ?? 0} items
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '16px', fontWeight: 700, color: '#fff' }}>{fmt(order.total)}</p>
                  <span className="font-badge uppercase" style={{ color: STATUS_COLOR[order.status] ?? '#8e929e', fontSize: '10px' }}>
                    {order.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <ChevronRight size={16} style={{ color: '#636466' }} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
