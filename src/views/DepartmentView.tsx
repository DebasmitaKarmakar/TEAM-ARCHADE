import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { DEPARTMENTS, PRODUCTS } from '../data/mockData';
import { DepartmentId } from '../types/store';

export const DepartmentView: React.FC = () => {
  const {
    selectedDeptId,
    setSelectedDeptId,
    navigateToPDP,
    addToCart,
    toggleWishlist,
    isInWishlist,
  } = useStore();

  const dept = DEPARTMENTS[selectedDeptId] || DEPARTMENTS.electronics;
  const deptProducts = PRODUCTS.filter((p) => p.department === selectedDeptId);

  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'rating'>('featured');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const categories = Array.from(new Set(deptProducts.map((p) => p.category)));

  const sortedProducts = [...deptProducts]
    .filter((p) => (filterCategory === 'all' ? true : p.category === filterCategory))
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });

  return (
    <div className="flex flex-col w-full text-[#e3e2e6] pb-16">
      {/* Department Hero Banner */}
      <section className="relative w-full px-4 sm:px-8 lg:px-12 py-12 bg-[#121316] border-b border-[#343538] overflow-hidden">
        <div
          className="absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20"
          style={{ backgroundColor: dept.colorAccent }}
        ></div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dept.colorAccent }}></span>
              <span className="font-['Space_Grotesk'] text-[11px] uppercase tracking-widest text-[#8f9194] font-bold">
                {dept.deptNumber} • Flagship Sector
              </span>
            </div>
            <h1
              className="font-['Bodoni_Moda'] text-4xl sm:text-5xl text-white font-normal tracking-tight"
              style={{
                background: `linear-gradient(135deg, #ffffff 0%, ${dept.colorAccent} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {dept.title}
            </h1>
            <p className="font-['Hanken_Grotesk'] text-[16px] text-[#c5c7c9] max-w-xl leading-relaxed">
              {dept.subtitle}
            </p>
          </div>

          {/* Department Metadata Pod */}
          <div className="flex items-center gap-4 bg-[#1b1b1f] p-3 rounded border border-[#343538] font-['Space_Grotesk'] text-[11px]">
            <img src={dept.managerPhoto} alt={dept.manager} className="w-10 h-10 rounded object-cover border border-[#44474a]" />
            <div>
              <span className="text-[#8f9194] uppercase tracking-wider block">Assigned Lead</span>
              <span className="text-white font-bold block">{dept.manager}</span>
              <span className="text-[10px] text-[#7df4ff] font-mono">{dept.managerEmail}</span>
            </div>
            <div className="h-8 w-px bg-[#343538] mx-1"></div>
            <div>
              <span className="text-[#8f9194] uppercase tracking-wider block">Stock Health</span>
              <span className="text-emerald-400 font-bold block">{dept.stockHealth}%</span>
              <span className="text-[10px] text-[#8f9194]">{dept.skuCount}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog Filter Strip */}
      <div className="w-full px-4 sm:px-8 lg:px-12 py-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#292a2d]">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1.5 font-['Space_Grotesk'] text-[12px] font-bold uppercase rounded transition-colors ${
                filterCategory === 'all' ? 'bg-[#292a2d] text-white border border-[#44474a]' : 'bg-[#1b1b1f] text-[#8f9194] hover:text-white'
              }`}
            >
              All Articles ({deptProducts.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 font-['Space_Grotesk'] text-[12px] font-bold uppercase rounded transition-colors whitespace-nowrap ${
                  filterCategory === cat ? 'bg-[#292a2d] text-white border border-[#44474a]' : 'bg-[#1b1b1f] text-[#8f9194] hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            <span className="font-['Space_Grotesk'] text-[11px] uppercase text-[#8f9194]">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#1f1f23] text-white font-['Space_Grotesk'] text-[12px] px-3 py-1.5 rounded border border-[#343538] focus:outline-none cursor-pointer"
            >
              <option value="featured">Featured Curations</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
          {sortedProducts.map((p) => {
            const wishlisted = isInWishlist(p.id);
            return (
              <div
                key={p.id}
                onClick={() => navigateToPDP(p.id)}
                className="group bg-[#1b1b1f] rounded-lg p-4 flex flex-col justify-between hover:bg-[#292a2d] transition-all duration-300 border border-[#343538] cursor-pointer shadow-sm hover:shadow-xl"
              >
                <div>
                  <div className="relative w-full aspect-[4/5] rounded bg-[#292a2d] overflow-hidden mb-4">
                    <img
                      src={p.images.front}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <span className="absolute top-3 left-3 bg-[#121316]/90 backdrop-blur-md px-2 py-0.5 rounded font-['Space_Grotesk'] text-[10px] uppercase font-bold text-white border border-[#343538]">
                      {p.category}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(p.id);
                      }}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#121316]/80 backdrop-blur-md flex items-center justify-center text-white hover:text-[#ba012d] transition-colors border border-[#343538]"
                    >
                      <span
                        className="material-symbols-outlined text-[18px]"
                        style={wishlisted ? { fontVariationSettings: "'FILL' 1", color: '#ffb3b3' } : undefined}
                      >
                        favorite
                      </span>
                    </button>

                    <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(p, 1);
                        }}
                        className="w-full py-2.5 bg-white text-[#121316] font-['Space_Grotesk'] text-[12px] uppercase font-bold rounded flex items-center justify-center gap-1.5 hover:bg-[#ba012d] hover:text-white shadow-xl transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
                        <span>Quick Add to Cart</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[#8f9194] font-['Space_Grotesk'] text-[11px] uppercase mb-1">
                    <span className="flex items-center gap-1 text-[#ffb3b3]">
                      <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        star
                      </span>
                      <span>{p.rating} ({p.reviewsCount} reviews)</span>
                    </span>
                    <span className="font-mono text-[#8f9194]">{p.sku}</span>
                  </div>

                  <h3 className="font-['Bodoni_Moda'] text-[20px] font-semibold text-white group-hover:text-[#7df4ff] transition-colors line-clamp-1">
                    {p.name}
                  </h3>
                  <p className="font-['Hanken_Grotesk'] text-[13px] text-[#c5c7c9] mt-1 line-clamp-2 leading-relaxed">
                    {p.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 flex items-center justify-between border-t border-[#343538]/50">
                  <span className="font-['Space_Grotesk'] text-[20px] font-bold text-white">
                    ${p.price.toFixed(2)}
                  </span>
                  <span className="font-['Space_Grotesk'] text-[10px] text-[#8f9194] uppercase tracking-wider">
                    {p.inStock ? `${p.stockCount} Available` : 'Backorder'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
