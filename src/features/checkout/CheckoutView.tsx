import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ArrowLeft, Check, CreditCard, QrCode, ShieldCheck, Truck, Lock, AlertCircle, Sparkles } from 'lucide-react';
import { formatInr } from '../../lib/currency';
import { Order } from '../../types/store';

export const CheckoutView: React.FC = () => {
  const {
    cart,
    cartSubtotal,
    cartTax,
    cartShipping,
    couponCode,
    couponDiscountAmount,
    cartTotal,
    cartTotalQuantity,
    placeOrder,
    setActiveView,
    setSelectedOrderId,
  } = useStore();

  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'klarna' | 'apple_pay'>('upi');
  const [upiId, setUpiId] = useState('shopper@okaxis');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');
  const [cardHolder, setCardHolder] = useState('ALEXANDRA VAUGHN');

  const [shippingAddress, setShippingAddress] = useState({
    fullName: 'Alexandra Vaughn',
    email: 'alexandra.vaughn@luxurymail.com',
    street: '742 Evergreen Terrace, Suite 400',
    city: 'New York',
    state: 'NY',
    postalCode: '10021',
    country: 'United States',
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      setErrorMsg('Your cart is empty.');
      return;
    }

    if (!shippingAddress.fullName || !shippingAddress.email || !shippingAddress.street) {
      setErrorMsg('Please complete all required shipping fields.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg('');

    setTimeout(() => {
      const newOrder = placeOrder(shippingAddress, paymentMethod);
      setIsProcessing(false);
      setReceiptOrder(newOrder);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#0E0E10] text-[#E8E8E8] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-[#8E8D94] uppercase tracking-wider mb-6">
          <button
            onClick={() => setActiveView('cart')}
            className="hover:text-[#FAF9F5] flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Bag
          </button>
          <span>/</span>
          <span className="text-[#C9A84C]">Consolidated Multi-Department Checkout</span>
        </div>

        {/* Checkout Header */}
        <div className="border-b border-[#2D2D35] pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[#C9A84C] mb-1">
              <span>CHECKOUT GATEWAY</span>
              <span>•</span>
              <span className="text-[#22C55E]">DEMO PAYMENTS ENABLED (UPI & CARD)</span>
            </div>
            <h1 className="font-display-hero text-3xl sm:text-4xl text-[#FAF9F5] tracking-tight">
              Single-Point Multi-Dept Dispatch
            </h1>
            <p className="text-sm font-sans text-[#8E8D94] mt-1">
              All items across departments will be packaged and dispatched together in one consolidated shipment.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[#8E8D94] bg-[#1A1A1E] px-4 py-2 border border-[#2D2D35]">
            <Lock className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>256-Bit SSL Encrypted Session</span>
          </div>
        </div>

        {/* Checkout Steps Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Left Forms (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            <form onSubmit={handlePlaceOrder} className="space-y-8">
              {/* Step 1: Consolidated Delivery Address */}
              <div className="bg-[#1A1A1E] border border-[#2D2D35] p-6 sm:p-7">
                <div className="flex items-center gap-3 pb-4 mb-5 border-b border-[#2D2D35]">
                  <div className="w-6 h-6 rounded-none bg-[#C9A84C] text-[#0E0E10] font-mono text-xs font-bold flex items-center justify-center">
                    1
                  </div>
                  <h2 className="font-mono text-sm uppercase tracking-wider text-[#FAF9F5] font-semibold flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#C9A84C]" />
                    Consolidated Shipping Address
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <label className="text-[#8E8D94] block uppercase mb-1">Full Recipient Name *</label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.fullName}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                      className="w-full bg-[#141417] border border-[#2D2D35] px-3.5 py-2.5 text-[#FAF9F5] focus:outline-none focus:border-[#C9A84C]"
                    />
                  </div>

                  <div>
                    <label className="text-[#8E8D94] block uppercase mb-1">Email For Single Dispatch Manifest *</label>
                    <input
                      type="email"
                      required
                      value={shippingAddress.email}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, email: e.target.value })}
                      className="w-full bg-[#141417] border border-[#2D2D35] px-3.5 py-2.5 text-[#FAF9F5] focus:outline-none focus:border-[#C9A84C]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[#8E8D94] block uppercase mb-1">Street Address & Suite *</label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.street}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                      className="w-full bg-[#141417] border border-[#2D2D35] px-3.5 py-2.5 text-[#FAF9F5] focus:outline-none focus:border-[#C9A84C]"
                    />
                  </div>

                  <div>
                    <label className="text-[#8E8D94] block uppercase mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      className="w-full bg-[#141417] border border-[#2D2D35] px-3.5 py-2.5 text-[#FAF9F5] focus:outline-none focus:border-[#C9A84C]"
                    />
                  </div>

                  <div>
                    <label className="text-[#8E8D94] block uppercase mb-1">Postal Code *</label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.postalCode}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                      className="w-full bg-[#141417] border border-[#2D2D35] px-3.5 py-2.5 text-[#FAF9F5] focus:outline-none focus:border-[#C9A84C]"
                    />
                  </div>
                </div>

                <div className="mt-4 p-3 bg-[#141417] border border-[#2D2D35] flex items-center gap-2 text-xs font-mono text-[#22C55E]">
                  <Check className="w-4 h-4" />
                  <span>Consolidated Dispatch Route: BLOWMAGGY Central Cross-Dock Bay 4</span>
                </div>
              </div>

              {/* Step 2: Demo Payment Method */}
              <div className="bg-[#1A1A1E] border border-[#2D2D35] p-6 sm:p-7">
                <div className="flex items-center gap-3 pb-4 mb-5 border-b border-[#2D2D35]">
                  <div className="w-6 h-6 rounded-none bg-[#C9A84C] text-[#0E0E10] font-mono text-xs font-bold flex items-center justify-center">
                    2
                  </div>
                  <h2 className="font-mono text-sm uppercase tracking-wider text-[#FAF9F5] font-semibold flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#C9A84C]" />
                    Select Demo Payment Method
                  </h2>
                </div>

                {/* Tabs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-3 text-left border font-mono transition-all ${
                      paymentMethod === 'upi'
                        ? 'border-[#C9A84C] bg-[#C9A84C]/10 text-[#FAF9F5]'
                        : 'border-[#2D2D35] bg-[#141417] text-[#8E8D94] hover:border-[#3E3E47]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <QrCode className="w-4 h-4 text-[#C9A84C]" />
                      <span className="text-[10px] uppercase font-semibold text-[#22C55E]">Instant</span>
                    </div>
                    <div className="text-xs font-bold">UPI / QR</div>
                    <div className="text-[10px] text-[#8E8D94]">GPay, PhonePe, Paytm</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 text-left border font-mono transition-all ${
                      paymentMethod === 'card'
                        ? 'border-[#C9A84C] bg-[#C9A84C]/10 text-[#FAF9F5]'
                        : 'border-[#2D2D35] bg-[#141417] text-[#8E8D94] hover:border-[#3E3E47]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <CreditCard className="w-4 h-4 text-[#C9A84C]" />
                      <span className="text-[10px] uppercase font-semibold text-[#8E8D94]">Demo</span>
                    </div>
                    <div className="text-xs font-bold">Credit / Debit</div>
                    <div className="text-[10px] text-[#8E8D94]">Visa, Mastercard, Amex</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('klarna')}
                    className={`p-3 text-left border font-mono transition-all ${
                      paymentMethod === 'klarna'
                        ? 'border-[#C9A84C] bg-[#C9A84C]/10 text-[#FAF9F5]'
                        : 'border-[#2D2D35] bg-[#141417] text-[#8E8D94] hover:border-[#3E3E47]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Sparkles className="w-4 h-4 text-[#F43F5E]" />
                      <span className="text-[10px] uppercase font-semibold text-[#F43F5E]">4x instalments</span>
                    </div>
                    <div className="text-xs font-bold">Klarna Pay in 4</div>
                    <div className="text-[10px] text-[#8E8D94]">Interest-free split</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('apple_pay')}
                    className={`p-3 text-left border font-mono transition-all ${
                      paymentMethod === 'apple_pay'
                        ? 'border-[#C9A84C] bg-[#C9A84C]/10 text-[#FAF9F5]'
                        : 'border-[#2D2D35] bg-[#141417] text-[#8E8D94] hover:border-[#3E3E47]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Lock className="w-4 h-4 text-[#C9A84C]" />
                      <span className="text-[10px] uppercase font-semibold text-[#FAF9F5]">1-Touch</span>
                    </div>
                    <div className="text-xs font-bold">Apple / Google</div>
                    <div className="text-[10px] text-[#8E8D94]">Fast biometric checkout</div>
                  </button>
                </div>

                {/* Sub-form based on selected payment method */}
                {paymentMethod === 'upi' && (
                  <div className="bg-[#141417] border border-[#2D2D35] p-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                      <div>
                        <h4 className="font-mono text-xs uppercase tracking-wider text-[#FAF9F5] font-semibold mb-2">
                          Scan UPI QR or Enter VPA
                        </h4>
                        <p className="text-xs text-[#8E8D94] mb-4 font-sans leading-relaxed">
                          Scan the live QR code with any UPI application (GPay, PhonePe, Paytm, BHIM) or enter your Virtual Private Address.
                        </p>

                        <label className="text-[10px] font-mono uppercase text-[#8E8D94] block mb-1">
                          Demo Virtual Payment Address (VPA)
                        </label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="w-full bg-[#0E0E10] border border-[#2D2D35] px-3.5 py-2 font-mono text-xs text-[#FAF9F5] focus:outline-none focus:border-[#C9A84C]"
                        />
                      </div>

                      {/* Simulated QR Code Canvas */}
                      <div className="flex flex-col items-center justify-center p-4 bg-[#FAF9F5] border border-[#2D2D35] text-center">
                        <div className="w-32 h-32 bg-white p-2 border border-black/10 flex items-center justify-center relative">
                          {/* Stylized QR pattern */}
                          <div className="w-full h-full border-4 border-black grid grid-cols-4 grid-rows-4 p-1 gap-1">
                            <div className="bg-black col-span-2 row-span-2"></div>
                            <div className="bg-black"></div>
                            <div className="bg-transparent"></div>
                            <div className="bg-black"></div>
                            <div className="bg-black"></div>
                            <div className="bg-black col-span-2 row-span-2"></div>
                            <div className="bg-black"></div>
                            <div className="bg-transparent"></div>
                          </div>
                        </div>
                        <div className="text-[10px] font-mono text-black font-semibold mt-2 uppercase">
                          Pay Total: {formatInr(cartTotal)}
                        </div>
                        <div className="text-[9px] font-mono text-black/60">UPI Ref: BM-PAY-2026-OK</div>
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="bg-[#141417] border border-[#2D2D35] p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase text-[#8E8D94]">Test Card (Pre-Authorized)</span>
                      <span className="text-[10px] font-mono text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 border border-[#22C55E]/30">
                        Demo Sandbox Mode
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                      <div className="sm:col-span-2">
                        <label className="text-[#8E8D94] block uppercase mb-1">Card Number</label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full bg-[#0E0E10] border border-[#2D2D35] px-3 py-2 text-[#FAF9F5] focus:outline-none focus:border-[#C9A84C]"
                        />
                      </div>
                      <div>
                        <label className="text-[#8E8D94] block uppercase mb-1">Cardholder Name</label>
                        <input
                          type="text"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          className="w-full bg-[#0E0E10] border border-[#2D2D35] px-3 py-2 text-[#FAF9F5] focus:outline-none focus:border-[#C9A84C]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[#8E8D94] block uppercase mb-1">Expiry</label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full bg-[#0E0E10] border border-[#2D2D35] px-3 py-2 text-[#FAF9F5] focus:outline-none focus:border-[#C9A84C]"
                          />
                        </div>
                        <div>
                          <label className="text-[#8E8D94] block uppercase mb-1">CVV</label>
                          <input
                            type="password"
                            maxLength={4}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            className="w-full bg-[#0E0E10] border border-[#2D2D35] px-3 py-2 text-[#FAF9F5] focus:outline-none focus:border-[#C9A84C]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'klarna' && (
                  <div className="bg-[#141417] border border-[#2D2D35] p-5">
                    <h4 className="font-mono text-xs uppercase tracking-wider text-[#FAF9F5] font-semibold mb-2">
                      Split into 4 interest-free payments
                    </h4>
                    <p className="text-xs text-[#8E8D94] mb-4 font-sans">
                      Pay {formatInr(cartTotal / 4)} today, and the rest every 2 weeks. No credit check or interest fees.
                    </p>
                    <div className="grid grid-cols-4 gap-2 text-center font-mono text-xs">
                      <div className="p-2 border border-[#C9A84C] bg-[#C9A84C]/10">
                        <div className="text-[10px] text-[#C9A84C]">Today</div>
                        <div className="font-bold text-[#FAF9F5]">{formatInr(cartTotal / 4)}</div>
                      </div>
                      <div className="p-2 border border-[#2D2D35] bg-[#0E0E10]">
                        <div className="text-[10px] text-[#8E8D94]">In 2 wks</div>
                        <div className="text-[#FAF9F5]">{formatInr(cartTotal / 4)}</div>
                      </div>
                      <div className="p-2 border border-[#2D2D35] bg-[#0E0E10]">
                        <div className="text-[10px] text-[#8E8D94]">In 4 wks</div>
                        <div className="text-[#FAF9F5]">{formatInr(cartTotal / 4)}</div>
                      </div>
                      <div className="p-2 border border-[#2D2D35] bg-[#0E0E10]">
                        <div className="text-[10px] text-[#8E8D94]">In 6 wks</div>
                        <div className="text-[#FAF9F5]">{formatInr(cartTotal / 4)}</div>
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'apple_pay' && (
                  <div className="bg-[#141417] border border-[#2D2D35] p-5 text-center">
                    <p className="text-xs text-[#8E8D94] mb-3 font-sans">
                      Biometric Touch ID / Face ID authentication ready for Apple Pay / Google Wallet.
                    </p>
                    <div className="inline-flex items-center gap-2 bg-[#FAF9F5] text-black px-6 py-2.5 font-mono text-xs uppercase font-bold tracking-wider">
                      <Lock className="w-3.5 h-3.5" />
                      <span>One-Touch Authenticated</span>
                    </div>
                  </div>
                )}

                {errorMsg && (
                  <div className="mt-4 p-3 bg-[#DC2626]/10 border border-[#DC2626]/30 text-[#DC2626] text-xs font-mono flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full mt-6 bg-[#C9A84C] hover:bg-[#d6b75e] disabled:opacity-50 text-[#0E0E10] py-4 px-6 font-mono text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                      <span>AUTHORIZING DEMO CONSOLIDATED DISPATCH...</span>
                    </div>
                  ) : (
                    <>
                      <span>CONFIRM & PLACE MULTI-DEPARTMENT ORDER — {formatInr(cartTotal)}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Sidebar: Order Manifest Review (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#1A1A1E] border border-[#2D2D35] p-6 sticky top-24">
              <h3 className="font-mono text-xs uppercase tracking-widest text-[#8E8D94] pb-4 border-b border-[#2D2D35] mb-4">
                Consolidated Manifest ({cartTotalQuantity} Items)
              </h3>

              {/* Items quick list */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1 text-xs">
                {cart.map((item) => (
                  <div key={item.cartItemId} className="flex items-center justify-between py-1 border-b border-[#2D2D35]/50">
                    <div className="flex items-center gap-2 truncate pr-2">
                      <img src={item.product.images.front} alt="" className="w-8 h-8 object-cover border border-[#2D2D35]" />
                      <div className="truncate">
                        <div className="text-[#FAF9F5] truncate font-medium">{item.product.name}</div>
                        <div className="text-[10px] font-mono text-[#8E8D94]">Qty: {item.quantity} · {item.product.department}</div>
                      </div>
                    </div>
                    <div className="font-mono text-[#FAF9F5] font-semibold">
                      ${(item.unitPrice * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Financials */}
              <div className="mt-4 pt-4 border-t border-[#2D2D35] space-y-2 text-xs font-mono">
                <div className="flex justify-between text-[#8E8D94]">
                  <span>Subtotal</span>
                  <span className="text-[#FAF9F5]">{formatInr(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between text-[#8E8D94]">
                  <span>Consolidated Shipping</span>
                  <span className="text-[#22C55E]">
                    {cartShipping === 0 ? 'FREE' : formatInr(cartShipping)}
                  </span>
                </div>
                {couponCode && (
                  <div className="flex justify-between text-[#22C55E]">
                    <span>Discount ({couponCode})</span>
                    <span>−{formatInr(couponDiscountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#8E8D94]">
                  <span>Estimated Tax</span>
                  <span className="text-[#FAF9F5]">{formatInr(cartTax)}</span>
                </div>
                <div className="pt-3 border-t border-[#2D2D35] flex justify-between text-sm">
                  <span className="font-semibold text-[#FAF9F5]">Total Payable</span>
                  <span className="font-bold text-[#C9A84C]">{formatInr(cartTotal)}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#2D2D35] text-[11px] text-[#8E8D94] space-y-2">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#C9A84C] flex-shrink-0 mt-0.5" />
                  <span>30-Day Cross-Department Returns with prepaid consolidated return label.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {receiptOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0E0E10]/90 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="receipt-modal-title">
          <div className="w-full max-w-lg border border-[#C9A84C]/50 bg-[#1A1A1E] p-6 text-center shadow-2xl sm:p-8">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[#22C55E]/40 bg-[#22C55E]/10 text-[#22C55E]"><Check className="h-6 w-6" /></div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#C9A84C]">Demo email receipt sent</p>
            <h2 id="receipt-modal-title" className="mt-2 font-display-hero text-3xl text-[#FAF9F5]">Your edit is confirmed.</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#8E8D94]">A simulated consolidated receipt was sent to <strong className="text-[#FAF9F5]">{shippingAddress.email}</strong> for order <strong className="text-[#FAF9F5]">{receiptOrder.id}</strong>. No real email is transmitted in this frontend demo.</p>
            <div className="my-5 border-y border-[#2D2D35] py-4 font-mono text-sm text-[#FAF9F5]">Paid {formatInr(receiptOrder.total)} · {receiptOrder.departmentCount} departments · one parcel</div>
            <button id="receipt-view-tracking" type="button" onClick={() => { setSelectedOrderId(receiptOrder.id); setReceiptOrder(null); setActiveView('order-tracking'); }} className="min-h-11 w-full bg-[#C9A84C] px-5 font-mono text-xs font-bold uppercase tracking-wider text-[#0E0E10] hover:bg-[#d6b75e]">View order tracking</button>
          </div>
        </div>
      )}
    </div>
  );
};
