import { X, Trash2, ShoppingBag, Tag, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';

const DEPT_COLORS: Record<string, string> = {
  fashion: '#E02B43', beauty: '#FF3E83', electronics: '#00F0FF',
  home: '#F59E0B', grocery: '#10B981', kids: '#8B5CF6',
};

const fmt = (p: number) => '₹' + (p / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 });

export default function CartSidebar() {
  const { isOpen, closeCart, items, total, deliveryFee, discountTotal, couponCode,
          couponError, freeDeliveryGap, removeItem, updateItem, applyCoupon, removeCoupon } = useCartStore();
  const [couponInput, setCouponInput] = useState('');

  const handleCoupon = async () => {
    if (couponInput.trim()) {
      await applyCoupon(couponInput.trim().toUpperCase());
      setCouponInput('');
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 transition-opacity"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={closeCart}
        />
      )}

      {/* Slide-over panel */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col transition-transform duration-300"
        style={{
          width: 'min(480px, 100vw)',
          background: '#15171D',
          borderLeft: '1px solid #232631',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #232631' }}>
          <div className="flex items-center gap-3">
            <ShoppingBag size={20} style={{ color: '#e3e2e6' }} />
            <span className="font-title" style={{ fontFamily: "'Bodoni Moda', serif", fontSize: '18px', color: '#e3e2e6' }}>
              Your Bag
            </span>
            <span
              className="px-2 py-0.5 rounded-full font-badge text-xs"
              style={{ background: '#ba012d', color: '#fff' }}
            >
              {items.reduce((s, i) => s + i.qty, 0)}
            </span>
          </div>
          <button onClick={closeCart} className="p-1 transition-colors" style={{ color: '#8f9194' }}>
            <X size={20} />
          </button>
        </div>

        {/* Free delivery gap bar */}
        {freeDeliveryGap > 0 && (
          <div className="px-6 py-3" style={{ background: '#1f1f23', borderBottom: '1px solid #232631' }}>
            <p className="font-badge uppercase tracking-wider" style={{ color: '#c5c7c9', fontSize: '10px' }}>
              Add {fmt(freeDeliveryGap)} more for free delivery
            </p>
            <div className="mt-2 h-1 rounded-full" style={{ background: '#232631' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, 100 - (freeDeliveryGap / 99900) * 100)}%`,
                  background: '#10B981',
                }}
              />
            </div>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-4">
              <ShoppingBag size={48} style={{ color: '#44474a' }} />
              <p style={{ color: '#8f9194', fontFamily: "'Hanken Grotesk', sans-serif" }}>Your bag is empty</p>
              <button
                onClick={closeCart}
                className="px-6 py-2 rounded font-label"
                style={{ background: '#ffffff', color: '#0C0D10', fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', fontWeight: 600 }}
              >
                Start Shopping
              </button>
            </div>
          ) : (
            items.map((item) => {
              const dept = item.product?.department?.toLowerCase() ?? 'fashion';
              const accentColor = DEPT_COLORS[dept] ?? '#E02B43';
              const opts = Object.entries(item.variant?.options ?? {}).map(([k, v]) => `${k}: ${v}`).join(' · ');

              return (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 rounded-lg"
                  style={{ background: '#1f1f23', border: '1px solid #232631' }}
                >
                  {/* Dept color bar */}
                  <div className="w-0.5 rounded-full shrink-0" style={{ background: accentColor }} />

                  {/* Product image placeholder */}
                  <div className="w-16 h-16 rounded shrink-0 overflow-hidden" style={{ background: '#292a2d' }}>
                    {item.product?.image && (
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="font-badge uppercase tracking-wider" style={{ color: accentColor, fontSize: '9px' }}>
                      {dept}
                    </p>
                    <p className="font-title truncate" style={{ fontFamily: "'Bodoni Moda', serif", fontSize: '14px', color: '#e3e2e6' }}>
                      {item.product?.name}
                    </p>
                    {opts && (
                      <p className="font-body-sm truncate" style={{ color: '#8f9194', fontSize: '12px' }}>{opts}</p>
                    )}
                    {item.warnings?.map((w) => (
                      <p key={w} className="font-badge text-xs" style={{ color: '#ffb4ab' }}>{w}</p>
                    ))}

                    <div className="flex items-center justify-between mt-2">
                      {/* Qty controls */}
                      <div className="flex items-center gap-2" style={{ border: '1px solid #232631', borderRadius: '4px', overflow: 'hidden' }}>
                        <button
                          className="w-7 h-7 flex items-center justify-center transition-colors"
                          style={{ color: '#c5c7c9', background: '#292a2d' }}
                          onClick={() => item.qty > 1 ? updateItem(item.id, item.qty - 1) : removeItem(item.id)}
                        >−</button>
                        <span className="px-2 font-label-sm text-xs" style={{ color: '#e3e2e6', minWidth: '16px', textAlign: 'center' }}>{item.qty}</span>
                        <button
                          className="w-7 h-7 flex items-center justify-center transition-colors"
                          style={{ color: '#c5c7c9', background: '#292a2d' }}
                          onClick={() => updateItem(item.id, item.qty + 1)}
                        >+</button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-price" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px', fontWeight: 700, color: '#e3e2e6' }}>
                          {fmt((item.variant?.price ?? item.priceAtAdd) * item.qty)}
                        </span>
                        <button onClick={() => removeItem(item.id)} style={{ color: '#8f9194' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Coupon */}
        {items.length > 0 && (
          <div className="px-6 py-3" style={{ borderTop: '1px solid #232631' }}>
            {couponCode ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag size={14} style={{ color: '#10B981' }} />
                  <span className="font-badge uppercase" style={{ color: '#10B981', fontSize: '11px' }}>{couponCode} applied</span>
                </div>
                <button onClick={removeCoupon} style={{ color: '#ffb4ab' }}><X size={14} /></button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Coupon code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 rounded text-sm outline-none font-label-sm"
                  style={{ background: '#1f1f23', border: '1px solid #232631', color: '#e3e2e6', fontFamily: "'Space Grotesk', sans-serif", fontSize: '12px' }}
                  onKeyDown={(e) => e.key === 'Enter' && handleCoupon()}
                />
                <button
                  onClick={handleCoupon}
                  className="px-4 py-2 rounded font-label-sm"
                  style={{ background: '#232631', color: '#c5c7c9', fontSize: '12px', fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Apply
                </button>
              </div>
            )}
            {couponError && <p className="mt-1 font-body-sm" style={{ color: '#ffb4ab', fontSize: '12px' }}>{couponError}</p>}
          </div>
        )}

        {/* Footer summary */}
        {items.length > 0 && (
          <div className="px-6 py-4" style={{ borderTop: '1px solid #232631', background: '#1A1D24' }}>
            <div className="space-y-2 mb-4">
              {discountTotal > 0 && (
                <div className="flex justify-between font-body-sm" style={{ color: '#10B981' }}>
                  <span>Savings</span><span>−{fmt(discountTotal)}</span>
                </div>
              )}
              <div className="flex justify-between font-body-sm" style={{ color: '#8f9194' }}>
                <span>Delivery</span>
                <span>{deliveryFee === 0 ? <span style={{ color: '#10B981' }}>FREE</span> : fmt(deliveryFee)}</span>
              </div>
              <div className="flex justify-between" style={{ borderTop: '1px solid #232631', paddingTop: '8px' }}>
                <span className="font-label" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px', color: '#e3e2e6' }}>Total</span>
                <span className="font-price" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '18px', fontWeight: 700, color: '#fff' }}>{fmt(total)}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              onClick={closeCart}
              className="w-full flex items-center justify-center gap-2 py-3 rounded font-label transition-all"
              style={{ background: '#ffffff', color: '#0C0D10', fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px', fontWeight: 600 }}
            >
              Proceed to Checkout <ChevronRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
