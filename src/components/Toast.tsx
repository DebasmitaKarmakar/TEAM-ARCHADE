import React from 'react';
import { useStore } from '../context/StoreContext';

export const Toast: React.FC = () => {
  const { toast } = useStore();

  if (!toast.show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#343538] text-[#e3e2e6] p-4 rounded-xl shadow-2xl max-w-md border border-[#44474a] animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto">
      <div className="w-10 h-10 rounded-lg bg-[#ba012d] text-white flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-[22px]">shopping_cart_checkout</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-['Space_Grotesk'] text-[12px] uppercase tracking-wider text-[#ffb3b3] font-bold">
          {toast.title}
        </p>
        <p className="font-['Hanken_Grotesk'] text-[13px] text-[#e3e2e6] truncate">
          {toast.message}
        </p>
      </div>
      {toast.price && (
        <span className="font-['Space_Grotesk'] text-[14px] text-white font-bold shrink-0">
          {toast.price}
        </span>
      )}
    </div>
  );
};
