import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { DEPARTMENTS } from '../../data/mockData';
import { DepartmentId, Product } from '../../types/store';
import { formatInr } from '../../lib/currency';

export const StorefrontHome: React.FC = () => {
  const {
    navigateToPDP,
    navigateToDept,
    addToCart,
    toggleWishlist,
    isInWishlist,
    setActiveView,
    showToastNotification,
    catalogStatus,
    products,
  } = useStore();

  const [activeFilter, setActiveFilter] = useState<'all' | 'fashion' | 'electronics' | 'beauty' | 'grocery' | 'pharmacy'>('all');

  const liveProducts = products.filter((p) => catalogStatus[p.id] === 'live');
  const filteredProducts = liveProducts.filter((p) => {
    if (activeFilter === 'all') return true;
    return p.department === activeFilter;
  });

  const handleAddBundle = () => {
    const tech = products.find((p) => p.id === 'prod-aura-anc') || products[0];
    const beauty = products.find((p) => p.id === 'prod-night-serum') || products[1];
    const grocery = products.find((p) => p.id === 'prod-olive-oil') || products[2];

    addToCart(tech, 1);
    addToCart(beauty, 1);
    addToCart(grocery, 1);

    showToastNotification(
      'Curated Cross-Department Bundle Added',
      '3 items from Tech, Beauty, and Pantry merged into single box',
      `+${formatInr(281)}`
    );
  };

  return (
    <div className="flex flex-col w-full text-[#e3e2e6]">
      {/* Hero Editorial Section */}
      <section className="relative w-full px-4 sm:px-8 lg:px-12 py-12 lg:py-20 overflow-hidden">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#ba012d]/20 blur-[120px] pointer-events-none"></div>
        <div className="absolute top-1/2 -right-32 w-[32rem] h-[32rem] rounded-full bg-[#00dbe9]/10 blur-[140px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Narrative Column (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-6 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#292a2d] border border-[#343538]">
              <span className="w-2 h-2 rounded-full bg-[#ba012d] animate-pulse"></span>
              <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-widest text-[#c5c7c9] font-bold">
                The Unified Flagship Model
              </span>
            </div>

            <h1
              className="font-['Bodoni_Moda'] text-4xl sm:text-5xl lg:text-[64px] lg:leading-[1.1] text-white font-normal tracking-tight"
              style={{
                background: 'linear-gradient(135deg, rgb(233, 213, 255) 0%, rgb(196, 181, 253) 40%, rgb(147, 197, 253) 80%, rgb(96, 165, 250) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              The Universal <span className="italic font-light">Department</span> Store.
            </h1>

            <p className="font-['Hanken_Grotesk'] text-lg text-[#c5c7c9] max-w-xl leading-relaxed">
              Curated fashion, biocompatible beauty, precision tech, and single-estate pantry essentials — pooled into one physical box, one consolidated receipt, and one checkout.
            </p>

            {/* CTA Buttons Row */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#featured-products"
                className="px-6 py-3.5 bg-white text-[#121316] font-['Space_Grotesk'] text-[14px] font-bold tracking-wider rounded hover:bg-[#ba012d] hover:text-white transition-all duration-300 shadow-xl flex items-center gap-2 group"
              >
                <span>Shop Multi-Department Edit</span>
                <span className="material-symbols-outlined text-[18px] transform group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </a>

              <a
                href="#departments-grid"
                className="px-6 py-3.5 bg-[#292a2d] text-white font-['Space_Grotesk'] text-[14px] font-bold tracking-wider rounded hover:bg-[#343538] transition-all duration-300 flex items-center gap-2 border border-[#44474a]"
              >
                <span className="material-symbols-outlined text-[18px] text-[#8f9194]">tune</span>
                <span>Department Directory</span>
              </a>
            </div>

            {/* Metric Ticker Strip */}
            <div className="pt-6 mt-4 w-full grid grid-cols-3 gap-3 border-t border-[#292a2d]/60">
              <div className="bg-[#1b1b1f] p-3 rounded flex flex-col border border-[#343538]/50">
                <span className="font-['Space_Grotesk'] text-[20px] font-bold text-white">7 Flagships</span>
                <span className="font-['Space_Grotesk'] text-[10px] uppercase text-[#8f9194]">Unified In One Cart</span>
              </div>
              <div className="bg-[#1b1b1f] p-3 rounded flex flex-col border border-[#343538]/50">
                <span className="font-['Space_Grotesk'] text-[20px] font-bold text-white">Single Box</span>
                <span className="font-['Space_Grotesk'] text-[10px] uppercase text-[#8f9194]">Zero Split Deliveries</span>
              </div>
              <div className="bg-[#1b1b1f] p-3 rounded flex flex-col border border-[#343538]/50">
                <span className="font-['Space_Grotesk'] text-[20px] font-bold text-white">14,000+</span>
                <span className="font-['Space_Grotesk'] text-[10px] uppercase text-[#8f9194]">Verified Active SKUs</span>
              </div>
            </div>
          </div>

          {/* Right Editorial Collage Column (5 cols) */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="w-full relative max-w-lg lg:max-w-none">
              {/* Main Hero Editorial Visual */}
              <div
                onClick={() => navigateToPDP('prod-wool-coat')}
                className="relative w-full aspect-[4/5] rounded-xl overflow-hidden shadow-2xl bg-[#1b1b1f] cursor-pointer group border border-[#343538]"
              >
                <div
                  className="w-full h-full bg-cover bg-center transform group-hover:scale-105 transition-transform duration-700"
                  style={{
                    backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDclMvyUukCXvHUf_D5w-9DlHvLxU4zYUYI6w9VYAuByBzMjCKtQQ7TO-tW3orbl_G0RdjiAKUiIPZLlgw2bo8Ufys4evBQblPz5TU1_-fyuig8WZOJ-GiUTdFG3EqKBTAbpmmWzETuoVbDkXefuZoDiinM4rs1R2fFfUugbZzsDBcTAWrAchm5ZDI6Dwf_YKNXULbLhdSE-lIvUjr31VvyBCXExmgM34zVBE4j_lwl7oINj3Gaj9En4w')`,
                  }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0e11] via-transparent to-transparent opacity-80"></div>

                {/* Live Curated Tag Inside Visual */}
                <div className="absolute bottom-6 left-6 right-6 p-4 bg-[#121316]/90 backdrop-blur-md rounded-lg shadow-lg flex items-center justify-between border border-[#343538]">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-[#ba012d]"></span>
                    <div>
                      <p className="font-['Space_Grotesk'] text-[10px] uppercase tracking-wider text-[#8f9194]">
                        Autumn Atelier Edit
                      </p>
                      <p className="font-['Bodoni_Moda'] text-[16px] font-semibold text-white">
                        Curated by Blowmaggy Tokyo
                      </p>
                    </div>
                  </div>
                  <span className="font-['Space_Grotesk'] text-[18px] font-bold text-[#ffb3b3]">{formatInr(395)}</span>
                </div>
              </div>

              {/* Asymmetric Overlapping Mini Card */}
              <div
                onClick={() => navigateToPDP('prod-aura-anc')}
                className="absolute -top-6 -left-6 hidden sm:flex items-center gap-3 bg-[#343538]/95 backdrop-blur-md p-3 rounded-lg shadow-xl z-20 border border-[#44474a] cursor-pointer hover:bg-[#38393c] transition-all"
              >
                <div className="w-12 h-12 rounded bg-[#292a2d] overflow-hidden shrink-0">
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{
                      backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuB8SsIOiCrHjfTc6sR13MyVJeZCpS-ynuIgMgpHdHDvZ8eoKKC1aZ-o2lSuK3NLQfvl7Bl3jKWyUqfK6IFimUIBntNoHMc-cULvLiYLL4VSa7Wjj9UJepr2Clmb92XDiAiKAUXOeDnne00hlqfWjTxGKouNJJCxECCgF8Nri-E7L1PBj8mb8ZA5leEov-E7VVEtOshX6tqbn-sh-Ugx_UBZHSliaw9EMVR0tI0-OVfkW9rX9T0RmzmMkQ')`,
                    }}
                  ></div>
                </div>
                <div className="pr-2">
                  <span className="font-['Space_Grotesk'] text-[10px] uppercase text-[#00dbe9] font-bold block">
                    Cross-Category Sync
                  </span>
                  <p className="font-['Space_Grotesk'] text-[12px] font-bold text-white">Studio Reference ANC</p>
                  <span className="font-['Space_Grotesk'] text-[12px] text-[#c5c7c9]">{formatInr(249)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Micro-Banner: Protocol Ticker */}
      <div className="w-full bg-[#0d0e11] py-3 px-4 sm:px-8 lg:px-12 flex items-center justify-between overflow-x-auto gap-8 text-[#8f9194] font-['Space_Grotesk'] text-[11px] uppercase tracking-widest border-y border-[#292a2d]">
        <span className="flex items-center gap-2 shrink-0">
          <span className="w-1.5 h-1.5 bg-[#ba012d] rounded-full"></span> 01 / Unified Logistics Node
        </span>
        <span className="flex items-center gap-2 shrink-0">
          <span className="w-1.5 h-1.5 bg-[#00dbe9] rounded-full"></span> 02 / Realtime Cold-Chain & Fragile Sync
        </span>
        <span className="flex items-center gap-2 shrink-0">
          <span className="w-1.5 h-1.5 bg-[#ffb3b3] rounded-full"></span> 03 / Multi-Brand One-Tap Warranty
        </span>
        <span className="flex items-center gap-2 shrink-0">
          <span className="w-1.5 h-1.5 bg-white rounded-full"></span> 04 / Carbon Neutral Unified Box
        </span>
      </div>

      {/* Department Discovery Grid */}
      <section className="w-full px-4 sm:px-8 lg:px-12 py-16 max-w-7xl mx-auto" id="departments-grid">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-['Space_Grotesk'] text-[11px] uppercase tracking-widest text-[#ffb3b3] font-bold">
                Structured Directory
              </span>
              <span className="text-[#8f9194]">•</span>
              <span className="font-['Space_Grotesk'] text-[11px] text-[#8f9194]">Fall/Winter Protocol</span>
            </div>
            <h2
              className="font-['Bodoni_Moda'] text-3xl sm:text-4xl text-white font-normal"
              style={{
                background: 'linear-gradient(135deg, rgb(221, 214, 254) 0%, rgb(167, 139, 250) 50%, rgb(147, 197, 253) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Seven Flagship Departments
            </h2>
          </div>
          <p className="font-['Hanken_Grotesk'] text-[14px] text-[#c5c7c9] max-w-md">
            Zero fragmentation. Add cashmere knitwear, botanical toners, studio drivers, and cold-pressed olive oils in the same transaction.
          </p>
        </div>

        {/* 6 Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.values(DEPARTMENTS).map((dept) => (
            <div
              key={dept.id}
              onClick={() => navigateToDept(dept.id)}
              className="group relative bg-[#1b1b1f] rounded-lg overflow-hidden flex flex-col justify-between hover:bg-[#292a2d] transition-all duration-300 border border-[#343538] cursor-pointer shadow-sm hover:shadow-xl"
            >
              <div className="relative w-full aspect-[16/10] overflow-hidden bg-[#0d0e11]">
                <div
                  className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
                  style={{ backgroundImage: `url('${dept.image}')` }}
                ></div>
                <div className="absolute top-3 left-3 bg-[#121316]/90 backdrop-blur-md px-2.5 py-1 rounded flex items-center gap-1.5 border border-[#343538]">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dept.colorAccent }}></span>
                  <span className="font-['Space_Grotesk'] text-[10px] uppercase font-bold text-white tracking-wider">
                    {dept.title}
                  </span>
                </div>
                <div className="absolute bottom-3 right-3 font-['Space_Grotesk'] text-[10px] uppercase px-2 py-1 bg-[#0d0e11]/80 text-[#8f9194] rounded">
                  {dept.skuCount}
                </div>
              </div>

              <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
                <div>
                  <h3 className="font-['Bodoni_Moda'] text-[20px] font-semibold text-white group-hover:text-[#7df4ff] transition-colors">
                    {dept.title}
                  </h3>
                  <p className="font-['Hanken_Grotesk'] text-[13px] text-[#c5c7c9] mt-1 leading-snug">
                    {dept.subtitle}
                  </p>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-[#292a2d] mt-4">
                  <span className="font-['Space_Grotesk'] text-[11px] text-[#c5c7c9] uppercase tracking-wider font-semibold">
                    {dept.deptNumber}
                  </span>
                  <span className="inline-flex items-center gap-1 font-['Space_Grotesk'] text-[12px] font-bold text-white group-hover:text-[#7df4ff] group-hover:translate-x-1 transition-all">
                    <span>Enter Collection</span>
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Personalised discovery shelves — live catalogue data, not static decoration. */}
      <section className="w-full px-4 sm:px-8 lg:px-12 py-4 max-w-7xl mx-auto" aria-labelledby="discovery-shelves-title">
        <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-['Space_Grotesk'] text-[11px] font-bold uppercase tracking-[0.18em] text-[#00a6b2]">Made for your next cart</p>
            <h2 id="discovery-shelves-title" className="font-['Bodoni_Moda'] text-3xl font-semibold text-white sm:text-4xl">Fresh suggestions, one storefront.</h2>
          </div>
          <button onClick={() => setActiveView('wishlist')} className="inline-flex items-center gap-2 self-start text-sm font-semibold text-[#00a6b2] transition-transform hover:translate-x-1 sm:self-auto">
            See your wishlist <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {[
            { title: 'Suggested for you', note: 'A cross-department edit selected from today’s most explored categories.', accent: '#6D5BD0', items: liveProducts.filter((product) => ['fashion', 'beauty', 'home'].includes(product.department)).slice(0, 3) },
            { title: 'Best rated right now', note: 'Top shopper-rated essentials, ready to add to one delivery.', accent: '#D58C25', items: [...liveProducts].sort((a, b) => b.rating - a.rating).slice(0, 3) },
            { title: 'From your wishlist', note: 'Saved products appear here; until then, explore a few likely favourites.', accent: '#E84B7A', items: liveProducts.filter((product) => isInWishlist(product.id)).slice(0, 3).concat(liveProducts.filter((product) => !isInWishlist(product.id)).slice(0, 3)).slice(0, 3) },
          ].map((shelf) => (
            <article key={shelf.title} className="rounded-2xl border border-[#343538] bg-[#1b1b1f] p-4 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-4 border-l-4 pl-3" style={{ borderColor: shelf.accent }}>
                <h3 className="font-['Space_Grotesk'] text-base font-bold text-white">{shelf.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-[#8f9194]">{shelf.note}</p>
              </div>
              <div className="space-y-2">
                {shelf.items.map((product) => (
                  <button key={product.id} onClick={() => navigateToPDP(product.id)} className="group flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-[#292a2d]">
                    <img src={product.images.front} alt="" className="h-14 w-14 rounded-lg object-cover" loading="lazy" />
                    <span className="min-w-0 flex-1"><span className="block truncate font-medium text-white group-hover:text-[#00a6b2]">{product.name}</span><span className="mt-1 flex items-center gap-2 text-xs text-[#8f9194]"><span className="text-[#d58c25]">★ {product.rating}</span>{formatInr(product.price)}</span></span>
                    <span className="material-symbols-outlined text-[#8f9194] transition-transform group-hover:translate-x-1">chevron_right</span>
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Interactive Highlight: Cross-Department Cart Builder */}
      <section className="w-full px-4 sm:px-8 lg:px-12 py-16 bg-[#0d0e11]">
        <div className="max-w-7xl mx-auto p-6 sm:p-8 lg:p-12 bg-[#1b1b1f] rounded-xl relative overflow-hidden border border-[#343538]">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-[#ba012d]/15 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="lg:max-w-md">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#343538] mb-2 border border-[#44474a]">
                <span className="material-symbols-outlined text-[14px] text-[#00dbe9]">sync_alt</span>
                <span className="font-['Space_Grotesk'] text-[10px] uppercase text-[#c5c7c9] font-bold">
                  Architecture Demonstration
                </span>
              </div>

              <h2
                className="font-['Bodoni_Moda'] text-3xl sm:text-4xl text-white font-normal tracking-tight"
                style={{
                  background: 'linear-gradient(135deg, rgb(221, 214, 254) 0%, rgb(167, 139, 250) 50%, rgb(147, 197, 253) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Cross-Department Unified Bundle
              </h2>

              <p className="font-['Hanken_Grotesk'] text-[14px] text-[#c5c7c9] mt-2 leading-relaxed">
                Experience our consolidated checkout logic. Combine high-spec electronics with clinical skincare and artisanal gastronomy with zero split shipping fees.
              </p>

              <div className="mt-6 flex items-center gap-6">
                <div>
                  <span className="font-['Space_Grotesk'] text-[10px] uppercase text-[#8f9194]">
                    Bundle Total (3 Items)
                  </span>
                  <div className="font-['Space_Grotesk'] text-2xl font-bold text-white flex items-baseline gap-2">
                    <span>{formatInr(281)}</span>
                    <span className="font-['Hanken_Grotesk'] text-sm line-through text-[#8f9194]">{formatInr(315)}</span>
                  </div>
                </div>
                <div className="h-8 w-px bg-[#343538]"></div>
                <div>
                  <span className="font-['Space_Grotesk'] text-[10px] uppercase text-[#00dbe9] font-bold">
                    Logistics Package
                  </span>
                  <p className="font-['Space_Grotesk'] text-[12px] font-bold text-white">1 Box • Priority Air</p>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleAddBundle}
                  className="w-full sm:w-auto px-6 py-3.5 bg-white text-[#121316] font-['Space_Grotesk'] text-[13px] font-bold uppercase tracking-wider rounded hover:bg-[#ba012d] hover:text-white transition-all duration-300 flex items-center justify-center gap-2 group shadow-xl cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                  <span>Add Curated Bundle to One Cart</span>
                  <span className="font-['Space_Grotesk'] text-[10px] bg-[#121316] text-white px-1.5 py-0.5 rounded ml-1 group-hover:bg-white group-hover:text-[#ba012d] transition-colors">
                    SAVE {formatInr(34)}
                  </span>
                </button>
              </div>
            </div>

            {/* Bundle Items Visual Row */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Item 1: Tech */}
              <div
                onClick={() => navigateToPDP('prod-aura-anc')}
                className="bg-[#1f1f23] rounded-lg p-3 flex flex-col justify-between relative group hover:bg-[#292a2d] transition-colors border border-[#343538] cursor-pointer"
              >
                <div className="w-full aspect-square rounded bg-[#292a2d] overflow-hidden mb-2 relative">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuACtLPeJWc9P8PdvpWsqbLdLmikCvRiuTjPfpcPIfOkQCuqSNZI_Mns3qJhyvDNTrEhiCzJwJVOlotTiLirZWH0p7bC9IOB7WaIPlNgX8-cVhmmMxpRm6ok60pa_RscenA9mc1kXd6S-W6fUoieaneuB4aPqB0oPqfhR6OKAp6DDtVzShBAivkWkmode37ReLz5BOthY31Bf5S1YHILuknDA6NkHAXdLvpScCDaH-r8AN_Lg_-sWqOFFw"
                    alt="Studio Reference ANC"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute top-2 left-2 bg-[#121316]/90 px-1.5 py-0.5 rounded font-['Space_Grotesk'] text-[9px] uppercase font-bold text-[#00dbe9]">
                    Dept 03: Tech
                  </span>
                </div>
                <div>
                  <h4 className="font-['Bodoni_Moda'] text-[15px] font-semibold text-white">Studio Reference ANC</h4>
                  <p className="font-['Hanken_Grotesk'] text-[11px] text-[#8f9194]">Electronics Lab</p>
                </div>
                <div className="mt-2 flex items-center justify-between pt-1 border-t border-[#343538]/50">
                  <span className="font-['Space_Grotesk'] text-[14px] font-bold text-white">{formatInr(189)}</span>
                  <span className="font-['Space_Grotesk'] text-[10px] text-[#00dbe9] uppercase font-bold">In Stock</span>
                </div>
              </div>

              {/* Item 2: Beauty */}
              <div
                onClick={() => navigateToPDP('prod-night-serum')}
                className="bg-[#1f1f23] rounded-lg p-3 flex flex-col justify-between relative group hover:bg-[#292a2d] transition-colors border border-[#343538] cursor-pointer"
              >
                <div className="w-full aspect-square rounded bg-[#292a2d] overflow-hidden mb-2 relative">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBs2HF3rXHYsCirzuiWDzlNiZqAYeQXPL2mKgG_EdENFpQ79aZIgHvKCJ-ioFLTXcvedwCFpdWifw16X-74a0n1IJ_9EshxLH_umG8vcw22wFehx6XLXyyE-TohCvHBrJ7zEss_PQRG6TxcdJzfKPLAWkgZh7f0YRwbfwtG311pzR6C4bCsqW6osn4oyhf8uQlkvmdGCfeA3KhQ69u1n9NUcaa1RmqAb8kt9enDuarPEpWxI5bdzigssQ"
                    alt="Botanical Barrier Serum"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute top-2 left-2 bg-[#121316]/90 px-1.5 py-0.5 rounded font-['Space_Grotesk'] text-[9px] uppercase font-bold text-[#ffb3b3]">
                    Dept 02: Beauty
                  </span>
                </div>
                <div>
                  <h4 className="font-['Bodoni_Moda'] text-[15px] font-semibold text-white">Botanical Barrier Serum</h4>
                  <p className="font-['Hanken_Grotesk'] text-[11px] text-[#8f9194]">Cosmetics & Beauty</p>
                </div>
                <div className="mt-2 flex items-center justify-between pt-1 border-t border-[#343538]/50">
                  <span className="font-['Space_Grotesk'] text-[14px] font-bold text-white">{formatInr(64)}</span>
                  <span className="font-['Space_Grotesk'] text-[10px] text-[#ffb3b3] uppercase font-bold">30ml Cold Poured</span>
                </div>
              </div>

              {/* Item 3: Grocery */}
              <div
                onClick={() => navigateToPDP('prod-truffle-honey')}
                className="bg-[#1f1f23] rounded-lg p-3 flex flex-col justify-between relative group hover:bg-[#292a2d] transition-colors border border-[#343538] cursor-pointer"
              >
                <div className="w-full aspect-square rounded bg-[#292a2d] overflow-hidden mb-2 relative">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAHEq5w40BoPJtBAwYZmHTWaQtevz0rV89UJwQZjB0-e7y3O66vuFoBFOQoRTTffqXOb-H8LJg-CAcN12iKpTms25pekhl3ejuuf_hzdl5u424UBbJ_zRmCz8EfkE7lYdaJGBmX9yv3DwBBcGDK5S12Dvnd1Y8pGDiA1buYlMGb63AqBPrT7Ek6TBUx1nbvbki-ylN6NDtYYQcq_2xwfvRtGT2V8qJSTe1C5AamDY_rRPJyCQLGQ9sdVg"
                    alt="Black Truffle Acacia Honey"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute top-2 left-2 bg-[#121316]/90 px-1.5 py-0.5 rounded font-['Space_Grotesk'] text-[9px] uppercase font-bold text-[#84CC16]">
                    Dept 05: Pantry
                  </span>
                </div>
                <div>
                  <h4 className="font-['Bodoni_Moda'] text-[15px] font-semibold text-white">Black Truffle Acacia Honey</h4>
                  <p className="font-['Hanken_Grotesk'] text-[11px] text-[#8f9194]">Pantry & Grocery</p>
                </div>
                <div className="mt-2 flex items-center justify-between pt-1 border-t border-[#343538]/50">
                  <span className="font-['Space_Grotesk'] text-[14px] font-bold text-white">{formatInr(28)}</span>
                  <span className="font-['Space_Grotesk'] text-[10px] text-[#84CC16] uppercase font-bold">Piedmont, Italy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Multi-Department Products Grid */}
      <section className="w-full px-4 sm:px-8 lg:px-12 py-16 max-w-7xl mx-auto" id="featured-products">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#ba012d]"></span>
              <span className="font-['Space_Grotesk'] text-[11px] uppercase tracking-widest text-[#8f9194] font-bold">
                Flagship Multi-Catalog
              </span>
            </div>
            <h2
              className="font-['Bodoni_Moda'] text-3xl sm:text-4xl text-white font-normal"
              style={{
                background: 'linear-gradient(135deg, rgb(221, 214, 254) 0%, rgb(167, 139, 250) 50%, rgb(147, 197, 253) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Curated Essentials For One Cart
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 font-['Space_Grotesk'] text-[12px] font-bold uppercase rounded transition-colors ${
                activeFilter === 'all' ? 'bg-[#292a2d] text-white border border-[#44474a]' : 'bg-[#1f1f23] text-[#8f9194] hover:text-white'
              }`}
            >
              All ({liveProducts.length})
            </button>
            <button
              onClick={() => setActiveFilter('fashion')}
              className={`px-3 py-1.5 font-['Space_Grotesk'] text-[12px] font-bold uppercase rounded transition-colors ${
                activeFilter === 'fashion' ? 'bg-[#292a2d] text-[#FF4F8B] border border-[#FF4F8B]' : 'bg-[#1f1f23] text-[#8f9194] hover:text-[#FF4F8B]'
              }`}
            >
              Fashion
            </button>
            <button
              onClick={() => setActiveFilter('electronics')}
              className={`px-3 py-1.5 font-['Space_Grotesk'] text-[12px] font-bold uppercase rounded transition-colors ${
                activeFilter === 'electronics' ? 'bg-[#292a2d] text-[#22D3EE] border border-[#22D3EE]' : 'bg-[#1f1f23] text-[#8f9194] hover:text-[#22D3EE]'
              }`}
            >
              Audio/Tech
            </button>
            <button
              onClick={() => setActiveFilter('beauty')}
              className={`px-3 py-1.5 font-['Space_Grotesk'] text-[12px] font-bold uppercase rounded transition-colors ${
                activeFilter === 'beauty' ? 'bg-[#292a2d] text-[#FF8A65] border border-[#FF8A65]' : 'bg-[#1f1f23] text-[#8f9194] hover:text-[#FF8A65]'
              }`}
            >
              Apothecary
            </button>
            <button
              onClick={() => setActiveFilter('grocery')}
              className={`px-3 py-1.5 font-['Space_Grotesk'] text-[12px] font-bold uppercase rounded transition-colors ${
                activeFilter === 'grocery' ? 'bg-[#292a2d] text-[#84CC16] border border-[#84CC16]' : 'bg-[#1f1f23] text-[#8f9194] hover:text-[#84CC16]'
              }`}
            >
              Pantry
            </button>
            <button
              onClick={() => setActiveFilter('pharmacy')}
              className={`px-3 py-1.5 font-['Space_Grotesk'] text-[12px] font-bold uppercase rounded transition-colors ${
                activeFilter === 'pharmacy' ? 'bg-[#292a2d] text-[#0EA5A4] border border-[#0EA5A4]' : 'bg-[#1f1f23] text-[#8f9194] hover:text-[#0EA5A4]'
              }`}
            >
              Health
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((p) => {
            const wishlisted = isInWishlist(p.id);
            return (
              <div
                key={p.id}
                onClick={() => navigateToPDP(p.id)}
                className="group bg-[#1b1b1f] rounded-lg p-4 flex flex-col justify-between hover:bg-[#292a2d] transition-all duration-300 border border-[#343538] cursor-pointer shadow-sm hover:shadow-xl"
              >
                <div>
                  {/* Image & Overlay */}
                  <div className="relative w-full aspect-[4/5] rounded bg-[#292a2d] overflow-hidden mb-4">
                    <img
                      src={p.images.front}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <span className="absolute top-3 left-3 bg-[#121316]/90 backdrop-blur-md px-2 py-0.5 rounded font-['Space_Grotesk'] text-[10px] uppercase font-bold text-white border border-[#343538]">
                      {p.deptLabel}
                    </span>

                    {/* Wishlist Button */}
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

                    {/* Quick Add Slide Up */}
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

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-[#8f9194] font-['Space_Grotesk'] text-[11px] uppercase mb-1">
                    <span className="flex items-center gap-1 text-[#ffb3b3]">
                      <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        star
                      </span>
                      <span>{p.rating} ({p.reviewsCount} reviews)</span>
                    </span>
                    <span className="text-[#00dbe9]">{p.stockCount} in stock</span>
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
                    {formatInr(p.price)}
                  </span>
                  <span className="font-['Space_Grotesk'] text-[10px] text-[#8f9194] uppercase tracking-wider">
                    {p.tagline || 'Unified Delivery: 2-Day'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Editorial Section: The Multi-Department Advantage Infographic */}
      <section className="w-full px-4 sm:px-8 lg:px-12 py-16 max-w-7xl mx-auto">
        <div className="w-full bg-[#1f1f23] rounded-xl p-6 sm:p-8 lg:p-12 relative overflow-hidden border border-[#343538]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2">
                <span className="font-['Space_Grotesk'] text-[11px] uppercase tracking-widest text-[#ffb3b3] font-bold">
                  Operational Integrity
                </span>
                <span className="text-[#8f9194]">•</span>
                <span className="font-['Space_Grotesk'] text-[11px] uppercase text-[#8f9194]">
                  Blowmaggy Fulfillment Net
                </span>
              </div>

              <h2
                className="font-['Bodoni_Moda'] text-3xl sm:text-4xl text-white font-normal"
                style={{
                  background: 'linear-gradient(135deg, rgb(221, 214, 254) 0%, rgb(167, 139, 250) 50%, rgb(147, 197, 253) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Unified Shipping.<br />
                <span className="italic font-light">Zero Disparate Packages.</span>
              </h2>

              <p className="font-['Hanken_Grotesk'] text-[15px] text-[#c5c7c9] max-w-lg leading-relaxed">
                Traditional marketplaces trigger separate deliveries, multi-carrier tracking numbers, and split customs declarations when you cross categories. Blowmaggy pools products at unified regional hubs for consolidated dispatch.
              </p>

              {/* Feature List */}
              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#292a2d] flex items-center justify-center shrink-0 mt-0.5 text-[#00dbe9]">
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  </div>
                  <div>
                    <h4 className="font-['Space_Grotesk'] text-[14px] font-bold text-white">One Single Sustainable Freight Box</h4>
                    <p className="font-['Hanken_Grotesk'] text-[13px] text-[#8f9194]">High-density recycled honeycomb carton engineered to safely cushion fragile ceramics, cold oils, and precision optics simultaneously.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#292a2d] flex items-center justify-center shrink-0 mt-0.5 text-[#00dbe9]">
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  </div>
                  <div>
                    <h4 className="font-['Space_Grotesk'] text-[14px] font-bold text-white">Integrated Cold & Fragile Compartments</h4>
                    <p className="font-['Hanken_Grotesk'] text-[13px] text-[#8f9194]">Thermal-stabilized micro-compartments keep apothecary elixirs cool without affecting dry goods or cashmere knitwear.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#292a2d] flex items-center justify-center shrink-0 mt-0.5 text-[#00dbe9]">
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  </div>
                  <div>
                    <h4 className="font-['Space_Grotesk'] text-[14px] font-bold text-white">Single Universal Return Label</h4>
                    <p className="font-['Hanken_Grotesk'] text-[13px] text-[#8f9194]">Any item from any department can be returned in the original box with one consolidated prepaid carrier barcode.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side Diagrammatic SVG */}
            <div className="lg:col-span-6 bg-[#1b1b1f] rounded-lg p-6 flex flex-col items-center justify-center border border-[#343538]">
              <div className="w-full max-w-md py-4">
                <svg className="w-full h-auto text-white" fill="none" viewBox="0 0 460 280">
                  <line stroke="currentColor" strokeDasharray="4 4" strokeOpacity="0.1" x1="20" x2="440" y1="50" y2="50"></line>
                  <line stroke="currentColor" strokeDasharray="4 4" strokeOpacity="0.1" x1="20" x2="440" y1="140" y2="140"></line>
                  <line stroke="currentColor" strokeDasharray="4 4" strokeOpacity="0.1" x1="20" x2="440" y1="230" y2="230"></line>

                  {/* Dept Nodes */}
                  <g>
                    <rect fill="#1b1b1f" height="32" rx="4" stroke="#FF4F8B" strokeWidth="1" width="105" x="25" y="30"></rect>
                    <text fill="#FF4F8B" fontFamily="Space Grotesk" fontSize="9" fontWeight="700" textAnchor="middle" x="77" y="50">01 FASHION</text>

                    <rect fill="#1b1b1f" height="32" rx="4" stroke="#FF8A65" strokeWidth="1" width="105" x="25" y="80"></rect>
                    <text fill="#FF8A65" fontFamily="Space Grotesk" fontSize="9" fontWeight="700" textAnchor="middle" x="77" y="100">02 BEAUTY</text>

                    <rect fill="#1b1b1f" height="32" rx="4" stroke="#22D3EE" strokeWidth="1" width="105" x="25" y="130"></rect>
                    <text fill="#22D3EE" fontFamily="Space Grotesk" fontSize="9" fontWeight="700" textAnchor="middle" x="77" y="150">03 AUDIO LAB</text>

                    <rect fill="#1b1b1f" height="32" rx="4" stroke="#D97757" strokeWidth="1" width="105" x="25" y="180"></rect>
                    <text fill="#D97757" fontFamily="Space Grotesk" fontSize="9" fontWeight="700" textAnchor="middle" x="77" y="200">04 HOME LIVING</text>

                    <rect fill="#1b1b1f" height="32" rx="4" stroke="#84CC16" strokeWidth="1" width="105" x="25" y="230"></rect>
                    <text fill="#84CC16" fontFamily="Space Grotesk" fontSize="9" fontWeight="700" textAnchor="middle" x="77" y="250">05 PANTRY</text>
                  </g>

                  {/* Lines */}
                  <path d="M130 46 C 190 46, 190 146, 230 146" fill="none" stroke="#FF4F8B" strokeWidth="2"></path>
                  <path d="M130 96 C 180 96, 180 146, 230 146" fill="none" stroke="#FF8A65" strokeWidth="2"></path>
                  <path d="M130 146 L 230 146" fill="none" stroke="#22D3EE" strokeWidth="2"></path>
                  <path d="M130 196 C 180 196, 180 146, 230 146" fill="none" stroke="#D97757" strokeWidth="2"></path>
                  <path d="M130 246 C 190 246, 190 154, 230 154" fill="none" stroke="#84CC16" strokeWidth="2"></path>

                  {/* Central Node */}
                  <circle cx="250" cy="146" fill="#121316" r="28" stroke="#ffffff" strokeWidth="2"></circle>
                  <text fill="#ffffff" fontFamily="Bodoni Moda" fontSize="16" fontWeight="bold" textAnchor="middle" x="250" y="143">M</text>
                  <text fill="#ba012d" fontFamily="Space Grotesk" fontSize="8" fontWeight="700" textAnchor="middle" x="250" y="158">ONE CART</text>

                  {/* Outbound */}
                  <line stroke="#ffffff" strokeDasharray="6 3" strokeWidth="3" x1="280" x2="350" y1="146" y2="146"></line>

                  {/* Box */}
                  <rect fill="#121316" height="58" rx="6" stroke="#ba012d" strokeWidth="2" width="90" x="350" y="117"></rect>
                  <text fill="#ffffff" fontFamily="Space Grotesk" fontSize="11" fontWeight="700" textAnchor="middle" x="395" y="142">1 BOX</text>
                  <text fill="#c5c7c9" fontFamily="Space Grotesk" fontSize="9" textAnchor="middle" x="395" y="157">1 CHECKOUT</text>
                </svg>
              </div>

              <div className="w-full flex items-center justify-between text-[#8f9194] font-['Space_Grotesk'] text-[10px] uppercase pt-2 border-t border-[#343538]/50">
                <span>5 Origins Aggregated</span>
                <span className="text-[#ffb3b3]">Latency: &lt; 24h Consolidate</span>
                <span>Delivery: 1 Carrier</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
