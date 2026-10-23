import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Star } from 'lucide-react';
import api from '../lib/api';
import { useCartStore } from '../store/cartStore';
import toast from 'react-hot-toast';

const DEPARTMENTS = [
  { slug: 'fashion',     name: 'Fashion',       tagline: 'Dressed for every chapter.',      accent: '#E02B43', bg: 'rgba(224,43,67,0.08)'   },
  { slug: 'beauty',      name: 'Beauty',         tagline: 'Glow, on your terms.',            accent: '#FF3E83', bg: 'rgba(255,62,131,0.08)'  },
  { slug: 'electronics', name: 'Electronics',    tagline: 'Plugged into tomorrow.',          accent: '#00F0FF', bg: 'rgba(0,240,255,0.06)'   },
  { slug: 'home',        name: 'Home & Living',  tagline: 'Make it feel like yours.',        accent: '#F59E0B', bg: 'rgba(245,158,11,0.08)'  },
  { slug: 'grocery',     name: 'Grocery',        tagline: 'Fresh, fast, every day.',         accent: '#10B981', bg: 'rgba(16,185,129,0.08)' },
  { slug: 'kids',        name: 'Kids & Toys',    tagline: 'Big fun for little people.',      accent: '#8B5CF6', bg: 'rgba(139,92,246,0.08)'  },
];

const fmt = (p: number) => '₹' + (p / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 });
const fmtMRP = (p: number) => '₹' + (p / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 });

interface Product { id: string; slug: string; name: string; brand: string; images: string[]; basePrice: number; mrp: number; ratingAvg: number; department: { slug: string }; }

