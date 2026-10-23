import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Star, ShoppingBag, Heart, ChevronRight, Minus, Plus } from 'lucide-react';
import api from '../lib/api';
import { useCartStore } from '../store/cartStore';
import toast from 'react-hot-toast';

const fmt = (p: number) => '₹' + (p / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 });

const DEPT_ACCENT: Record<string, string> = {
  fashion: '#E02B43', beauty: '#FF3E83', electronics: '#00F0FF',
  home: '#F59E0B', grocery: '#10B981', kids: '#8B5CF6',
};

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { addItem, isLoading } = useCartStore();
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);

  const { data, isLoading: loading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => api.get(`/products/${slug}`).then(r => r.data),
    enabled: !!slug,
  });

  const product = data?.data;
  const dept = product?.department?.slug ?? 'fashion';
  const accent = DEPT_ACCENT[dept] ?? '#E02B43';
  const variants = product?.variants ?? [];
  const selectedVariant = variants.find((v: any) => v.id === selectedVariantId) ?? variants[0];
  const price = selectedVariant?.price ?? product?.basePrice ?? 0;
  const mrp = selectedVariant?.mrp ?? product?.mrp ?? 0;
  const discount = mrp > price ? Math.round((1 - price / mrp) * 100) : 0;
  const available = selectedVariant ? selectedVariant.stock - selectedVariant.reserved : 0;

  // Group variant options by key
  const optionKeys = variants.length > 0
    ? Object.keys(variants[0].options ?? {})
    : [];

  const handleAddToCart = async () => {
    if (!selectedVariant) return toast.error('Please select a variant');
    try {
      await addItem(selectedVariant.id, qty);
      toast.success(`${product.name} added to bag!`);
    } catch (e: any) {
      toast.error(e?.response?.data?.error?.message ?? 'Could not add to bag');
    }
  };

  if (loading) {
    return (
      <div className="px-4 md:px-6 lg:px-12 py-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-[4/5] rounded-xl" style={{ background: '#15171D' }} />
          <div className="space-y-4">
            {[80, 60, 40, 100, 60].map((w, i) => (
              <div key={i} className="h-5 rounded" style={{ background: '#15171D', width: `${w}%` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!product) return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <p style={{ color: '#8e929e', fontFamily: "'Hanken Grotesk',sans-serif" }}>Product not found.</p>
    </div>
  );

  return (
    <div style={{ background: '#0C0D10', minHeight: '100vh' }}>
      <div className="px-4 md:px-6 lg:px-12 py-10 max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-8 font-badge uppercase tracking-wider" style={{ color: '#636466', fontSize: '10px' }}>
          <span>Home</span><ChevronRight size={10} />
          <span>{product.department?.name}</span><ChevronRight size={10} />
          <span style={{ color: accent }}>{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="flex gap-3">
            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div className="flex flex-col gap-2">
                {product.images.map((img: string, i: number) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className="w-16 h-16 rounded overflow-hidden shrink-0"
                    style={{ border: `2px solid ${i === activeImg ? accent : '#232631'}`, background: '#15171D' }}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            {/* Main image */}
            <div className="flex-1 aspect-[4/5] rounded-xl overflow-hidden relative" style={{ background: '#15171D', border: '1px solid #232631' }}>
              {product.images?.[activeImg]
                ? <img src={product.images[activeImg]} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                : <div className="w-full h-full flex items-center justify-center" style={{ color: '#44474a' }}><ShoppingBag size={48} /></div>
              }
              {discount >= 10 && (
                <div className="absolute top-4 right-4 px-3 py-1 rounded font-badge"
                  style={{ background: '#ba012d', color: '#fff', fontSize: '11px' }}>
                  -{discount}%
                </div>
              )}
              <div className="absolute top-4 left-4 px-2 py-1 rounded font-badge uppercase"
                style={{ background: `${accent}20`, border: `1px solid ${accent}40`, color: accent, fontSize: '9px' }}>
                {dept}
              </div>
            </div>
          </div>

          {/* Product info */}
          <div className="flex flex-col gap-5">
            <div>
              <p className="font-badge uppercase tracking-widest" style={{ color: '#8e929e', fontSize: '11px' }}>{product.brand}</p>
              <h1 style={{ fontFamily: "'Bodoni Moda',serif", fontSize: 'clamp(22px,3vw,36px)', fontWeight: 600, color: '#e3e2e6', lineHeight: 1.2, letterSpacing: '-0.015em', marginTop: '8px' }}>
                {product.name}
              </h1>

              {/* Rating */}
              {product.ratingAvg > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} fill={i < Math.round(product.ratingAvg) ? '#F59E0B' : 'none'} stroke={i < Math.round(product.ratingAvg) ? '#F59E0B' : '#636466'} />
                    ))}
                  </div>
                  <span style={{ color: '#8e929e', fontFamily: "'Space Grotesk',sans-serif", fontSize: '13px' }}>
                    {product.ratingAvg.toFixed(1)} ({product.ratingCount} reviews)
                  </span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '32px', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
                {fmt(price)}
              </span>
              {mrp > price && (
                <>
                  <span style={{ color: '#636466', fontSize: '18px', textDecoration: 'line-through' }}>{fmt(mrp)}</span>
                  <span className="px-2 py-0.5 rounded font-badge" style={{ background: '#ba012d', color: '#fff', fontSize: '10px' }}>
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Variant selectors */}
            {optionKeys.map(key => {
              const values = [...new Set(variants.map((v: any) => v.options[key]))];
              return (
                <div key={key}>
                  <p className="font-label-sm uppercase tracking-wider mb-2" style={{ color: '#c5c7c9', fontFamily: "'Space Grotesk',sans-serif", fontSize: '11px' }}>
                    {key}: <span style={{ color: '#e3e2e6' }}>{selectedVariant?.options[key] ?? '—'}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {values.map((val: any) => {
                      const matchingVariant = variants.find((v: any) => v.options[key] === val
                        && (selectedVariantId ? Object.entries(selectedVariant?.options ?? {}).every(([k, v2]) => k === key || v.options[k] === v2) : true));
                      const isSelected = selectedVariant?.options[key] === val;
                      const isOOS = matchingVariant && matchingVariant.stock - matchingVariant.reserved === 0;
                      return (
                        <button key={val}
                          onClick={() => matchingVariant && setSelectedVariantId(matchingVariant.id)}
                          disabled={!matchingVariant}
                          className="px-3 py-1.5 rounded font-label-sm transition-all"
                          style={{
                            fontFamily: "'Space Grotesk',sans-serif", fontSize: '12px', fontWeight: 600,
                            background: isSelected ? accent : '#1f1f23',
                            color: isSelected ? '#0C0D10' : isOOS ? '#44474a' : '#e3e2e6',
                            border: `1px solid ${isSelected ? accent : '#232631'}`,
                            opacity: !matchingVariant ? 0.4 : 1,
                            textDecoration: isOOS ? 'line-through' : 'none',
                          }}>
                          {val}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Stock status */}
            {selectedVariant && (
              <p className="font-badge uppercase tracking-wider"
                style={{ color: available === 0 ? '#ffb4ab' : available <= 3 ? '#F59E0B' : '#10B981', fontSize: '11px' }}>
                {available === 0 ? '✕ Out of Stock' : available <= 3 ? `⚡ Only ${available} left` : '✓ In Stock'}
              </p>
            )}

            {/* Qty + Add to cart */}
            <div className="flex gap-3">
              <div className="flex items-center rounded overflow-hidden" style={{ border: '1px solid #232631' }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-11 flex items-center justify-center" style={{ background: '#1f1f23', color: '#c5c7c9' }}>
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center font-label" style={{ fontFamily: "'Space Grotesk',sans-serif", color: '#e3e2e6' }}>{qty}</span>
                <button onClick={() => setQty(q => Math.min(10, q + 1))} className="w-10 h-11 flex items-center justify-center" style={{ background: '#1f1f23', color: '#c5c7c9' }}>
                  <Plus size={14} />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={isLoading || available === 0}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded font-label transition-all"
                style={{
                  background: available === 0 ? '#1f1f23' : '#fff',
                  color: available === 0 ? '#636466' : '#0C0D10',
                  fontFamily: "'Space Grotesk',sans-serif", fontSize: '14px', fontWeight: 600,
                  cursor: available === 0 ? 'not-allowed' : 'pointer',
                }}>
                <ShoppingBag size={16} />
                {available === 0 ? 'Out of Stock' : 'Add to Bag'}
              </button>
              <button className="w-11 h-11 flex items-center justify-center rounded transition-all"
                style={{ border: '1px solid #232631', color: '#8e929e' }}>
                <Heart size={16} />
              </button>
            </div>

            {/* Description */}
            <div className="pt-4" style={{ borderTop: '1px solid #232631' }}>
              <p style={{ color: '#c5c7c9', fontFamily: "'Hanken Grotesk',sans-serif", fontSize: '15px', lineHeight: '24px' }}>
                {product.description}
              </p>
            </div>

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag: string) => (
                  <span key={tag} className="px-2 py-0.5 rounded font-badge uppercase"
                    style={{ background: '#1f1f23', border: '1px solid #232631', color: '#636466', fontSize: '9px' }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
