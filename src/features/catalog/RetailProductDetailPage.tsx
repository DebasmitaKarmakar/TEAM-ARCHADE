import React, { useEffect, useMemo, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types/store';
import { ReviewSection } from '../../components/catalog/ReviewSection';
import { formatInr } from '../../lib/currency';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85';

const productImages = (product: Product) =>
  Array.from(new Set([product.images.front, product.images.oblique, product.images.chamber, product.images.case, product.images.model].filter(Boolean) as string[]));

type ProductInformation = {
  heading: string;
  icon: string;
  details: Array<{ label: string; value: string }>;
  note: string;
};

const getProductInformation = (product: Product): ProductInformation => {
  if (product.pharmacyInfo) {
    return {
      heading: 'Pharmacy information',
      icon: 'medical_information',
      details: [
        { label: 'Manufactured', value: product.pharmacyInfo.manufactured },
        { label: 'Expiry / best before', value: product.pharmacyInfo.expiry },
        { label: 'Use', value: product.pharmacyInfo.use },
      ],
      note: product.pharmacyInfo.note,
    };
  }

  const availability = product.inStock ? `${product.stockCount} ready to dispatch` : 'Currently unavailable';
  const itemReference = { label: 'Item reference', value: product.sku };

  switch (product.department) {
    case 'fashion':
      return {
        heading: 'Style & fit information',
        icon: 'checkroom',
        details: [
          { label: 'Collection', value: product.category },
          { label: 'Available sizes', value: product.variants?.sizes?.join(' · ') || 'See options above' },
          itemReference,
          { label: 'Availability', value: availability },
        ],
        note: 'Choose your preferred size before adding to bag. Final variant and fulfilment details are confirmed in your cart.',
      };
    case 'beauty':
      return {
        heading: 'Beauty product information',
        icon: 'spa',
        details: [
          { label: 'Product type', value: product.category },
          { label: 'Edit highlight', value: product.badge || 'Curated selection' },
          itemReference,
          { label: 'Availability', value: availability },
        ],
        note: 'Review the product description and pack guidance before use. For the best experience, store products according to their label.',
      };
    case 'electronics':
      return {
        heading: 'Device & support information',
        icon: 'devices',
        details: [
          { label: 'Device category', value: product.category },
          { label: 'Key highlight', value: product.badge || 'Selected specification' },
          itemReference,
          { label: 'Availability', value: availability },
        ],
        note: 'Check the specifications and compatibility notes before ordering. Demo warranty and order support are available at checkout.',
      };
    case 'home':
      return {
        heading: 'Home product information',
        icon: 'chair',
        details: [
          { label: 'Room / category', value: product.category },
          { label: 'Edit highlight', value: product.badge || 'Curated selection' },
          itemReference,
          { label: 'Availability', value: availability },
        ],
        note: 'Use the product description and specifications to confirm the finish and dimensions that suit your space.',
      };
    case 'grocery':
      return {
        heading: 'Pantry information',
        icon: 'grocery',
        details: [
          { label: 'Pantry category', value: product.category },
          { label: 'Selection', value: product.badge || 'Curated selection' },
          itemReference,
          { label: 'Availability', value: availability },
        ],
        note: 'Store food items according to their pack guidance. Review the item label for ingredient and best-before information.',
      };
    case 'kids':
      return {
        heading: 'Play & care information',
        icon: 'toys',
        details: [
          { label: 'Category', value: product.category },
          { label: 'Collection note', value: product.badge || 'Curated selection' },
          itemReference,
          { label: 'Availability', value: availability },
        ],
        note: 'Please review the product description and any age or care guidance before choosing an item.',
      };
    default:
      return {
        heading: 'Product information',
        icon: 'inventory_2',
        details: [
          { label: 'Category', value: product.category },
          itemReference,
          { label: 'Availability', value: availability },
        ],
        note: 'Product details, selected variants and fulfilment are confirmed in your cart before checkout.',
      };
  }
};

export const RetailProductDetailPage: React.FC = () => {
  const { selectedProduct: product, addToCart, toggleWishlist, isInWishlist, navigateToDept, navigateToPDP, products } = useStore();
  const images = useMemo(() => productImages(product), [product]);
  const [activeImage, setActiveImage] = useState(images[0] || FALLBACK_IMAGE);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(product.variants?.colors?.[0]?.name || '');
  const [selectedCushion, setSelectedCushion] = useState(product.variants?.cushions?.[0]?.name || '');
  const [selectedSize, setSelectedSize] = useState(product.variants?.sizes?.[0] || '');
  const [selectedFit, setSelectedFit] = useState(product.variants?.archFits?.[0]?.name || '');

  useEffect(() => {
    setActiveImage(images[0] || FALLBACK_IMAGE);
    setQuantity(1);
    setSelectedColor(product.variants?.colors?.[0]?.name || '');
    setSelectedCushion(product.variants?.cushions?.[0]?.name || '');
    setSelectedSize(product.variants?.sizes?.[0] || '');
    setSelectedFit(product.variants?.archFits?.[0]?.name || '');
  }, [product.id, images, product.variants]);

  const selectedCushionData = product.variants?.cushions?.find((item) => item.name === selectedCushion);
  const unitPrice = product.price + (selectedCushionData?.priceAdd || 0);
  const wishlisted = isInWishlist(product.id);
  const productInformation = getProductInformation(product);
  const relatedProducts = products.filter((item) => item.id !== product.id && (item.department === product.department || product.pairings?.some((pair) => pair.id === item.id))).slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product, quantity, {
      color: selectedColor || undefined,
      cushion: selectedCushion || undefined,
      archFit: selectedFit || undefined,
      size: selectedSize || undefined,
      priceAdd: selectedCushionData?.priceAdd || 0,
    });
  };

  return (
    <div className="bg-[#f7f1e5] pb-16 text-[#1d2345]">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-2 text-xs text-[#6b6560]">
          <button onClick={() => navigateToDept(product.department)} className="font-semibold text-[#1d2345] hover:text-[#d5215d]">{product.deptLabel}</button>
          <span aria-hidden="true">/</span>
          <span>{product.category}</span>
          <span aria-hidden="true">/</span>
          <span className="max-w-[15rem] truncate">{product.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(22rem,.92fr)] lg:gap-12">
          <section className="min-w-0" aria-label={`${product.name} image gallery`}>
            <div className="overflow-hidden rounded-2xl border border-[#ded6c7] bg-white shadow-sm">
              <div className="relative aspect-square bg-[#f4f0e8]">
                <img
                  src={activeImage}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.025]"
                  onError={(event) => { event.currentTarget.src = FALLBACK_IMAGE; }}
                />
                {product.badge && <span className="absolute left-4 top-4 rounded-full bg-[#1d2345] px-3 py-1.5 text-xs font-bold tracking-wide text-white shadow-sm">{product.badge}</span>}
                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
                  className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full border border-[#ded6c7] bg-white/95 text-[#1d2345] shadow-sm transition hover:scale-105 hover:border-[#d5215d] hover:text-[#d5215d]"
                >
                  <span className="material-symbols-outlined" style={wishlisted ? { fontVariationSettings: "'FILL' 1", color: '#d5215d' } : undefined}>favorite</span>
                </button>
              </div>
            </div>
            {images.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                {images.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    onClick={() => setActiveImage(image)}
                    aria-label={`Show product image ${index + 1}`}
                    className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-white ${activeImage === image ? 'border-[#1d2345]' : 'border-[#ded6c7] hover:border-[#8c7ae6]'}`}
                  >
                    <img src={image} alt="" className="h-full w-full object-cover" onError={(event) => { event.currentTarget.src = FALLBACK_IMAGE; }} />
                  </button>
                ))}
              </div>
            )}
            <div className="mt-5 grid grid-cols-3 gap-3 text-center text-xs text-[#5e5a55]">
              <div className="rounded-xl border border-[#ded6c7] bg-white p-3"><span className="material-symbols-outlined mb-1 block text-[#6d5bd0]">verified</span>Quality checked</div>
              <div className="rounded-xl border border-[#ded6c7] bg-white p-3"><span className="material-symbols-outlined mb-1 block text-[#6d5bd0]">local_shipping</span>Unified delivery</div>
              <div className="rounded-xl border border-[#ded6c7] bg-white p-3"><span className="material-symbols-outlined mb-1 block text-[#6d5bd0]">assignment_return</span>Easy returns</div>
            </div>
          </section>

          <section className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[#6d5bd0]">{product.deptLabel} · {product.category}</p>
            <h1 className="mt-2 font-['Bodoni_Moda'] text-3xl font-semibold leading-tight text-[#1d2345] sm:text-4xl">{product.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-1 rounded-md bg-[#e7f7f0] px-2.5 py-1 font-bold text-[#147a52]"><span className="material-symbols-outlined text-base">star</span>{product.rating}</span>
              <a href="#customer-reviews" className="text-[#57516e] underline decoration-[#cfc5b5] underline-offset-4 hover:text-[#1d2345]">{product.reviewsCount} ratings</a>
              <span className="text-[#6b6560]">·</span>
              <span className={product.inStock ? 'font-medium text-[#147a52]' : 'font-medium text-[#b33a32]'}>{product.inStock ? 'In stock' : 'Currently unavailable'}</span>
            </div>
            <p className="mt-5 text-[15px] leading-7 text-[#514d48]">{product.description}</p>

            <div className="mt-6 rounded-2xl border border-[#ded6c7] bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div><p className="text-xs font-semibold uppercase tracking-wider text-[#6b6560]">Price</p><p className="mt-1 text-3xl font-bold tracking-tight text-[#1d2345]">{formatInr(unitPrice)}</p><p className="mt-1 text-xs text-[#6b6560]">Inclusive of taxes · secure checkout</p></div>
                <span className="rounded-full bg-[#fff4d9] px-3 py-1.5 text-xs font-bold text-[#8a6510]">EMI from {formatInr(unitPrice / 6)}/month</span>
              </div>
              <div className="mt-5 border-t border-[#ece5da] pt-5 text-sm">
                <div className="flex items-center gap-2 text-[#1d2345]"><span className="material-symbols-outlined text-[#6d5bd0]">credit_card</span><span>UPI, cards and demo EMI available at checkout</span></div>
              </div>
            </div>

            <div className="mt-5 space-y-5 rounded-2xl border border-[#ded6c7] bg-white p-5 shadow-sm">
              {product.variants?.colors && product.variants.colors.length > 0 && (
                <fieldset><legend className="font-semibold text-[#1d2345]">Colour <span className="font-normal text-[#6b6560]">· {selectedColor}</span></legend><div className="mt-3 flex flex-wrap gap-2">{product.variants.colors.map((option) => <button key={option.name} type="button" onClick={() => setSelectedColor(option.name)} className={`inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 text-sm transition ${selectedColor === option.name ? 'border-[#1d2345] bg-[#eef0ff] font-semibold text-[#1d2345]' : 'border-[#ded6c7] text-[#514d48] hover:border-[#8c7ae6]'}`}><span className="h-4 w-4 rounded-full border border-black/10" style={{ backgroundColor: option.hex }}></span>{option.name}</button>)}</div></fieldset>
              )}
              {product.variants?.sizes && product.variants.sizes.length > 0 && (
                <fieldset><legend className="font-semibold text-[#1d2345]">Size <span className="font-normal text-[#6b6560]">· {selectedSize}</span></legend><div className="mt-3 flex flex-wrap gap-2">{product.variants.sizes.map((size) => <button key={size} type="button" onClick={() => setSelectedSize(size)} className={`grid h-11 min-w-11 place-items-center rounded-lg border px-3 text-sm transition ${selectedSize === size ? 'border-[#1d2345] bg-[#eef0ff] font-bold text-[#1d2345]' : 'border-[#ded6c7] text-[#514d48] hover:border-[#8c7ae6]'}`}>{size}</button>)}</div></fieldset>
              )}
              {product.variants?.cushions && product.variants.cushions.length > 0 && (
                <fieldset><legend className="font-semibold text-[#1d2345]">Choose your finish</legend><div className="mt-3 grid gap-2">{product.variants.cushions.map((option) => <button key={option.name} type="button" onClick={() => setSelectedCushion(option.name)} className={`rounded-xl border p-3 text-left transition ${selectedCushion === option.name ? 'border-[#1d2345] bg-[#eef0ff]' : 'border-[#ded6c7] hover:border-[#8c7ae6]'}`}><span className="block font-medium text-[#1d2345]">{option.name}{option.priceAdd ? ` · +${formatInr(option.priceAdd)}` : ''}</span><span className="mt-1 block text-xs text-[#6b6560]">{option.desc}</span></button>)}</div></fieldset>
              )}
              {product.variants?.archFits && product.variants.archFits.length > 0 && (
                <fieldset><legend className="font-semibold text-[#1d2345]">Fit</legend><div className="mt-3 grid gap-2 sm:grid-cols-2">{product.variants.archFits.map((option) => <button key={option.name} type="button" onClick={() => setSelectedFit(option.name)} className={`rounded-xl border p-3 text-left transition ${selectedFit === option.name ? 'border-[#1d2345] bg-[#eef0ff]' : 'border-[#ded6c7] hover:border-[#8c7ae6]'}`}><span className="block font-medium text-[#1d2345]">{option.name}</span><span className="mt-1 block text-xs text-[#6b6560]">{option.desc}</span></button>)}</div></fieldset>
              )}

              <div className="flex flex-col gap-3 border-t border-[#ece5da] pt-5 sm:flex-row">
                <div className="flex h-12 items-center rounded-lg border border-[#ded6c7] bg-[#faf8f4]">
                  <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="grid h-full w-11 place-items-center text-lg text-[#1d2345] hover:bg-[#eee8df]" aria-label="Decrease quantity">−</button>
                  <span className="grid h-full min-w-9 place-items-center font-bold text-[#1d2345]">{quantity}</span>
                  <button type="button" onClick={() => setQuantity((value) => value + 1)} className="grid h-full w-11 place-items-center text-lg text-[#1d2345] hover:bg-[#eee8df]" aria-label="Increase quantity">+</button>
                </div>
                <button
                  type="button"
                  disabled={!product.inStock}
                  onClick={handleAddToCart}
                  className="min-h-12 flex-1 rounded-lg bg-gradient-to-r from-[#4f46e5] via-[#6d5bd0] to-[#7c3aed] px-5 font-bold text-[#fffdf8] shadow-[0_10px_22px_rgba(79,70,229,.24)] transition hover:-translate-y-0.5 hover:from-[#4338ca] hover:via-[#5b4cc4] hover:to-[#6d28d9] focus-visible:outline-[#4f46e5] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="material-symbols-outlined mr-2 align-middle text-[18px]">shopping_bag</span>
                  Add to bag · {formatInr(unitPrice * quantity)}
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-3 rounded-2xl border border-[#ded6c7] bg-[#fffdf8] p-5 text-sm sm:grid-cols-2">
              <div className="flex gap-3"><span className="material-symbols-outlined text-[#6d5bd0]">local_shipping</span><div><p className="font-semibold text-[#1d2345]">Unified delivery</p><p className="mt-1 leading-relaxed text-[#6b6560]">Combine departments in one order and track one shipment.</p></div></div>
              <div className="flex gap-3"><span className="material-symbols-outlined text-[#6d5bd0]">assignment_return</span><div><p className="font-semibold text-[#1d2345]">Easy returns</p><p className="mt-1 leading-relaxed text-[#6b6560]">Simple return support for eligible products.</p></div></div>
            </div>
          </section>
        </div>

        <section className="mt-12 grid gap-6 lg:grid-cols-[1.25fr_.75fr]" aria-labelledby="product-information-title">
          <article className="rounded-2xl border border-[#ded6c7] bg-white p-6 shadow-sm sm:p-8"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#6d5bd0]">Product details</p><h2 id="product-information-title" className="mt-2 font-['Bodoni_Moda'] text-3xl font-semibold text-[#1d2345]">About this item</h2><p className="mt-4 max-w-3xl leading-7 text-[#514d48]">{product.extendedDescription || product.description}</p>{product.pharmacyInfo && <div className="mt-6 rounded-xl border border-[#9edfd6] bg-[#edfffb] p-4"><p className="font-semibold text-[#116d63]">Pharmacy information</p><dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2"><div><dt className="text-[#5a716d]">Manufactured</dt><dd className="font-medium text-[#173a36]">{product.pharmacyInfo.manufactured}</dd></div><div><dt className="text-[#5a716d]">Expiry / best before</dt><dd className="font-medium text-[#173a36]">{product.pharmacyInfo.expiry}</dd></div><div className="sm:col-span-2"><dt className="text-[#5a716d]">Use</dt><dd className="font-medium text-[#173a36]">{product.pharmacyInfo.use}</dd></div></dl><p className="mt-3 border-t border-[#9edfd6] pt-3 text-xs leading-relaxed text-[#47706a]">{product.pharmacyInfo.note}</p></div>}</article>
          {product.specs && product.specs.length > 0 && <aside className="rounded-2xl border border-[#ded6c7] bg-white p-6 shadow-sm"><h2 className="font-['Bodoni_Moda'] text-2xl font-semibold text-[#1d2345]">Key specifications</h2><dl className="mt-5 divide-y divide-[#ece5da]">{product.specs.slice(0, 5).map((spec) => <div key={spec.label} className="flex items-start justify-between gap-4 py-3"><dt><span className="block font-medium text-[#1d2345]">{spec.label}</span><span className="mt-1 block text-xs text-[#6b6560]">{spec.desc}</span></dt><dd className="text-right text-sm font-semibold text-[#514d48]">{spec.value}</dd></div>)}</dl></aside>}
        </section>

        {relatedProducts.length > 0 && <section className="mt-12" aria-labelledby="more-like-this-title"><div className="mb-5 flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#6d5bd0]">More to explore</p><h2 id="more-like-this-title" className="mt-1 font-['Bodoni_Moda'] text-3xl font-semibold text-[#1d2345]">You may also like</h2></div><button onClick={() => navigateToDept(product.department)} className="text-sm font-semibold text-[#1d2345] underline underline-offset-4 hover:text-[#d5215d]">View department</button></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{relatedProducts.map((item) => <article key={item.id} className="group overflow-hidden rounded-2xl border border-[#ded6c7] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"><button type="button" onClick={() => navigateToPDP(item.id)} className="block w-full text-left"><img src={item.images.front} alt={item.name} className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105" onError={(event) => { event.currentTarget.src = FALLBACK_IMAGE; }} /><div className="p-4"><p className="truncate font-semibold text-[#1d2345]">{item.name}</p><p className="mt-2 text-sm font-bold text-[#1d2345]">{formatInr(item.price)}</p></div></button></article>)}</div></section>}

        <section id="customer-reviews" className="mt-12" aria-label="Customer reviews"><ReviewSection productId={product.id} /></section>
      </div>
    </div>
  );
};
