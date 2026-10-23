import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

const fmt = (p: number) => '₹' + (p / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 });

const DEPT_COLORS: Record<string, string> = {
  fashion: '#E02B43', beauty: '#FF3E83', electronics: '#00F0FF',
  home: '#F59E0B', grocery: '#10B981', kids: '#8B5CF6',
};

export default function CartPage() {
  const { items, total, subtotal, discountTotal, deliveryFee, freeDeliveryGap, fetchCart, updateItem, removeItem } = useCartStore();

  useEffect(() => { fetchCart(); }, []);

  if (items.length === 0) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6" style={{ background: '#0C0D10' }}>
      <ShoppingBag size={64} style={{ color: '#44474a' }} />
      <h2 style={{ fontFamily: "'Bodoni Moda',serif", fontSize: '28px', color: '#e3e2e6' }}>Your bag is empty</h2>
      <Link to="/" className="px-6 py-3 rounded font-label"
        style={{ background: '#fff', color: '#0C0D10', fontFamily: "'Space Grotesk',sans-serif", fontSize: '14px', fontWeight: 600 }}>
        Continue Shopping
      </Link>
    </div>
  );

  return (
    <div className="px-4 md:px-6 lg:px-12 py-10 max-w-7xl mx-auto" style={{ background: '#0C0D10', minHeight: '100vh' }}>
      <h1 style={{ fontFamily: "'Bodoni Moda',serif", fontSize: '36px', fontWeight: 600, color: '#e3e2e6', marginBottom: '32px' }}>
        Your Bag <span style={{ color: '#636466', fontSize: '20px' }}>({items.reduce((s, i) => s + i.qty, 0)} items)</span>
      </h1>

      {freeDeliveryGap > 0 && (
        <div className="p-4 rounded-lg mb-6" style={{ background: '#1f1f23', border: '1px solid #10B981' }}>
          <p style={{ color: '#10B981', fontFamily: "'Space Grotesk',sans-serif", fontSize: '13px', fontWeight: 600 }}>
            Add {fmt(freeDeliveryGap)} more for FREE delivery!
          </p>
          <div className="mt-2 h-1 rounded-full" style={{ background: '#232631' }}>
            <div className="h-full rounded-full" style={{ width: `${Math.min(100, 100 - (freeDeliveryGap / 99900) * 100)}%`, background: '#10B981' }} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map(item => {
            const dept = item.product?.department?.toLowerCase() ?? 'fashion';
            const accent = DEPT_COLORS[dept] ?? '#E02B43';
            return (
              <div key={item.id} className="flex gap-4 p-4 rounded-lg" style={{ background: '#15171D', border: '1px solid #232631' }}>
                <div className="w-1 rounded-full shrink-0" style={{ background: accent }} />
                <div className="w-20 h-20 rounded overflow-hidden shrink-0" style={{ background: '#1f1f23' }}>
                  {item.product?.image && <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-badge uppercase" style={{ color: accent, fontSize: '9px' }}>{dept}</p>
                  <p style={{ fontFamily: "'Bodoni Moda',serif", fontSize: '16px', color: '#e3e2e6' }}>{item.product?.name}</p>
                  <p style={{ color: '#636466', fontSize: '12px' }}>
                    {Object.entries(item.variant?.options ?? {}).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center rounded overflow-hidden" style={{ border: '1px solid #232631' }}>
                      <button onClick={() => item.qty > 1 ? updateItem(item.id, item.qty - 1) : removeItem(item.id)}
                        className="w-8 h-8 flex items-center justify-center" style={{ background: '#1f1f23', color: '#c5c7c9' }}>−</button>
                      <span className="px-3" style={{ color: '#e3e2e6', fontFamily: "'Space Grotesk',sans-serif" }}>{item.qty}</span>
                      <button onClick={() => updateItem(item.id, item.qty + 1)}
                        className="w-8 h-8 flex items-center justify-center" style={{ background: '#1f1f23', color: '#c5c7c9' }}>+</button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '16px', fontWeight: 700, color: '#fff' }}>
                        {fmt((item.variant?.price ?? item.priceAtAdd) * item.qty)}
                      </span>
                      <button onClick={() => removeItem(item.id)} style={{ color: '#636466' }}><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="p-6 rounded-xl sticky top-36" style={{ background: '#15171D', border: '1px solid #232631' }}>
            <h2 style={{ fontFamily: "'Bodoni Moda',serif", fontSize: '22px', color: '#e3e2e6', marginBottom: '20px' }}>Order Summary</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between" style={{ color: '#8e929e', fontFamily: "'Hanken Grotesk',sans-serif", fontSize: '14px' }}>
                <span>Subtotal</span><span>{fmt(subtotal)}</span>
              </div>
              {discountTotal > 0 && (
                <div className="flex justify-between" style={{ color: '#10B981', fontFamily: "'Hanken Grotesk',sans-serif", fontSize: '14px' }}>
                  <span>Discount</span><span>−{fmt(discountTotal)}</span>
                </div>
              )}
              <div className="flex justify-between" style={{ color: '#8e929e', fontFamily: "'Hanken Grotesk',sans-serif", fontSize: '14px' }}>
                <span>Delivery</span>
                <span style={{ color: deliveryFee === 0 ? '#10B981' : '#8e929e' }}>{deliveryFee === 0 ? 'FREE' : fmt(deliveryFee)}</span>
              </div>
              <div className="flex justify-between pt-3" style={{ borderTop: '1px solid #232631' }}>
                <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '16px', fontWeight: 600, color: '#e3e2e6' }}>Total</span>
                <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '22px', fontWeight: 700, color: '#fff' }}>{fmt(total)}</span>
              </div>
            </div>
            <Link to="/checkout"
              className="w-full flex items-center justify-center gap-2 py-3 rounded font-label"
              style={{ background: '#fff', color: '#0C0D10', fontFamily: "'Space Grotesk',sans-serif", fontSize: '14px', fontWeight: 600, display: 'flex' }}>
              Proceed to Checkout <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
