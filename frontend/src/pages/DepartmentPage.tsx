import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Star, ShoppingBag } from 'lucide-react';
import api from '../lib/api';
import { useCartStore } from '../store/cartStore';
import toast from 'react-hot-toast';

const DEPT_META: Record<string, { accent: string; bg: string }> = {
  fashion:     { accent: '#E02B43', bg: 'rgba(224,43,67,0.08)' },
  beauty:      { accent: '#FF3E83', bg: 'rgba(255,62,131,0.08)' },
  electronics: { accent: '#00F0FF', bg: 'rgba(0,240,255,0.06)' },
  home:        { accent: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
  grocery:     { accent: '#10B981', bg: 'rgba(16,185,129,0.08)' },
  kids:        { accent: '#8B5CF6', bg: 'rgba(139,92,246,0.08)' },
};

const fmt = (p: number) => '₹' + (p / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 });

export default function DepartmentPage() {
  const { slug } = useParams<{ slug: string }>();
  const meta = DEPT_META[slug ?? 'fashion'] ?? DEPT_META.fashion;
  const { addItem } = useCartStore();

  const { data, isLoading } = useQuery({
    queryKey: ['products', 'dept', slug],
    queryFn: () => api.get(`/products?dept=${slug}&limit=24`).then(r => r.data),
    enabled: !!slug,
  });

  const { data: deptData } = useQuery({
    queryKey: ['department', slug],
    queryFn: () => api.get(`/departments/${slug}`).then(r => r.data),
    enabled: !!slug,
  });

  const dept = deptData?.data;
  const products = data?.data?.items ?? [];

  return (
    <div style={{ background: '#0C0D10', minHeight: '100vh' }}>
      {/* Department hero */}
      <div className="px-4 md:px-6 lg:px-12 py-12 relative overflow-hidden"
        style={{ borderBottom: '1px solid #232631' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 0% 50%, ${meta.accent}15 0%, transparent 60%)` }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
            style={{ background: meta.bg, border: `1px solid ${meta.accent}40` }}>
            <div className="w-2 h-2 rounded-full" style={{ background: meta.accent }} />
            <span className="font-badge uppercase tracking-widest" style={{ color: meta.accent, fontSize: '10px' }}>Department</span>
          </div>
          <h1 style={{ fontFamily: "'Bodoni Moda',serif", fontSize: 'clamp(32px,5vw,56px)', fontWeight: 600, color: '#e3e2e6', letterSpacing: '-0.02em' }}>
            {dept?.name ?? slug?.charAt(0).toUpperCase() + (slug?.slice(1) ?? '')}
          </h1>
          {dept?.tagline && (
            <p style={{ color: '#8e929e', fontFamily: "'Hanken Grotesk',sans-serif", fontSize: '18px', marginTop: '8px' }}>
              {dept.tagline}
            </p>
          )}
        </div>
      </div>

      {/* Product grid */}
      <div className="px-4 md:px-6 lg:px-12 py-10 max-w-7xl mx-auto">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-lg animate-pulse" style={{ background: '#15171D', border: '1px solid #232631', height: '320px' }} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p: any) => (
              <div key={p.id} className="group rounded-lg overflow-hidden flex flex-col transition-all duration-200"
                style={{ background: '#15171D', border: '1px solid #232631' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${meta.accent}44`; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#232631'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}>
                <div className="relative aspect-[4/5] overflow-hidden" style={{ background: '#1f1f23' }}>
                  {p.images?.[0]
                    ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="w-full h-full flex items-center justify-center" style={{ color: '#44474a' }}><ShoppingBag size={32} /></div>
                  }
                  {Math.round((1 - p.basePrice / p.mrp) * 100) >= 10 && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded font-badge"
                      style={{ background: '#ba012d', color: '#fff', fontSize: '9px' }}>
                      -{Math.round((1 - p.basePrice / p.mrp) * 100)}%
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: 'linear-gradient(to top, rgba(12,13,16,0.95), transparent)' }}>
                    <button className="w-full py-2 rounded font-label-sm"
                      style={{ background: '#fff', color: '#0C0D10', fontFamily: "'Space Grotesk',sans-serif", fontSize: '11px', fontWeight: 600 }}
                      onClick={async () => {
                        try { await addItem(p.id, 1); toast.success(`${p.name} added!`); }
                        catch { toast.error('Choose a variant on product page'); }
                      }}>
                      Quick Add
                    </button>
                  </div>
                </div>
                <Link to={`/products/${p.slug}`} className="p-3 flex flex-col flex-1">
                  <p className="font-badge uppercase" style={{ color: '#8e929e', fontSize: '10px' }}>{p.brand}</p>
                  <p className="font-title line-clamp-2" style={{ fontFamily: "'Bodoni Moda',serif", fontSize: '14px', color: '#e3e2e6', marginTop: '2px' }}>{p.name}</p>
                  {p.ratingAvg > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <Star size={11} fill="#F59E0B" stroke="none" />
                      <span style={{ color: '#8e929e', fontSize: '10px' }}>{p.ratingAvg.toFixed(1)}</span>
                    </div>
                  )}
                  <div className="flex items-baseline gap-2 mt-auto pt-2">
                    <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '16px', fontWeight: 700, color: '#fff' }}>{fmt(p.basePrice)}</span>
                    {p.mrp > p.basePrice && <span style={{ color: '#636466', fontSize: '12px', textDecoration: 'line-through' }}>{fmt(p.mrp)}</span>}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
