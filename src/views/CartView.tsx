import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { DEPARTMENTS } from '../data/mockData';
import { Trash2, Plus, Minus, ShieldCheck, ArrowRight, Package, Tag, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { DepartmentId } from '../types/store';

export const CartView: React.FC = () => {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    couponCode,
    applyCoupon,
    removeCoupon,
    couponDiscountAmount,
    cartSubtotal,
    cartTax,
    cartShipping,
    cartTotal,
    cartTotalQuantity,
    departmentMix,
    setActiveView,
    navigateToPDP,
  } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState(couponCode ? 'Coupon applied' : '');

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    if (!couponInput.trim()) return;

    const ok = applyCoupon(couponInput.trim());
    if (ok) {
      setCouponSuccess('Promo code ONECART (-10%) applied successfully!');
      setCouponInput('');
    } else {
      setCouponError('Invalid promo code. Try "ONECART" for 10% off.');
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponSuccess('');
    setCouponError('');
  };

  const distinctDeptsInCart = (Object.keys(departmentMix) as DepartmentId[]).filter(
    (deptId) => (departmentMix[deptId] || 0) > 0
  );

  return (
    <div className="min-h-screen bg-[#0E0E10] text-[#E8E8E8] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-[#8E8D94] uppercase tracking-wider mb-6">
          <button
            onClick={() => setActiveView('home')}
            className="hover:text-[#FAF9F5] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping
          </button>
          <span>/</span>
          <span className="text-[#C9A84C]">Unified Cart Manifest</span>
        </div>

        {/* Hero Title & Department Mix Badge */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#2D2D35] pb-6 mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[#C9A84C] mb-1">
              <span>MANIFEST #BM-CRT-2026</span>
              <span>•</span>
              <span className="text-[#22C55E] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"></span>
                Single Box Multi-Dept Routing
              </span>
            </div>
            <h1 className="font-display-hero text-3xl sm:text-4xl text-[#FAF9F5] tracking-tight">
              Unified Shopping Bag
            </h1>
            <p className="text-sm font-sans text-[#8E8D94] mt-1">
              Every department. One cart. One consolidated shipment from our central fulfilment hub.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#1A1A1E] px-4 py-2.5 border border-[#2D2D35]">
            <Package className="w-4 h-4 text-[#C9A84C]" />
            <div className="text-xs">
              <span className="text-[#8E8D94] block font-mono text-[10px] uppercase">Departments Represented</span>
              <span className="font-mono text-[#FAF9F5] font-medium">
                {distinctDeptsInCart.length} Departments ({cartTotalQuantity} Units)
              </span>
            </div>
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[#2D2D35] bg-[#141417]">
            <Package className="w-12 h-12 text-[#8E8D94] mx-auto mb-4 opacity-50" />
            <h3 className="font-display-hero text-2xl text-[#FAF9F5] mb-2">Your Unified Cart Is Empty</h3>
            <p className="text-sm text-[#8E8D94] max-w-md mx-auto mb-6 font-sans">
              Discover curated luxury across Fashion, Beauty, Electronics, Home & Living, Grocery, and Kids.
            </p>
            <button
              onClick={() => setActiveView('home')}
              className="bg-[#C9A84C] text-[#0E0E10] px-6 py-3 font-mono text-xs uppercase tracking-widest font-semibold hover:bg-[#d6b75e] transition-colors cursor-pointer"
            >
              Explore Flagship Departments
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left 8 Columns: Manifest & Items */}
            <div className="lg:col-span-8 space-y-6">
              {/* Department Proportional Breakdown Bar (As seen in Image 4) */}
              <div className="bg-[#1A1A1E] p-5 border border-[#2D2D35]">
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-[#8E8D94] uppercase tracking-wider">Department Proportional Mix</span>
                  <span className="text-[#FAF9F5] font-semibold">{cartTotalQuantity} Items Total</span>
                </div>

                {/* Multi-segment visual bar */}
                <div className="h-3 w-full bg-[#141417] rounded-none flex overflow-hidden border border-[#2D2D35]/50">
                  {distinctDeptsInCart.map((deptId) => {
                    const count = departmentMix[deptId] || 0;
                    const pct = cartTotalQuantity > 0 ? (count / cartTotalQuantity) * 100 : 0;
                    const deptInfo = DEPARTMENTS[deptId];
                    return (
                      <div
                        key={deptId}
                        style={{
                          width: `${pct}%`,
                          backgroundColor: deptInfo?.colorAccent || '#C9A84C',
                        }}
                        className="h-full transition-all duration-300 relative group cursor-pointer"
                        title={`${deptInfo?.title || deptId}: ${count} item(s) (${pct.toFixed(0)}%)`}
                      />
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-4 mt-3 text-xs font-mono">
                  {distinctDeptsInCart.map((deptId) => {
                    const count = departmentMix[deptId] || 0;
                    const pct = cartTotalQuantity > 0 ? Math.round((count / cartTotalQuantity) * 100) : 0;
                    const deptInfo = DEPARTMENTS[deptId];
                    return (
                      <div key={deptId} className="flex items-center gap-1.5 text-[11px]">
                        <span
                          className="w-2.5 h-2.5 inline-block"
                          style={{ backgroundColor: deptInfo?.colorAccent || '#C9A84C' }}
                        />
                        <span className="text-[#FAF9F5] font-medium">{deptInfo?.title || deptId}</span>
                        <span className="text-[#8E8D94]">({pct}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Items Table List */}
              <div className="bg-[#1A1A1E] border border-[#2D2D35] divide-y divide-[#2D2D35]">
                <div className="px-6 py-3.5 bg-[#141417] flex items-center justify-between text-xs font-mono text-[#8E8D94] uppercase tracking-wider">
                  <span>Product Manifest Item</span>
                  <span className="hidden sm:inline">Department & Specs</span>
                  <span>Quantity & Price</span>
                </div>

                {cart.map((item) => {
                  const dept = DEPARTMENTS[item.product.department];
                  return (
                    <div
                      key={item.cartItemId}
                      className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors hover:bg-[#141417]/50"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          onClick={() => navigateToPDP(item.product.id)}
                          className="w-20 h-20 bg-[#141417] border border-[#2D2D35] flex-shrink-0 cursor-pointer overflow-hidden group"
                        >
                          <img
                            src={item.product.images.front}
                            alt={item.product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="text-[9px] font-mono px-2 py-0.5 uppercase tracking-wider border font-medium"
                              style={{
                                borderColor: `${dept?.colorAccent || '#C9A84C'}40`,
                                color: dept?.colorAccent || '#C9A84C',
                                backgroundColor: `${dept?.colorAccent || '#C9A84C'}10`,
                              }}
                            >
                              {dept?.title || item.product.deptLabel || item.product.department}
                            </span>
                            <span className="text-[10px] font-mono text-[#8E8D94]">
                              SKU: {item.product.sku}
                            </span>
                          </div>

                          <h3
                            onClick={() => navigateToPDP(item.product.id)}
                            className="font-sans font-medium text-base text-[#FAF9F5] hover:text-[#C9A84C] cursor-pointer transition-colors"
                          >
                            {item.product.name}
                          </h3>

                          {/* Selected Variant Options */}
                          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-[#8E8D94] font-mono">
                            {item.selectedColor && (
                              <span className="bg-[#141417] px-2 py-0.5 border border-[#2D2D35]">
                                Finish: <strong className="text-[#FAF9F5]">{item.selectedColor}</strong>
                              </span>
                            )}
                            {item.selectedCushion && (
                              <span className="bg-[#141417] px-2 py-0.5 border border-[#2D2D35]">
                                Cushions: <strong className="text-[#FAF9F5]">{item.selectedCushion}</strong>
                              </span>
                            )}
                            {item.selectedArchFit && (
                              <span className="bg-[#141417] px-2 py-0.5 border border-[#2D2D35]">
                                Band Fit: <strong className="text-[#FAF9F5]">{item.selectedArchFit}</strong>
                              </span>
                            )}
                            {item.selectedSize && (
                              <span className="bg-[#141417] px-2 py-0.5 border border-[#2D2D35]">
                                Size: <strong className="text-[#FAF9F5]">{item.selectedSize}</strong>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Quantity Stepper & Price */}
                      <div className="flex items-center justify-between w-full sm:w-auto sm:gap-6 self-end sm:self-center border-t sm:border-t-0 border-[#2D2D35] pt-3 sm:pt-0">
                        {/* Quantity Stepper */}
                        <div className="flex items-center border border-[#2D2D35] bg-[#141417]">
                          <button
                            onClick={() => updateCartQuantity(item.cartItemId, -1)}
                            className="w-8 h-8 flex items-center justify-center text-[#8E8D94] hover:text-[#FAF9F5] hover:bg-[#2D2D35] transition-colors cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-9 text-center font-mono text-xs text-[#FAF9F5] font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.cartItemId, 1)}
                            className="w-8 h-8 flex items-center justify-center text-[#8E8D94] hover:text-[#FAF9F5] hover:bg-[#2D2D35] transition-colors cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right min-w-[90px]">
                          <div className="font-mono text-base font-semibold text-[#FAF9F5]">
                            ${(item.unitPrice * item.quantity).toFixed(2)}
                          </div>
                          <div className="text-[10px] font-mono text-[#8E8D94]">
                            ${item.unitPrice.toFixed(2)} / unit
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromCart(item.cartItemId)}
                          className="text-[#8E8D94] hover:text-[#DC2626] p-1.5 hover:bg-[#141417] transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Cross-Dock Consolidation Guarantee Banner */}
              <div className="bg-[#141417] border border-[#2D2D35] p-5 flex items-start gap-4">
                <div className="p-2.5 bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#C9A84C] flex-shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-mono uppercase tracking-wider text-[#FAF9F5] font-semibold">
                    BLOWMAGGY Unified Multi-Dept Logistics Guarantee
                  </h4>
                  <p className="text-xs text-[#8E8D94] mt-1 leading-relaxed">
                    All items from Fashion, Beauty, Electronics, and Grocery are pre-consolidated into a single luxury
                    black box at Bay 4 of our fulfillment center. Zero split shipments. One carrier tracking number.
                  </p>
                </div>
              </div>
            </div>

            {/* Right 4 Columns: Consolidated Order Manifest Summary */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-[#1A1A1E] border border-[#2D2D35] p-6 sticky top-24">
                <h3 className="font-mono text-xs uppercase tracking-widest text-[#8E8D94] pb-4 border-b border-[#2D2D35] mb-5">
                  Order Manifest Summary
                </h3>

                {/* Subtotal lines */}
                <div className="space-y-3 text-sm font-sans">
                  <div className="flex justify-between items-center">
                    <span className="text-[#8E8D94]">Subtotal ({cartTotalQuantity} items)</span>
                    <span className="font-mono text-[#FAF9F5]">${cartSubtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[#8E8D94]">Consolidated Shipping</span>
                    <span className="font-mono text-[#22C55E]">
                      {cartShipping === 0 ? 'FREE (Over $75)' : `$${cartShipping.toFixed(2)}`}
                    </span>
                  </div>

                  {couponCode && (
                    <div className="flex justify-between items-center text-[#22C55E]">
                      <div className="flex items-center gap-1.5 font-mono text-xs">
                        <Tag className="w-3.5 h-3.5" />
                        <span>Promo Code ({couponCode})</span>
                        <button
                          onClick={handleRemoveCoupon}
                          className="text-[#DC2626] hover:underline text-[10px] ml-1 cursor-pointer"
                        >
                          [Remove]
                        </button>
                      </div>
                      <span className="font-mono">-${couponDiscountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1 text-[#8E8D94]">
                      <span>Estimated Tax</span>
                      <span className="text-[10px] font-mono text-[#8E8D94]">(8.0% standard)</span>
                    </div>
                    <span className="font-mono text-[#FAF9F5]">${cartTax.toFixed(2)}</span>
                  </div>

                  <div className="pt-4 border-t border-[#2D2D35] flex justify-between items-baseline">
                    <div>
                      <span className="font-mono text-xs uppercase tracking-wider text-[#8E8D94] block">
                        Total Payable
                      </span>
                      <span className="text-[10px] text-[#8E8D94]">Includes all department taxes</span>
                    </div>
                    <span className="font-mono text-2xl font-bold text-[#C9A84C]">
                      ${cartTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Promo Code Form */}
                <div className="mt-6 pt-5 border-t border-[#2D2D35]">
                  <form onSubmit={handleApplyCoupon} className="space-y-2">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-[#8E8D94] block">
                      Promotional Voucher
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="e.g. ONECART"
                        className="bg-[#141417] border border-[#2D2D35] px-3 py-2 text-xs font-mono text-[#FAF9F5] w-full focus:outline-none focus:border-[#C9A84C] uppercase placeholder-[#8E8D94]/50"
                      />
                      <button
                        type="submit"
                        className="bg-[#2D2D35] hover:bg-[#3E3E47] text-[#FAF9F5] font-mono text-xs px-3 py-2 border border-[#3E3E47] transition-colors cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                    {couponSuccess && (
                      <div className="flex items-center gap-1.5 text-xs text-[#22C55E] mt-1 font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{couponSuccess}</span>
                      </div>
                    )}
                    {couponError && (
                      <div className="flex items-center gap-1.5 text-xs text-[#DC2626] mt-1 font-mono">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{couponError}</span>
                      </div>
                    )}
                  </form>
                </div>

                {/* Checkout CTA */}
                <button
                  onClick={() => setActiveView('checkout')}
                  className="w-full mt-6 bg-[#C9A84C] hover:bg-[#d6b75e] text-[#0E0E10] py-3.5 px-4 font-mono text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-colors shadow-lg cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Payment demo note */}
                <div className="mt-4 pt-4 border-t border-[#2D2D35] space-y-2 text-[11px] text-[#8E8D94] font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"></span>
                    <span>Consolidated UPI & Card Demo Mode Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]"></span>
                    <span>No split packaging fee applied</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
