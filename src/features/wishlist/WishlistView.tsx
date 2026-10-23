import React from 'react';
import { useStore } from '../../context/StoreContext';
import { DEPARTMENTS } from '../../data/mockData';
import { Heart, ShoppingBag, ArrowLeft, Trash2 } from 'lucide-react';
import { formatInr } from '../../lib/currency';

export const WishlistView: React.FC = () => {
  const { wishlist, toggleWishlist, addToCart, navigateToPDP, setActiveView, products } = useStore();

  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

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
          <span className="text-[#C9A84C]">Curated Wishlist</span>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#2D2D35] pb-6 mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[#C9A84C] mb-1">
              <span>SAVED ARCHIVES</span>
              <span>•</span>
              <span className="text-[#FAF9F5]">{wishlist.length} Items</span>
            </div>
            <h1 className="font-display-hero text-3xl sm:text-4xl text-[#FAF9F5] tracking-tight">
              Personal Wishlist
            </h1>
            <p className="text-sm font-sans text-[#8E8D94] mt-1">
              Cross-department saved pieces. Move to bag when ready for consolidated dispatch.
            </p>
          </div>
        </div>

        {wishlistProducts.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[#2D2D35] bg-[#141417]">
            <Heart className="w-12 h-12 text-[#8E8D94] mx-auto mb-4 opacity-50" />
            <h3 className="font-display-hero text-2xl text-[#FAF9F5] mb-2">Your Wishlist Is Empty</h3>
            <p className="text-sm text-[#8E8D94] max-w-md mx-auto mb-6 font-sans">
              Explore our 6 departments and save pieces for future curation.
            </p>
            <button
              onClick={() => setActiveView('home')}
              className="bg-[#C9A84C] text-[#0E0E10] px-6 py-3 font-mono text-xs uppercase tracking-widest font-semibold hover:bg-[#d6b75e] transition-colors cursor-pointer"
            >
              Explore Flagship Departments
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlistProducts.map((product) => {
              const dept = DEPARTMENTS[product.department];
              return (
                <div
                  key={product.id}
                  className="bg-[#1A1A1E] border border-[#2D2D35] group flex flex-col justify-between"
                >
                  <div className="relative aspect-square overflow-hidden bg-[#141417]">
                    <img
                      src={product.images.front}
                      alt={product.name}
                      onClick={() => navigateToPDP(product.id)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                    />
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className="absolute top-3 right-3 p-2 bg-[#0E0E10]/80 border border-[#2D2D35] text-[#F43F5E] hover:text-[#DC2626] transition-colors cursor-pointer"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <span
                      className="absolute top-3 left-3 text-[10px] font-mono px-2 py-0.5 border"
                      style={{
                        backgroundColor: '#0E0E10E6',
                        borderColor: dept?.colorAccent || '#C9A84C',
                        color: dept?.colorAccent || '#C9A84C',
                      }}
                    >
                      {dept?.title || product.deptLabel || product.department}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-mono text-[#8E8D94] uppercase tracking-wider mb-1">
                        SKU: {product.sku}
                      </div>
                      <h3
                        onClick={() => navigateToPDP(product.id)}
                        className="font-sans font-medium text-base text-[#FAF9F5] hover:text-[#C9A84C] cursor-pointer transition-colors line-clamp-1"
                      >
                        {product.name}
                      </h3>
                      <p className="text-xs text-[#8E8D94] mt-1 line-clamp-2">{product.tagline || product.description}</p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-[#2D2D35] flex items-center justify-between">
                      <div className="font-mono text-lg font-bold text-[#FAF9F5]">
                        {formatInr(product.price)}
                      </div>
                      <button
                        onClick={() => addToCart(product, 1)}
                        className="flex items-center gap-1.5 bg-[#C9A84C] hover:bg-[#d6b75e] text-[#0E0E10] px-3.5 py-2 font-mono text-[11px] uppercase tracking-wider font-semibold transition-colors cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Move to Bag</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
