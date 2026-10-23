import React from 'react';
import { useStore } from '../../context/StoreContext';
import { DEPARTMENTS } from '../../data/mockData';
import { Truck, CheckCircle, ArrowLeft, Printer, Box } from 'lucide-react';
import { DepartmentId } from '../../types/store';
import { formatInr } from '../../lib/currency';

export const OrderTrackingView: React.FC = () => {
  const { orders, selectedOrderId, setSelectedOrderId, setActiveView, navigateToPDP } = useStore();

  const activeOrder = orders.find((o) => o.id === selectedOrderId) || orders[0];

  const steps = [
    { title: 'Order Placed & Verified', desc: 'Single payment authorized via 256-bit gateway', done: true, time: '10:42 AM' },
    { title: 'Cross-Dock Consolidated', desc: 'Items retrieved from departments at Bay 4', done: true, time: '12:15 PM' },
    { title: 'Single Parcel Laser Scanned', desc: 'Weight verified: 3.4kg, unified manifest affixed', done: activeOrder?.status !== 'placed', time: '02:30 PM' },
    { title: 'In Transit With Apex Express', desc: 'Out for consolidated delivery to destination', done: activeOrder?.status === 'out_for_delivery' || activeOrder?.status === 'delivered', time: '04:10 PM' },
    { title: 'Delivered & Signed', desc: 'Recipient signature logged on-file', done: activeOrder?.status === 'delivered', time: 'Pending' },
  ];

  // Distinct departments in this order
  const distinctDepts = activeOrder
    ? Array.from(new Set(activeOrder.items.map((i) => i.product.department)))
    : [];

  return (
    <div className="min-h-screen bg-[#0E0E10] text-[#E8E8E8] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs font-mono text-[#8E8D94] uppercase tracking-wider mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('home')}
              className="hover:text-[#FAF9F5] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Storefront
            </button>
            <span>/</span>
            <span className="text-[#C9A84C]">Consolidated Order Tracking</span>
          </div>

          {/* Switcher if multiple orders exist */}
          {orders.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-[#8E8D94]">Select Consignment:</span>
              <select
                value={activeOrder?.id}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                className="bg-[#141417] border border-[#2D2D35] text-[#FAF9F5] text-xs px-2 py-1 font-mono focus:outline-none cursor-pointer"
              >
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.id} ({formatInr(o.total)})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Consignment Banner */}
        <div className="bg-[#1A1A1E] border border-[#2D2D35] p-6 sm:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#2D2D35]">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[#C9A84C] mb-1">
                <span>CONSOLIDATED DISPATCH #</span>
                <span className="text-[#FAF9F5] font-bold">{activeOrder?.id}</span>
                <span>•</span>
                <span className="text-[#22C55E]">STATUS: {activeOrder?.status.toUpperCase().replace('_', ' ')}</span>
              </div>
              <h1 className="font-display-hero text-2xl sm:text-3xl text-[#FAF9F5]">
                Single Parcel Multi-Dept Dispatch
              </h1>
              <p className="text-xs font-sans text-[#8E8D94] mt-1">
                Guaranteed zero split deliveries. All {activeOrder?.items.length || 0} items from {distinctDepts.length} departments packaged into one box.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 border border-[#2D2D35] bg-[#141417] text-xs font-mono hover:text-[#FAF9F5] transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-[#C9A84C]" />
                <span>Print Packing Slip</span>
              </button>
            </div>
          </div>

          {/* Stepper */}
          <div className="mt-8 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
              {steps.map((st, idx) => (
                <div key={idx} className="flex md:flex-col items-start gap-3 relative">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs flex-shrink-0 z-10 transition-colors ${
                      st.done
                        ? 'bg-[#C9A84C] text-[#0E0E10] font-bold shadow-[0_0_12px_rgba(201,168,76,0.4)]'
                        : 'bg-[#141417] border border-[#2D2D35] text-[#8E8D94]'
                    }`}
                  >
                    {st.done ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-[#FAF9F5]">{st.title}</span>
                    </div>
                    <p className="text-[11px] text-[#8E8D94] mt-0.5 leading-snug">{st.desc}</p>
                    <span className="text-[10px] font-mono text-[#C9A84C] block mt-1">{st.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Consignment Specs & Department Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Packaged Items */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-[#1A1A1E] border border-[#2D2D35] p-6">
              <h3 className="font-mono text-xs uppercase tracking-wider text-[#FAF9F5] font-semibold mb-4 flex items-center gap-2">
                <Box className="w-4 h-4 text-[#C9A84C]" />
                Package Contents ({activeOrder?.items.length || 0} Items Inside Master Box)
              </h3>

              <div className="divide-y divide-[#2D2D35]">
                {activeOrder?.items.map((item) => {
                  const dept = DEPARTMENTS[item.product.department];
                  return (
                    <div key={item.cartItemId} className="py-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={item.product.images.front}
                          alt=""
                          onClick={() => navigateToPDP(item.product.id)}
                          className="w-14 h-14 object-cover border border-[#2D2D35] cursor-pointer"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className="text-[9px] font-mono px-1.5 py-0.5 border"
                              style={{
                                borderColor: `${dept?.colorAccent || '#C9A84C'}40`,
                                color: dept?.colorAccent || '#C9A84C',
                              }}
                            >
                              {dept?.title || item.product.deptLabel || item.product.department}
                            </span>
                            <span className="text-[10px] font-mono text-[#8E8D94]">SKU: {item.product.sku}</span>
                          </div>
                          <div
                            onClick={() => navigateToPDP(item.product.id)}
                            className="text-sm font-sans font-medium text-[#FAF9F5] hover:text-[#C9A84C] cursor-pointer mt-1"
                          >
                            {item.product.name}
                          </div>
                          <div className="text-[11px] font-mono text-[#8E8D94]">Qty: {item.quantity} units</div>
                        </div>
                      </div>

                      <div className="font-mono text-sm font-semibold text-[#FAF9F5] text-right">
                        {formatInr(item.unitPrice * item.quantity)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Logistics Hub Info */}
            <div className="bg-[#141417] border border-[#2D2D35] p-5 flex items-start gap-4">
              <Truck className="w-6 h-6 text-[#C9A84C] flex-shrink-0 mt-1" />
              <div className="space-y-1 text-xs font-mono">
                <div className="text-[#FAF9F5] font-semibold uppercase">Fulfillment Logistics Node</div>
                <div className="text-[#8E8D94]">
                  BLOWMAGGY Consolidated Cross-Dock Terminal 4 · Bay 4 Consolidation Line
                </div>
                <div className="text-[#8E8D94]">
                  Carrier: Apex Global Luxury Express · Tracking: {activeOrder?.consignmentId || 'APX-9982410-BM'} · ETA: {activeOrder?.eta || '2 Business Days'}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Dispatch Manifest & Recipient Details */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#1A1A1E] border border-[#2D2D35] p-6 space-y-6">
              <div>
                <h4 className="font-mono text-xs uppercase tracking-wider text-[#8E8D94] mb-3 pb-2 border-b border-[#2D2D35]">
                  Destination Address
                </h4>
                <div className="text-xs font-mono text-[#FAF9F5] space-y-1">
                  <div className="font-bold">{activeOrder?.shippingAddress.fullName}</div>
                  <div className="text-[#8E8D94]">{activeOrder?.shippingAddress.street}</div>
                  <div className="text-[#8E8D94]">
                    {activeOrder?.shippingAddress.city}, {activeOrder?.shippingAddress.state} {activeOrder?.shippingAddress.postalCode}
                  </div>
                  <div className="text-[#8E8D94]">{activeOrder?.shippingAddress.country}</div>
                </div>
              </div>

              <div>
                <h4 className="font-mono text-xs uppercase tracking-wider text-[#8E8D94] mb-3 pb-2 border-b border-[#2D2D35]">
                  Payment Authorization
                </h4>
                <div className="text-xs font-mono space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#8E8D94]">Method:</span>
                    <span className="text-[#FAF9F5] uppercase">{activeOrder?.paymentMethod} Demo Gateway</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8E8D94]">Transaction Ref:</span>
                    <span className="text-[#22C55E]">{activeOrder?.paymentReference || 'TXN-2026-OK-98'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8E8D94]">Total Paid:</span>
                    <span className="text-[#C9A84C] font-bold">{activeOrder ? formatInr(activeOrder.total) : '—'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-mono text-xs uppercase tracking-wider text-[#8E8D94] mb-3 pb-2 border-b border-[#2D2D35]">
                  Department Manifest Mix
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {distinctDepts.map((deptId) => {
                    const d = DEPARTMENTS[deptId as DepartmentId];
                    return (
                      <span
                        key={deptId}
                        className="text-[10px] font-mono px-2 py-0.5 border"
                        style={{
                          borderColor: `${d?.colorAccent || '#C9A84C'}50`,
                          color: d?.colorAccent || '#C9A84C',
                        }}
                      >
                        {d?.title || deptId}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-[#2D2D35]">
                <button
                  onClick={() => setActiveView('home')}
                  className="w-full bg-[#2D2D35] hover:bg-[#3E3E47] text-[#FAF9F5] py-2.5 font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Return to Storefront
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
