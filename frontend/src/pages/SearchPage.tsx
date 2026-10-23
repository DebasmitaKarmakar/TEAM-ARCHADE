import { useQuery } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Star, ShoppingBag } from 'lucide-react';
import api from '../lib/api';
import { useCartStore } from '../store/cartStore';
import toast from 'react-hot-toast';

const fmt = (p: number) => '₹' + (p / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 });

const DEPT_ACCENTS: Record<string, string> = {
  fashion: '#E02B43', beauty: '#FF3E83', electronics: '#00F0FF',
  home: '#F59E0B', grocery: '#10B981', kids: '#8B5CF6',
};

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'top_rated', label: 'Top Rated' },
  { value: 'newest', label: 'Newest' },
  { value: 'discount', label: 'Biggest Discount' },
];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [q, setQ] = useState(searchParams.get('q') ?? '');
  const { addItem } = useCartStore();

  const params = {
    q: searchParams.get('q') ?? '',
    dept: searchParams.get('dept') ?? '',
    sort: searchParams.get('sort') ?? 'relevance',
    page: searchParams.get('page') ?? '1',
  };

  const { data, isLoading } = useQuery({
    queryKey: ['search', params],
    queryFn: () => {
      const p = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v)));
      return api.get(`/search?${p}`).then(r => r.data);
    },
  });

  const items = data?.data?.items ?? [];
  const facets = data?.data?.facets ?? {};
  const total = data?.data?.total ?? 0;

  useEffect(() => { setQ(searchParams.get('q') ?? ''); }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(p => { p.set('q', q); p.set('page', '1'); return p; });
  };

  return (
    <div style={{ background: '#0C0D10', minHeight: '100vh' }}>
      {/* Search bar */}
      <div className="px-4 md:px-6 lg:px-12 py-6" style={{ borderBottom: '1px solid #232631' }}>
        <div className="max-w-7xl mx-auto">
          <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl">
            <div className="flex-1 flex items-center rounded-lg overflow-hidden" style={{ background: '#1f1f23', border: '1px solid #232631' }}>
              <Search size={16} className="ml-4 shrink-0" style={{ color: '#636466' }} />
              <input type="text" value={q} onChange={e => setQ(e.target.value)}
                placeholder="Search across all departments..."
                className="flex-1 px-3 py-3 bg-transparent outline-none"
                style={{ color: '#e3e2e6', fontFamily: "'Hanken Grotesk',sans-serif", fontSize: '15px' }}
              />
            </div>
            <button type="submit" className="px-6 py-3 rounded font-label"
              style={{ background: '#fff', color: '#0C0D10', fontFamily: "'Space Grotesk',sans-serif", fontSize: '13px', fontWeight: 600 }}>
              Search
            </button>
          </form>
          {params.q && (
            <p className="mt-2 font-body-sm" style={{ color: '#8e929e', fontSize: '13px' }}>
              {total.toLocaleString()} results for "{params.q}"
            </p>
          )}
        </div>
      </div>

      <div className="px-4 md:px-6 lg:px-12 py-6 max-w-7xl mx-auto flex gap-8">
        {/* Sidebar filters */}
        <aside className="hidden lg:flex flex-col gap-6 w-52 shrink-0">
          {/* Sort */}
          <div>
            <p className="font-badge uppercase tracking-widest mb-3" style={{ color: '#636466', fontSize: '10px' }}>Sort By</p>
            <div className="space-y-1">
              {SORT_OPTIONS.map(opt => (
                <button key={opt.value}
                  onClick={() => setSearchParams(p => { p.set('sort', opt.value); return p; })}
                  className="w-full text-left px-3 py-2 rounded font-body-sm transition-colors"
                  style={{
                    background: params.sort === opt.value ? '#1f1f23' : 'transparent',
                    color: params.sort === opt.value ? '#e3e2e6' : '#8e929e',
                    fontFamily: "'Hanken Grotesk',sans-serif", fontSize: '13px',
                    border: params.sort === opt.value ? '1px solid #232631' : '1px solid transparent',
                  }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Department facets */}
          {facets.departments?.length > 0 && (
            <div>
              <p className="font-badge uppercase tracking-widest mb-3" style={{ color: '#636466', fontSize: '10px' }}>Department</p>
              <div className="space-y-1">
                {facets.departments.map((f: any) => {
                  const accent = DEPT_ACCENTS[f.slug] ?? '#E02B43';
                  const isActive = params.dept === f.slug;
                  return (
                    <button key={f.slug}
                      onClick={() => setSearchParams(p => { isActive ? p.delete('dept') : p.set('dept', f.slug); p.set('page', '1'); return p; })}
                      className="w-full flex items-center justify-between px-3 py-2 rounded transition-colors"
                      style={{ background: isActive ? `${accent}15` : 'transparent', border: isActive ? `1px solid ${accent}40` : '1px solid transparent' }}>
                      <span style={{ color: isActive ? accent : '#8e929e', fontFamily: "'Space Grotesk',sans-serif", fontSize: '12px', fontWeight: 600 }}>{f.name}</span>
                      <span className="font-badge" style={{ color: '#636466', fontSize: '10px' }}>{f.count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {/* Mobile sort */}
          <div className="flex items-center gap-2 mb-4 lg:hidden">
            <SlidersHorizontal size={14} style={{ color: '#8e929e' }} />
            <select value={params.sort} onChange={e => setSearchParams(p => { p.set('sort', e.target.value); return p; })}
              className="flex-1 px-3 py-2 rounded outline-none"
              style={{ background: '#1f1f23', border: '1px solid #232631', color: '#e3e2e6', fontFamily: "'Space Grotesk',sans-serif", fontSize: '12px' }}>
              {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-lg animate-pulse" style={{ background: '#15171D', border: '1px solid #232631', height: '280px' }} />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Search size={48} style={{ color: '#44474a' }} />
              <p style={{ color: '#8e929e', fontFamily: "'Hanken Grotesk',sans-serif" }}>No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {items.map((p: any) => {
                const dept = p.department?.slug ?? 'fashion';
                const accent = DEPT_ACCENTS[dept] ?? '#E02B43';
                return (
                  <div key={p.id} className="group rounded-lg overflow-hidden flex flex-col transition-all duration-200"
                    style={{ background: '#15171D', border: '1px solid #232631' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${accent}44`; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#232631'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}>
                    <div className="relative aspect-[4/5] overflow-hidden" style={{ background: '#1f1f23' }}>
                      {p.images?.[0]
                        ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        : <div className="w-full h-full flex items-center justify-center" style={{ color: '#44474a' }}><ShoppingBag size={32} /></div>
                      }
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded font-badge uppercase"
                        style={{ background: `${accent}20`, border: `1px solid ${accent}40`, color: accent, fontSize: '9px' }}>
                        {dept}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: 'linear-gradient(to top, rgba(12,13,16,0.95), transparent)' }}>
                        <button className="w-full py-1.5 rounded font-badge uppercase"
                          style={{ background: '#fff', color: '#0C0D10', fontFamily: "'Space Grotesk',sans-serif", fontSize: '10px', fontWeight: 600 }}
                          onClick={async () => {
                            try { await addItem(p.id, 1); toast.success('Added to bag!'); }
                            catch { toast.error('Select variant on product page'); }
                          }}>
                          Quick Add
                        </button>
                      </div>
                    </div>
                    <Link to={`/products/${p.slug}`} className="p-3 flex flex-col flex-1">
                      <p style={{ color: '#8e929e', fontFamily: "'Space Grotesk',sans-serif", fontSize: '10px', textTransform: 'uppercase' }}>{p.brand}</p>
                      <p style={{ fontFamily: "'Bodoni Moda',serif", fontSize: '14px', color: '#e3e2e6', marginTop: '2px' }} className="line-clamp-2">{p.name}</p>
                      {p.ratingAvg > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star size={10} fill="#F59E0B" stroke="none" />
                          <span style={{ color: '#8e929e', fontSize: '10px' }}>{p.ratingAvg.toFixed(1)}</span>
                        </div>
                      )}
                      <div className="flex items-baseline gap-2 mt-auto pt-2">
                        <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '15px', fontWeight: 700, color: '#fff' }}>{fmt(p.basePrice)}</span>
                        {p.mrp > p.basePrice && <span style={{ color: '#636466', fontSize: '12px', textDecoration: 'line-through' }}>{fmt(p.mrp)}</span>}
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