function ProductCard({ product }: { product: Product }) {
  const dept = product.department?.slug ?? 'fashion';
  const accent = DEPARTMENTS.find(d => d.slug === dept)?.accent ?? '#E02B43';
  const { addItem } = useCartStore();
  const discount = Math.round((1 - product.basePrice / product.mrp) * 100);

  return (
    <div
      className="group relative rounded-lg overflow-hidden flex flex-col transition-all duration-200"
      style={{ background: '#15171D', border: '1px solid #232631' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${accent}44`; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#232631'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
    >
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden" style={{ background: '#1f1f23' }}>
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ color: '#44474a' }}>
            <Zap size={32} />
          </div>
        )}
        {/* Dept tag */}
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded font-badge uppercase"
          style={{ background: `${accent}20`, border: `1px solid ${accent}40`, color: accent, fontSize: '9px' }}>
          {dept}
        </div>
        {/* Discount badge */}
        {discount >= 10 && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded font-badge"
            style={{ background: '#ba012d', color: '#fff', fontSize: '9px' }}>
            -{discount}%
          </div>
        )}
        {/* Quick add overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ background: 'linear-gradient(to top, rgba(12,13,16,0.95) 0%, transparent 100%)' }}>
          <button
            className="w-full py-2 rounded font-label-sm uppercase tracking-wider transition-colors"
            style={{ background: '#fff', color: '#0C0D10', fontFamily: "'Space Grotesk',sans-serif", fontSize: '11px', fontWeight: 600 }}
            onClick={async (e) => {
              e.preventDefault();
              try {
                await addItem(product.id, 1);
                toast.success(`${product.name} added to bag`);
              } catch { toast.error('Select a variant'); }
            }}
          >
            Quick Add
          </button>
        </div>
      </div>

      {/* Content */}
      <Link to={`/products/${product.slug}`} className="flex flex-col p-3 flex-1">
        <p className="font-badge uppercase tracking-wider" style={{ color: '#8e929e', fontSize: '10px' }}>{product.brand}</p>
        <p className="font-title mt-0.5 line-clamp-2" style={{ fontFamily: "'Bodoni Moda',serif", fontSize: '14px', color: '#e3e2e6', lineHeight: '1.3' }}>
          {product.name}
        </p>
        {product.ratingAvg > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <Star size={11} fill="#F59E0B" stroke="none" />
            <span className="font-badge" style={{ color: '#8e929e', fontSize: '10px' }}>{product.ratingAvg.toFixed(1)}</span>
          </div>
        )}
        <div className="flex items-baseline gap-2 mt-auto pt-2">
          <span className="font-price" style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '16px', fontWeight: 700, color: '#fff' }}>
            {fmt(product.basePrice)}
          </span>
          {product.mrp > product.basePrice && (
            <span className="font-body-sm line-through" style={{ color: '#636466', fontSize: '12px' }}>{fmtMRP(product.mrp)}</span>
          )}
        </div>
      </Link>
    </div>
  );
}

export default function HomePage() {
  const { data: featuredData } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => api.get('/products?sort=top_rated&limit=12').then(r => r.data),
  });

  const products: Product[] = featuredData?.data?.items ?? [];

  return (
    <div style={{ background: '#0C0D10', minHeight: '100vh' }}>
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden px-4 md:px-6 lg:px-12 py-16 lg:py-24">
        {/* Ambient glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'rgba(186,1,45,0.15)', filter: 'blur(120px)' }} />
        <div className="absolute top-1/2 -right-32 w-[32rem] h-[32rem] rounded-full pointer-events-none"
          style={{ background: 'rgba(0,219,233,0.08)', filter: 'blur(140px)' }} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-7xl mx-auto">
          {/* Left */}
          <div className="lg:col-span-7 flex flex-col gap-6 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full w-fit"
              style={{ background: '#1f1f23', border: '1px solid #232631' }}>
              <span className="w-2 h-2 rounded-full pulse-glow" style={{ background: '#ba012d' }} />
              <span className="font-badge uppercase tracking-widest" style={{ color: '#8e929e', fontSize: '10px' }}>
                The Unified Flagship Model
              </span>
            </div>

            <h1 className="font-display gradient-text"
              style={{ fontFamily: "'Bodoni Moda',serif", fontSize: 'clamp(36px, 6vw, 68px)', fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.02em' }}>
              The Universal{' '}
              <em style={{ fontStyle: 'italic', fontWeight: 300 }}>Department</em>{' '}
              Store.
            </h1>

            <p style={{ color: '#c5c7c9', fontFamily: "'Hanken Grotesk',sans-serif", fontSize: '18px', lineHeight: '28px', maxWidth: '540px' }}>
              Curated fashion, beauty, precision tech, fresh groceries — pooled into one cart, one box, one checkout.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/search?sort=relevance"
                className="flex items-center gap-2 px-6 py-3 rounded font-label transition-all group"
                style={{ background: '#fff', color: '#0C0D10', fontFamily: "'Space Grotesk',sans-serif", fontSize: '14px', fontWeight: 600 }}
              >
                Shop Multi-Department Edit
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="#departments"
                className="flex items-center gap-2 px-6 py-3 rounded font-label transition-all"
                style={{ background: '#1f1f23', border: '1px solid #232631', color: '#e3e2e6', fontFamily: "'Space Grotesk',sans-serif", fontSize: '14px', fontWeight: 600 }}
              >
                Department Directory
              </Link>
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: '6 Flagships', label: 'Unified In One Cart' },
                { value: 'Single Box', label: 'Zero Split Deliveries' },
                { value: '73 Products', label: 'Curated SKUs' },
              ].map(stat => (
                <div key={stat.label} className="p-3 rounded" style={{ background: '#1f1f23', border: '1px solid #232631' }}>
                  <p className="font-price" style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '16px', fontWeight: 700, color: '#fff' }}>{stat.value}</p>
                  <p className="font-badge uppercase tracking-wider" style={{ color: '#636466', fontSize: '9px' }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — hero visual */}
          <div className="lg:col-span-5 relative hidden lg:block">
            <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden" style={{ background: '#15171D', border: '1px solid #232631' }}>
              <img
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80&auto=format"
                alt="Blowmaggy Editorial"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(12,13,16,0.85) 0%, transparent 60%)' }} />
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-lg" style={{ background: 'rgba(12,13,16,0.9)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-badge uppercase tracking-wider" style={{ color: '#636466', fontSize: '9px' }}>Autumn Atelier Edit</p>
                    <p className="font-title" style={{ fontFamily: "'Bodoni Moda',serif", fontSize: '16px', color: '#e3e2e6' }}>Curated by Blowmaggy</p>
                  </div>
                  <span className="font-price" style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '18px', fontWeight: 700, color: '#ffb3b3' }}>₹3,995</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Department Grid ── */}
      <section id="departments" className="px-4 md:px-6 lg:px-12 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-baseline justify-between mb-8">
            <h2 style={{ fontFamily: "'Bodoni Moda',serif", fontSize: '32px', fontWeight: 600, color: '#e3e2e6', letterSpacing: '-0.015em' }}>
              Six Departments. One Cart.
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {DEPARTMENTS.map(dept => (
              <Link
                key={dept.slug}
                to={`/departments/${dept.slug}`}
                className="group flex flex-col items-center gap-3 p-4 rounded-lg transition-all duration-200"
                style={{ background: '#15171D', border: `1px solid #232631` }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = dept.bg; (e.currentTarget as HTMLElement).style.borderColor = `${dept.accent}40`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#15171D'; (e.currentTarget as HTMLElement).style.borderColor = '#232631'; }}
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: `${dept.accent}15`, border: `1px solid ${dept.accent}30` }}>
                  <div className="w-3 h-3 rounded-full" style={{ background: dept.accent }} />
                </div>
                <div className="text-center">
                  <p className="font-label-sm uppercase tracking-wider" style={{ color: '#e3e2e6', fontFamily: "'Space Grotesk',sans-serif", fontSize: '11px', fontWeight: 600 }}>{dept.name}</p>
                  <p className="font-body-sm mt-0.5" style={{ color: '#636466', fontSize: '11px' }}>{dept.tagline}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section id="featured-products" className="px-4 md:px-6 lg:px-12 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 style={{ fontFamily: "'Bodoni Moda',serif", fontSize: '32px', fontWeight: 600, color: '#e3e2e6', letterSpacing: '-0.015em' }}>
              Top Picks
            </h2>
            <Link to="/search?sort=top_rated"
              className="flex items-center gap-1 font-label-sm uppercase tracking-wider transition-colors"
              style={{ color: '#8e929e', fontFamily: "'Space Grotesk',sans-serif", fontSize: '12px' }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>
          {products.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-lg overflow-hidden animate-pulse" style={{ background: '#15171D', border: '1px solid #232631' }}>
                  <div className="aspect-[4/5]" style={{ background: '#1f1f23' }} />
                  <div className="p-3 space-y-2">
                    <div className="h-3 rounded" style={{ background: '#232631', width: '60%' }} />
                    <div className="h-4 rounded" style={{ background: '#232631' }} />
                    <div className="h-4 rounded" style={{ background: '#232631', width: '40%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── Maggy+ Banner ── */}
      <section className="px-4 md:px-6 lg:px-12 py-12">
        <div className="max-w-7xl mx-auto rounded-xl p-8 md:p-12 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1a0a1e 0%, #0a1130 100%)', border: '1px solid rgba(139,92,246,0.3)' }}>
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: 'rgba(139,92,246,0.15)', filter: 'blur(60px)' }} />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3"
                style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}>
                <Zap size={12} style={{ color: '#8B5CF6' }} />
                <span className="font-badge uppercase" style={{ color: '#8B5CF6', fontSize: '10px' }}>Maggy+ Membership</span>
              </div>
              <h2 style={{ fontFamily: "'Bodoni Moda',serif", fontSize: '28px', fontWeight: 600, color: '#e3e2e6' }}>
                10% off everything. Every time.
              </h2>
              <p style={{ color: '#8e929e', fontFamily: "'Hanken Grotesk',sans-serif", marginTop: '8px' }}>
                Free delivery · Members-only coupons · Early access to new arrivals
              </p>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <div className="flex gap-3">
                <div className="text-center px-4 py-3 rounded-lg" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
                  <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '20px', fontWeight: 700, color: '#fff' }}>₹99</p>
                  <p className="font-badge uppercase" style={{ color: '#8B5CF6', fontSize: '9px' }}>/ month</p>
                </div>
                <div className="text-center px-4 py-3 rounded-lg" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
                  <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '20px', fontWeight: 700, color: '#fff' }}>₹799</p>
                  <p className="font-badge uppercase" style={{ color: '#8B5CF6', fontSize: '9px' }}>/ year</p>
                </div>
              </div>
              <button className="w-full py-3 rounded font-label transition-all"
                style={{ background: '#8B5CF6', color: '#fff', fontFamily: "'Space Grotesk',sans-serif", fontSize: '14px', fontWeight: 600 }}>
                Join Maggy+
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
