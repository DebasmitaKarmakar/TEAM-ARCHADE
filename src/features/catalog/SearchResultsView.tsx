import React, { useMemo, useState } from 'react';
import { Search, SlidersHorizontal, Star, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { DEPARTMENTS } from '../../data/mockData';
import { DepartmentId } from '../../types/store';
import { formatInr } from '../../lib/currency';

type PriceBand = 'all' | 'under100' | '100to200' | 'over200';

export const SearchResultsView: React.FC = () => {
  const { products, catalogStatus, searchQuery, setSearchQuery, navigateToPDP, addToCart, toggleWishlist, isInWishlist, setActiveView } = useStore();
  const [departments, setDepartments] = useState<DepartmentId[]>([]);
  const [priceBand, setPriceBand] = useState<PriceBand>('all');
  const [minimumRating, setMinimumRating] = useState(0);
  const [isFiltersOpen, setFiltersOpen] = useState(false);

  const categories = useMemo(
    () => Array.from(new Set(products.filter((product) => catalogStatus[product.id] === 'live').map((product) => product.category))).sort(),
    [catalogStatus, products]
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const results = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return products.filter((product) => {
      const matchesQuery = !normalizedQuery || [product.name, product.sku, product.category, product.deptLabel, product.description]
        .some((value) => value.toLowerCase().includes(normalizedQuery));
      const matchesDepartment = departments.length === 0 || departments.includes(product.department);
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
      const matchesRating = product.rating >= minimumRating;
      const matchesPrice = priceBand === 'all'
        || (priceBand === 'under100' && product.price < 100)
        || (priceBand === '100to200' && product.price >= 100 && product.price <= 200)
        || (priceBand === 'over200' && product.price > 200);
      return catalogStatus[product.id] === 'live' && matchesQuery && matchesDepartment && matchesCategory && matchesRating && matchesPrice;
    });
  }, [catalogStatus, departments, minimumRating, priceBand, products, searchQuery, selectedCategories]);

  const toggleDepartment = (department: DepartmentId) => {
    setDepartments((previous) => previous.includes(department) ? previous.filter((item) => item !== department) : [...previous, department]);
  };
  const toggleCategory = (category: string) => {
    setSelectedCategories((previous) => previous.includes(category) ? previous.filter((item) => item !== category) : [...previous, category]);
  };
  const resetFilters = () => {
    setDepartments([]);
    setSelectedCategories([]);
    setPriceBand('all');
    setMinimumRating(0);
  };

  const filterControls = (
    <aside className="space-y-6" aria-label="Search filters">
      <div className="flex items-center justify-between border-b border-[#2D2D35] pb-3">
        <h2 className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-[#FAF9F5]"><SlidersHorizontal className="h-4 w-4 text-[#C9A84C]" /> Filters</h2>
        <button id="search-reset-filters" type="button" onClick={resetFilters} className="text-[10px] font-mono uppercase text-[#C9A84C] hover:underline">Reset</button>
      </div>

      <fieldset>
        <legend className="mb-3 font-mono text-[10px] uppercase tracking-wider text-[#8E8D94]">Department</legend>
        <div className="space-y-2">
          {(Object.keys(DEPARTMENTS) as DepartmentId[]).map((id) => (
            <label key={id} className="flex min-h-8 cursor-pointer items-center gap-2 text-xs text-[#E8E8E8]">
              <input id={`search-department-${id}`} type="checkbox" checked={departments.includes(id)} onChange={() => toggleDepartment(id)} className="accent-[#C9A84C]" />
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: DEPARTMENTS[id].colorAccent }} />
              {DEPARTMENTS[id].title}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 font-mono text-[10px] uppercase tracking-wider text-[#8E8D94]">Price (catalogue value)</legend>
        <div className="space-y-2">
          {([['all', 'Any price'], ['under100', `Under ${formatInr(100)}`], ['100to200', `${formatInr(100)} – ${formatInr(200)}`], ['over200', `Above ${formatInr(200)}`]] as Array<[PriceBand, string]>).map(([value, label]) => (
            <label key={value} className="flex min-h-8 cursor-pointer items-center gap-2 text-xs text-[#E8E8E8]">
              <input id={`search-price-${value}`} type="radio" name="search-price" checked={priceBand === value} onChange={() => setPriceBand(value)} className="accent-[#C9A84C]" /> {label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 font-mono text-[10px] uppercase tracking-wider text-[#8E8D94]">Rating</legend>
        {[0, 4, 4.5].map((rating) => (
          <label key={rating} className="mb-2 flex min-h-8 cursor-pointer items-center gap-2 text-xs text-[#E8E8E8]">
            <input id={`search-rating-${rating}`} type="radio" name="search-rating" checked={minimumRating === rating} onChange={() => setMinimumRating(rating)} className="accent-[#C9A84C]" />
            {rating === 0 ? 'Any rating' : `${rating}+ stars`}
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend className="mb-3 font-mono text-[10px] uppercase tracking-wider text-[#8E8D94]">Category</legend>
        <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
          {categories.map((category) => (
            <label key={category} className="flex min-h-8 cursor-pointer items-center gap-2 text-xs text-[#E8E8E8]">
              <input id={`search-category-${category.replaceAll(' ', '-').toLowerCase()}`} type="checkbox" checked={selectedCategories.includes(category)} onChange={() => toggleCategory(category)} className="accent-[#C9A84C]" /> {category}
            </label>
          ))}
        </div>
      </fieldset>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#0E0E10] py-8 text-[#E8E8E8] sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-[#2D2D35] pb-6">
          <button id="search-back-storefront" type="button" onClick={() => setActiveView('home')} className="mb-4 font-mono text-[10px] uppercase tracking-wider text-[#8E8D94] hover:text-[#FAF9F5]">← Storefront</button>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#C9A84C]">Unified Catalogue Discovery</p>
              <h1 className="font-display-hero text-3xl text-[#FAF9F5] sm:text-4xl">Search every department.</h1>
            </div>
            <label className="flex min-h-11 w-full max-w-xl items-center gap-2 border border-[#3E3E47] bg-[#141417] px-3 focus-within:border-[#C9A84C]">
              <Search className="h-4 w-4 text-[#C9A84C]" />
              <input id="search-results-input" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Try “studio”, “skincare”, or an SKU" className="w-full bg-transparent text-sm text-[#FAF9F5] outline-none placeholder:text-[#8E8D94]" />
              {searchQuery && <button id="clear-search-query" type="button" onClick={() => setSearchQuery('')} aria-label="Clear search" className="text-[#8E8D94] hover:text-[#FAF9F5]"><X className="h-4 w-4" /></button>}
            </label>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between lg:hidden">
          <span className="text-xs text-[#8E8D94]">{results.length} results</span>
          <button id="open-mobile-search-filters" type="button" onClick={() => setFiltersOpen(true)} className="min-h-11 border border-[#3E3E47] px-3 font-mono text-xs uppercase text-[#FAF9F5]"><SlidersHorizontal className="mr-2 inline h-4 w-4 text-[#C9A84C]" />Filters</button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[15rem_minmax(0,1fr)]">
          <div className="hidden border-r border-[#2D2D35] pr-6 lg:block">{filterControls}</div>
          <section aria-live="polite">
            <p className="mb-5 text-sm text-[#8E8D94]"><span className="font-semibold text-[#FAF9F5]">{results.length}</span> articles found{searchQuery ? ` for “${searchQuery}”` : ''}.</p>
            {results.length === 0 ? (
              <div className="border border-dashed border-[#3E3E47] bg-[#1A1A1E] p-10 text-center"><Search className="mx-auto mb-3 h-7 w-7 text-[#C9A84C]" /><h2 className="font-display-hero text-2xl text-[#FAF9F5]">Nothing in this edit yet.</h2><p className="mt-2 text-sm text-[#8E8D94]">Broaden your filters or try a different search phrase.</p><button id="empty-search-reset" type="button" onClick={resetFilters} className="mt-5 min-h-11 bg-[#C9A84C] px-4 font-mono text-xs font-bold uppercase text-[#0E0E10]">Clear filters</button></div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {results.map((product) => (
                  <article key={product.id} className="group border border-[#2D2D35] bg-[#1A1A1E] p-3 transition-colors hover:border-[#C9A84C]">
                    <button id={`search-product-${product.id}`} type="button" onClick={() => navigateToPDP(product.id)} className="relative block w-full overflow-hidden bg-[#141417] text-left"><img src={product.images.front} alt={product.name} loading="lazy" className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-105" /><span className="absolute left-2 top-2 border border-[#FAF9F5]/20 bg-[#0E0E10]/85 px-2 py-1 font-mono text-[9px] uppercase text-[#FAF9F5]">{DEPARTMENTS[product.department].title}</span></button>
                    <div className="pt-3"><div className="flex items-center justify-between gap-2 text-[11px] text-[#8E8D94]"><span className="flex items-center gap-1 text-[#C9A84C]"><Star className="h-3 w-3 fill-current" />{product.rating} ({product.reviewsCount})</span><span>{product.sku}</span></div><button type="button" onClick={() => navigateToPDP(product.id)} className="mt-2 line-clamp-2 text-left font-display-hero text-lg text-[#FAF9F5] hover:text-[#C9A84C]">{product.name}</button><div className="mt-4 flex items-center justify-between border-t border-[#2D2D35] pt-3"><span className="font-mono text-base font-bold text-[#FAF9F5]">{formatInr(product.price)}</span><div className="flex gap-2"><button id={`search-wishlist-${product.id}`} type="button" onClick={() => toggleWishlist(product.id)} className="min-h-9 border border-[#3E3E47] px-2 text-[#FAF9F5] hover:border-[#C9A84C]" aria-label="Toggle wishlist">{isInWishlist(product.id) ? '♥' : '♡'}</button><button id={`search-add-${product.id}`} type="button" onClick={() => addToCart(product)} className="min-h-9 bg-[#C9A84C] px-2 font-mono text-[10px] font-bold uppercase text-[#0E0E10]">Add</button></div></div></div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {isFiltersOpen && <div className="fixed inset-0 z-[55] bg-[#0E0E10]/90 p-4 lg:hidden"><div className="ml-auto h-full max-w-sm overflow-y-auto border border-[#3E3E47] bg-[#1A1A1E] p-5"><div className="mb-5 flex justify-end"><button id="close-mobile-search-filters" type="button" onClick={() => setFiltersOpen(false)} className="min-h-11 px-2 text-[#FAF9F5]"><X className="h-5 w-5" /></button></div>{filterControls}<button id="apply-mobile-search-filters" type="button" onClick={() => setFiltersOpen(false)} className="mt-6 min-h-11 w-full bg-[#C9A84C] font-mono text-xs font-bold uppercase text-[#0E0E10]">Show {results.length} results</button></div></div>}
    </div>
  );
};
