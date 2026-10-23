import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { PRODUCTS, DEPARTMENTS } from '../data/mockData';
import { DepartmentId } from '../types/store';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    navigateToPDP,
    navigateToDept,
    setActiveView,
    setCurrentRole,
    addToCart,
  } = useStore();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const filteredProducts = PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.sku.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase()) ||
      p.deptLabel.toLowerCase().includes(query.toLowerCase())
  );

  const filteredDepts = Object.values(DEPARTMENTS).filter(
    (d) =>
      d.title.toLowerCase().includes(query.toLowerCase()) ||
      d.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      d.deptNumber.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0d0e11]/80 backdrop-blur-md flex items-start justify-center pt-20 px-4 animate-in fade-in duration-200"
      onClick={() => setCommandPaletteOpen(false)}
    >
      <div
        className="w-full max-w-2xl bg-[#1b1b1f] border border-[#343538] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-[#343538] bg-[#121316]">
          <span className="material-symbols-outlined text-[#7df4ff] text-[22px] mr-3">search</span>
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent text-white font-['Hanken_Grotesk'] text-[15px] placeholder:text-[#8f9194] focus:outline-none"
            placeholder="Search items, SKUs, departments, or admin workstations..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className="font-['Space_Grotesk'] text-[11px] uppercase text-[#8f9194] bg-[#292a2d] px-2 py-0.5 rounded border border-[#44474a]">
            ESC
          </span>
        </div>

        {/* Content list */}
        <div className="overflow-y-auto p-3 space-y-4">
          {/* Quick Views / Actions */}
          {(!query || 'magazine'.includes(query.toLowerCase()) || 'admin'.includes(query.toLowerCase())) && (
            <div>
              <div className="px-2 py-1 text-[10px] font-['Space_Grotesk'] uppercase text-[#8f9194] tracking-wider font-bold">
                Direct Workstations & Views
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-1">
                <button
                  onClick={() => {
                    setActiveView('home');
                    setCommandPaletteOpen(false);
                  }}
                  className="flex items-center gap-2 p-2 rounded hover:bg-[#292a2d] text-left transition-colors text-sm text-[#e3e2e6]"
                >
                  <span className="material-symbols-outlined text-[18px] text-white">storefront</span>
                  <span>Storefront Homepage</span>
                </button>

                <button
                  onClick={() => {
                    setActiveView('cart');
                    setCommandPaletteOpen(false);
                  }}
                  className="flex items-center gap-2 p-2 rounded hover:bg-[#292a2d] text-left transition-colors text-sm text-[#e3e2e6]"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#7df4ff]">shopping_bag</span>
                  <span>Unified Manifest & Cart</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentRole('dept_manager');
                    setActiveView('dept_manager');
                    setCommandPaletteOpen(false);
                  }}
                  className="flex items-center gap-2 p-2 rounded hover:bg-[#292a2d] text-left transition-colors text-sm text-[#7df4ff]"
                >
                  <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                  <span>Electronics & Beauty Manager</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentRole('store_admin');
                    setActiveView('store_admin');
                    setCommandPaletteOpen(false);
                  }}
                  className="flex items-center gap-2 p-2 rounded hover:bg-[#292a2d] text-left transition-colors text-sm text-[#ffb3b3]"
                >
                  <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                  <span>Administrative Governance</span>
                </button>

                <button
                  onClick={() => {
                    setActiveView('magazine');
                    setCommandPaletteOpen(false);
                  }}
                  className="flex items-center gap-2 p-2 rounded hover:bg-[#292a2d] text-left transition-colors text-sm text-white"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#FF4F8B]">menu_book</span>
                  <span>The Everything Issue Magazine</span>
                </button>

                <button
                  onClick={() => {
                    setActiveView('theme-lab');
                    setCommandPaletteOpen(false);
                  }}
                  className="flex items-center gap-2 p-2 rounded hover:bg-[#292a2d] text-left transition-colors text-sm text-[#22D3EE]"
                >
                  <span className="material-symbols-outlined text-[18px]">palette</span>
                  <span>Token & Theme Verification Lab</span>
                </button>
              </div>
            </div>
          )}

          {/* Department Results */}
          {filteredDepts.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-['Space_Grotesk'] uppercase text-[#8f9194] tracking-wider font-bold">
                Flagship Departments ({filteredDepts.length})
              </div>
              <div className="space-y-1 mt-1">
                {filteredDepts.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => {
                      navigateToDept(d.id);
                      setCommandPaletteOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded hover:bg-[#292a2d] text-left transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.colorAccent }}></span>
                      <div>
                        <div className="font-['Space_Grotesk'] text-[13px] font-bold text-white group-hover:text-[#7df4ff] transition-colors">
                          {d.title}
                        </div>
                        <div className="font-['Hanken_Grotesk'] text-[11px] text-[#8f9194]">{d.subtitle}</div>
                      </div>
                    </div>
                    <span className="font-['Space_Grotesk'] text-[10px] uppercase text-[#8f9194] bg-[#121316] px-2 py-0.5 rounded">
                      {d.deptNumber}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Product Results */}
          <div>
            <div className="px-2 py-1 text-[10px] font-['Space_Grotesk'] uppercase text-[#8f9194] tracking-wider font-bold">
              Products ({filteredProducts.length})
            </div>
            {filteredProducts.length === 0 ? (
              <div className="p-4 text-center text-[#8f9194] text-sm font-['Hanken_Grotesk']">
                No matching articles found in catalog for "{query}".
              </div>
            ) : (
              <div className="space-y-1 mt-1">
                {filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2 rounded hover:bg-[#292a2d] transition-colors group cursor-pointer"
                    onClick={() => {
                      navigateToPDP(p.id);
                      setCommandPaletteOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <img src={p.images.front} alt={p.name} className="w-10 h-10 object-cover rounded bg-[#121316]" />
                      <div>
                        <div className="font-['Bodoni_Moda'] text-[15px] font-semibold text-white group-hover:text-[#7df4ff] transition-colors">
                          {p.name}
                        </div>
                        <div className="flex items-center gap-2 font-['Space_Grotesk'] text-[11px] text-[#8f9194]">
                          <span className="uppercase text-[#c5c7c9]">{p.deptLabel}</span>
                          <span>•</span>
                          <span>{p.sku}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-['Space_Grotesk'] text-[14px] font-bold text-white">${p.price.toFixed(2)}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(p, 1);
                        }}
                        className="p-1.5 rounded bg-[#1f1f23] hover:bg-white hover:text-black transition-colors"
                        title="Add to cart"
                      >
                        <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer tip */}
        <div className="px-4 py-2 border-t border-[#343538] bg-[#121316] flex items-center justify-between text-[11px] text-[#8f9194] font-['Space_Grotesk']">
          <span>Press ⌘K or ESC to toggle</span>
          <span className="text-[#7df4ff]">Instant Unified Multi-Department Search</span>
        </div>
      </div>
    </div>
  );
};
