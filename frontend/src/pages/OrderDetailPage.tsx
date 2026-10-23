import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Package } from 'lucide-react';
import api from '../lib/api';

const fmt = (p: number) => '₹' + (p / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 });
const fmtDate = (d: string) => new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

const STATUS_STEPS = ['PLACED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
const STATUS_COLOR: Record<string, string> = {
  PLACED: '#00F0FF', PACKED: '#F59E0B', SHIPPED: '#8B5CF6',
  OUT_FOR_DELIVERY: '#FF3E83', DELIVERED: '#10B981', CANCELLED: '#ffb4ab',
};

export default function OrderDetailPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const { data, isLoading } = useQuery({
    queryKey: ['order', orderNumber],
    queryFn: () => api.get(`/orders/${orderNumber}`).then(r => r.data),
  });

  const order = data?.data;

  if (isLoading) return (
    <div className="px-4 md:px-6 lg:px-12 py-10 max-w-4xl mx-auto">
      <div className="animate-pulse space-y-4">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 rounded-xl" style={{ background: '#15171D' }} />)}
      </div>
    </div>
  );

  if (!order) return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <Package size={48} style={{ color: '#44474a' }} />
      <p style={{ color: '#8e929e' }}>Order not found</p>
    </div>
  );

  const currentStep = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="px-4 md:px-6 lg:px-12 py-10 max-w-4xl mx-auto" style={{ background: '#0C0D10', minHeight: '100vh' }}>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 style={{ fontFamily: "'Bodoni Moda',serif", fontSize: '28px', fontWeight: 600, color: '#e3e2e6' }}>
            Order {order.orderNumber}
          </h1>
          <p style={{ color: '#636466', fontFamily: "'Hanken Grotesk',sans-serif", fontSize: '13px', marginTop: '4px' }}>
            Placed on {fmtDate(order.createdAt)}
          </p>
        </div>
        <span className="px-3 py-1.5 rounded font-badge uppercase"
          style={{ background: `${STATUS_COLOR[order.status] ?? '#8e929e'}20`, color: STATUS_COLOR[order.status] ?? '#8e929e', border: `1px solid ${STATUS_COLOR[order.status] ?? '#8e929e'}40`, fontSize: '11px' }}>
          {order.status.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Progress tracker */}
      {!['CANCELLED', 'RETURNED'].includes(order.status) && (
        <div className="p-6 rounded-xl mb-6" style={{ background: '#15171D', border: '1px solid #232631' }}>
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-3 h-0.5" style={{ background: '#232631' }}>
              <div className="h-full transition-all" style={{ width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%`, background: '#10B981' }} />
            </div>
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex flex-col items-center gap-2 relative z-10">
                <div className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: i <= currentStep ? '#10B981' : '#232631', border: `2px solid ${i <= currentStep ? '#10B981' : '#44474a'}` }}>
                  {i <= currentStep && <div className="w-2 h-2 rounded-full" style={{ background: '#fff' }} />}
                </div>
                <p className="font-badge uppercase text-center" style={{ color: i <= currentStep ? '#10B981' : '#44474a', fontSize: '9px', maxWidth: '60px' }}>
                  {step.replace(/_/g, ' ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="p-6 rounded-xl mb-6" style={{ background: '#15171D', border: '1px solid #232631' }}>
        <h2 style={{ fontFamily: "'Bodoni Moda',serif", fontSize: '20px', color: '#e3e2e6', marginBottom: '16px' }}>Items</h2>
        <div className="space-y-4">
          {order.items?.map((item: any) => (
            <div key={item.id} className="flex gap-4 pb-4" style={{ borderBottom: '1px solid #232631' }}>
              <div className="w-16 h-16 rounded overflow-hidden shrink-0" style={{ background: '#1f1f23' }}>
                {item.product?.images?.[0] && <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1">
                <p style={{ fontFamily: "'Bodoni Moda',serif", fontSize: '15px', color: '#e3e2e6' }}>{item.product?.name}</p>
                <p style={{ color: '#636466', fontSize: '12px' }}>Qty: {item.qty}</p>
              </div>
              <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '15px', fontWeight: 700, color: '#fff' }}>
                {fmt(item.total)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="p-6 rounded-xl" style={{ background: '#15171D', border: '1px solid #232631' }}>
        <div className="space-y-3">
          <div className="flex justify-between" style={{ color: '#8e929e', fontSize: '14px' }}><span>Subtotal</span><span>{fmt(order.subtotal)}</span></div>
          {order.discount > 0 && <div className="flex justify-between" style={{ color: '#10B981', fontSize: '14px' }}><span>Discount</span><span>−{fmt(order.discount)}</span></div>}
          <div className="flex justify-between" style={{ color: '#8e929e', fontSize: '14px' }}><span>Delivery</span><span>{order.deliveryFee === 0 ? 'FREE' : fmt(order.deliveryFee)}</span></div>
          <div className="flex justify-between pt-3" style={{ borderTop: '1px solid #232631' }}>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '16px', fontWeight: 600, color: '#e3e2e6' }}>Total</span>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '22px', fontWeight: 700, color: '#fff' }}>{fmt(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
