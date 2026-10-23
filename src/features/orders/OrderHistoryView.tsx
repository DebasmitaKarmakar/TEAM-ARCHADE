import React from 'react';
import { ArrowRight, PackageCheck, ReceiptText } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatInr } from '../../lib/currency';

export const OrderHistoryView: React.FC = () => {
  const { orders, setSelectedOrderId, setActiveView } = useStore();

  return (
    <div className="min-h-screen bg-[#0E0E10] py-8 text-[#E8E8E8] sm:py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <button id="order-history-back" type="button" onClick={() => setActiveView('home')} className="mb-5 font-mono text-[10px] uppercase tracking-wider text-[#8E8D94] hover:text-[#FAF9F5]">← Continue shopping</button>
        <div className="mb-8 flex flex-col gap-4 border-b border-[#2D2D35] pb-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#C9A84C]">Shopper account</p><h1 className="font-display-hero text-3xl text-[#FAF9F5] sm:text-4xl">Your consolidated orders</h1><p className="mt-2 text-sm text-[#8E8D94]">Every department, one receipt, one trackable shipment.</p></div><span className="border border-[#C9A84C]/30 bg-[#C9A84C]/10 px-3 py-2 font-mono text-[10px] uppercase text-[#C9A84C]">{orders.length} order{orders.length === 1 ? '' : 's'}</span></div>
        <div className="space-y-4">
          {orders.map((order) => (
            <article key={order.id} className="border border-[#2D2D35] bg-[#1A1A1E] p-5 transition-colors hover:border-[#C9A84C] sm:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center border border-[#C9A84C]/40 bg-[#C9A84C]/10 text-[#C9A84C]"><PackageCheck className="h-5 w-5" /></div><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-mono text-sm font-bold text-[#FAF9F5]">{order.id}</h2><span className="border border-[#22C55E]/30 bg-[#22C55E]/10 px-2 py-0.5 font-mono text-[9px] uppercase text-[#22C55E]">{order.status.replaceAll('_', ' ')}</span></div><p className="mt-1 text-xs text-[#8E8D94]">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} · {order.departmentCount} departments · {order.items.length} line items</p><p className="mt-2 font-mono text-base font-bold text-[#FAF9F5]">{formatInr(order.total)}</p></div></div><button id={`view-order-${order.id}`} type="button" onClick={() => { setSelectedOrderId(order.id); setActiveView('order-tracking'); }} className="flex min-h-11 items-center justify-center gap-2 border border-[#3E3E47] px-4 font-mono text-xs uppercase tracking-wider text-[#FAF9F5] transition-colors hover:border-[#C9A84C]">View & track <ArrowRight className="h-4 w-4 text-[#C9A84C]" /></button></div>
              <div className="mt-5 flex flex-wrap gap-2 border-t border-[#2D2D35] pt-4">{order.items.slice(0, 4).map((item) => <span key={item.cartItemId} className="flex items-center gap-1.5 border border-[#3E3E47] bg-[#141417] py-1 pr-2 text-[10px] text-[#E8E8E8]"><img src={item.product.images.front} alt="" className="h-6 w-6 object-cover" />{item.product.name}</span>)}{order.items.length > 4 && <span className="px-2 py-1 text-[10px] text-[#8E8D94]">+{order.items.length - 4} more</span>}<span className="ml-auto flex items-center gap-1 font-mono text-[10px] uppercase text-[#8E8D94]"><ReceiptText className="h-3.5 w-3.5 text-[#C9A84C]" /> {order.paymentMethod} receipt</span></div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};
