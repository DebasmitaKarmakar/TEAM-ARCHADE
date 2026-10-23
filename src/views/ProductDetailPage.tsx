import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types/store';
import { PRODUCTS } from '../data/mockData';


export const ProductDetailPage: React.FC = () => {
  const {
    selectedProduct,
    addToCart,
    toggleWishlist,
    isInWishlist,
    setActiveView,
    navigateToDept,
  } = useStore();

  const product = selectedProduct;

  // Variant selection states
  const [selectedColor, setSelectedColor] = useState('Matte Obsidian');
  const [selectedColorSku, setSelectedColorSku] = useState('OBS');
  const [selectedColorStock, setSelectedColorStock] = useState('14 in stock');

  const [selectedCushion, setSelectedCushion] = useState('Memory Foam Vegan Protein Leather');
  const [selectedCushionSku, setSelectedCushionSku] = useState('VPL');
  const [cushionPriceAdd, setCushionPriceAdd] = useState(0);

  const [selectedArch, setSelectedArch] = useState('Standard Fit');
  const [selectedArchSku, setSelectedArchSku] = useState('STD');

  const [quantity, setQuantity] = useState(1);

  // 360° Studio Chamber Turntable Engine State
  const [currentAngle, setCurrentAngle] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isWireframe, setIsWireframe] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const startAngleRef = useRef(0);
  const autoRotateReqRef = useRef<number | null>(null);

  const chamberRef = useRef<HTMLDivElement>(null);

  // Calculations
  const unitPrice = product.price + cushionPriceAdd;
  const totalPrice = unitPrice * quantity;
  const dynamicSku = `EL-809-${selectedColorSku}-${selectedCushionSku}-${selectedArchSku}`;

  // Turntable Drag handler
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startXRef.current = e.clientX;
    startAngleRef.current = currentAngle;
    setIsAutoRotating(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startXRef.current;
    const nextAngle = (startAngleRef.current + deltaX * 0.75 + 360) % 360;
    setCurrentAngle(nextAngle);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch support for turntable
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      startXRef.current = e.touches[0].clientX;
      startAngleRef.current = currentAngle;
      setIsAutoRotating(false);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1) {
      const deltaX = e.touches[0].clientX - startXRef.current;
      const nextAngle = (startAngleRef.current + deltaX * 0.75 + 360) % 360;
      setCurrentAngle(nextAngle);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Auto-rotation loop
  useEffect(() => {
    if (!isAutoRotating) {
      if (autoRotateReqRef.current) cancelAnimationFrame(autoRotateReqRef.current);
      return;
    }

    const loop = () => {
      setCurrentAngle((prev) => (prev + 0.65) % 360);
      autoRotateReqRef.current = requestAnimationFrame(loop);
    };

    autoRotateReqRef.current = requestAnimationFrame(loop);
    return () => {
      if (autoRotateReqRef.current) cancelAnimationFrame(autoRotateReqRef.current);
    };
  }, [isAutoRotating]);

  // Smooth jump to preset angle
  const jumpToAngle = (targetAngle: number) => {
    setIsAutoRotating(false);
    setCurrentAngle(targetAngle);
  };

  // Calculate 4 perspective frame weights using trigonometric blends
  const rad = (currentAngle * Math.PI) / 180;
  const w0 = Math.max(0, Math.cos(rad));
  const w90 = Math.max(0, Math.sin(rad));
  const w180 = Math.max(0, -Math.cos(rad));
  const w270 = Math.max(0, -Math.sin(rad));

  // Dynamic Hotspot Visibility
  const dist45 = Math.abs(currentAngle - 45);
  const opacity45 = dist45 < 45 ? 1 - dist45 / 45 : 0;

  const dist180 = Math.abs(currentAngle - 180);
  const opacity180 = dist180 < 45 ? 1 - dist180 / 45 : 0;

  const dist270 = Math.abs(currentAngle - 270);
  const opacity270 = dist270 < 45 ? 1 - dist270 / 45 : 0;

  const wishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity, {
      color: selectedColor,
      cushion: selectedCushion,
      archFit: selectedArch,
      priceAdd: cushionPriceAdd,
    });
  };

  return (
    <div className="flex flex-col w-full text-[#e3e2e6] pb-16">
      {/* Subtle Ambient Glow */}
      <div className="relative w-full overflow-hidden">
        <div className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 bg-[#7df4ff]/5 rounded-full blur-[140px]"></div>
        <div className="pointer-events-none absolute top-96 -right-32 w-80 h-80 bg-[#ba012d]/10 rounded-full blur-[120px]"></div>

        {/* Breadcrumb Strip */}
        <div className="w-full px-4 sm:px-8 lg:px-12 pt-6 pb-2 max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-[#1b1b1f] px-4 py-2.5 rounded border border-[#343538] shadow-sm">
            <nav className="flex items-center gap-2 font-['Space_Grotesk'] text-[12px] text-[#8f9194]">
              <button onClick={() => setActiveView('home')} className="hover:text-white transition-colors">
                Home
              </button>
              <span className="text-[#343538]">/</span>
              <button onClick={() => navigateToDept(product.department)} className="hover:text-white transition-colors">
                {product.deptLabel}
              </button>
              <span className="text-[#343538]">/</span>
              <span className="text-[#8f9194]">{product.category}</span>
              <span className="text-[#343538]">/</span>
              <span className="text-white font-medium truncate max-w-[220px] sm:max-w-none">{product.name}</span>
            </nav>

            <div className="flex items-center gap-4 shrink-0 font-['Space_Grotesk']">
              <span className="text-[10px] uppercase tracking-widest text-[#8f9194] font-bold">
                {product.sku}
              </span>
              <div className="flex items-center gap-1.5 bg-[#292a2d] px-2.5 py-0.5 rounded text-[#00dbe9] text-[10px] uppercase font-bold tracking-wider border border-[#44474a]">
                <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified
                </span>
                <span>Acoustic Lab Calibrated</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main PDP Showcase Stage */}
        <div className="w-full px-4 sm:px-8 lg:px-12 py-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: 360° Studio Chamber Viewer (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="relative bg-[#0d0e11] rounded overflow-hidden shadow-2xl border border-[#343538] flex flex-col select-none">
                {/* Chamber Top HUD */}
                <div className="relative z-30 flex items-center justify-between px-4 py-2.5 bg-[#1b1b1f]/90 backdrop-blur-md border-b border-[#343538]">
                  <div className="flex items-center gap-2.5 font-['Space_Grotesk']">
                    <span className="w-2 h-2 rounded-full bg-[#00dbe9] animate-pulse"></span>
                    <span className="text-[10px] tracking-widest uppercase text-[#00dbe9] font-bold">
                      360° ACOUSTIC CHAMBER VIEW
                    </span>
                    <span className="hidden sm:inline-block text-[#8f9194] text-[10px]">
                      | CALIBRATION: ACTIVE
                    </span>
                  </div>

                  <div className="flex items-center gap-3 font-['Space_Grotesk'] text-[11px]">
                    <div className="flex items-center gap-1.5 bg-[#1f1f23] px-2 py-0.5 rounded border border-[#343538]">
                      <span className="text-[#8f9194]">ROTATION:</span>
                      <span className="text-[#7df4ff] font-bold font-mono">
                        {Math.round(currentAngle).toString().padStart(3, '0')}°
                      </span>
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5 bg-[#1f1f23] px-2 py-0.5 rounded border border-[#343538]">
                      <span className="text-[#8f9194]">FOV:</span>
                      <span className="text-white font-mono">{isZoomed ? '1.5X' : '1.0X'}</span>
                    </div>
                  </div>
                </div>

                {/* Interactive 3D Turntable Arena */}
                <div
                  ref={chamberRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  className={`relative w-full aspect-[5/4] sm:aspect-[4/3] bg-[#0c0d10] overflow-hidden turntable-chamber flex items-center justify-center ${
                    isDragging ? 'cursor-grabbing' : 'cursor-grab'
                  }`}
                >
                  {/* Grid background */}
                  <div className="absolute inset-0 wireframe-grid opacity-30 pointer-events-none"></div>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,229,255,0.06)_0%,rgba(18,19,22,0.92)_70%)] pointer-events-none"></div>

                  {/* Cutaway Wireframe Overlay */}
                  {isWireframe && (
                    <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center animate-in fade-in duration-300">
                      <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.18)_0%,transparent_60%)] flex items-center justify-center">
                        <svg className="w-4/5 h-4/5 stroke-[#00dbe9]/40 fill-none" viewBox="0 0 400 400">
                          <ellipse cx="200" cy="200" rx="160" ry="80" strokeDasharray="4,4" strokeWidth="1"></ellipse>
                          <ellipse cx="200" cy="200" rx="120" ry="60" strokeWidth="1"></ellipse>
                          <ellipse cx="200" cy="200" rx="80" ry="40" strokeDasharray="2,2" strokeWidth="1"></ellipse>
                          <line strokeDasharray="2,4" strokeWidth="1" x1="200" x2="200" y1="40" y2="360"></line>
                          <line strokeDasharray="2,4" strokeWidth="1" x1="40" x2="360" y1="200" y2="200"></line>
                          <circle className="fill-[#00dbe9]/20 stroke-[#00dbe9]" cx="200" cy="200" r="14"></circle>
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* 3D Pedestal Compass Plate */}
                  <div
                    className="absolute bottom-8 w-72 sm:w-96 h-28 pointer-events-none flex items-center justify-center transition-transform duration-100 ease-out"
                    style={{
                      transform: `rotateX(68deg) rotateZ(${-currentAngle}deg)`,
                    }}
                  >
                    <div className="w-full h-full rounded-full border border-[#00dbe9]/30 shadow-[0_0_30px_rgba(0,229,255,0.15)] flex items-center justify-center relative">
                      <div className="w-[90%] h-[90%] rounded-full border border-[#44474a]/30 border-dashed"></div>
                      <div className="w-[70%] h-[70%] rounded-full bg-[#292a2d]/40 backdrop-blur-sm border border-[#00dbe9]/20"></div>
                      <span className="absolute top-1 text-[9px] font-mono font-bold text-[#00dbe9]">0° FRONT</span>
                      <span className="absolute right-2 text-[9px] font-mono text-[#8f9194]">90° R</span>
                      <span className="absolute bottom-1 text-[9px] font-mono text-[#8f9194]">180° REAR</span>
                      <span className="absolute left-2 text-[9px] font-mono text-[#8f9194]">270° L</span>
                    </div>
                  </div>

                  {/* Rotating Product Model Stage */}
                  <div
                    className="turntable-stage relative z-10 w-4/5 h-4/5 flex items-center justify-center pointer-events-none"
                    style={{
                      transform: `scale(${isZoomed ? 1.45 : 1.0}) rotateY(${Math.sin(rad) * 16}deg)`,
                    }}
                  >
                    {/* Perspective frames with trigonometric opacities */}
                    <img
                      src={product.images.front}
                      alt="0° Front"
                      className="absolute max-w-full max-h-full object-contain filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.85)] transition-opacity duration-200"
                      style={{ opacity: w0 }}
                    />
                    <img
                      src={product.images.oblique || product.images.front}
                      alt="90° Oblique"
                      className="absolute max-w-full max-h-full object-contain filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.85)] transition-opacity duration-200"
                      style={{ opacity: w90 }}
                    />
                    <img
                      src={product.images.chamber || product.images.front}
                      alt="180° Chamber"
                      className="absolute max-w-full max-h-full object-contain filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.85)] transition-opacity duration-200"
                      style={{ opacity: w180 }}
                    />
                    <img
                      src={product.images.case || product.images.front}
                      alt="270° Case Profile"
                      className="absolute max-w-full max-h-full object-contain filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.85)] transition-opacity duration-200"
                      style={{ opacity: w270 }}
                    />

                    {/* Hotspot 1: 45° Planar Diaphragm */}
                    {opacity45 > 0.1 && (
                      <div
                        className="pointer-events-auto absolute top-[38%] left-[28%] z-30 transition-all duration-300"
                        style={{
                          transform: 'translate(-50%, -50%)',
                          opacity: opacity45,
                        }}
                      >
                        <button
                          onClick={() => jumpToAngle(45)}
                          className="relative group/pin flex items-center justify-center w-7 h-7"
                          title="Inspect 45° Planar Diaphragm"
                        >
                          <span className="absolute w-full h-full rounded-full bg-[#00dbe9]/30 hotspot-pulse"></span>
                          <span className="w-3 h-3 rounded-full bg-[#00dbe9] ring-2 ring-white"></span>
                          <div className="opacity-0 group-hover/pin:opacity-100 transition-opacity absolute left-8 top-1/2 -translate-y-1/2 w-48 bg-[#1f1f23]/95 backdrop-blur-md p-2 rounded border border-[#00dbe9]/40 shadow-xl text-left z-40 pointer-events-none">
                            <span className="font-['Space_Grotesk'] text-[9px] uppercase text-[#00dbe9] block font-mono">
                              45° HOTSPOT
                            </span>
                            <span className="font-['Space_Grotesk'] text-[12px] text-white block leading-tight font-bold">
                              40mm Planar Transducer
                            </span>
                            <span className="font-['Hanken_Grotesk'] text-[11px] text-[#c5c7c9] block mt-0.5">
                              Dual symmetrical N52 magnetic push-pull array.
                            </span>
                          </div>
                        </button>
                      </div>
                    )}

                    {/* Hotspot 2: 180° Gimbal */}
                    {opacity180 > 0.1 && (
                      <div
                        className="pointer-events-auto absolute top-[24%] right-[32%] z-30 transition-all duration-300"
                        style={{
                          transform: 'translate(-50%, -50%)',
                          opacity: opacity180,
                        }}
                      >
                        <button
                          onClick={() => jumpToAngle(180)}
                          className="relative group/pin flex items-center justify-center w-7 h-7"
                          title="Inspect 180° CNC Gimbal"
                        >
                          <span className="absolute w-full h-full rounded-full bg-[#00dbe9]/30 hotspot-pulse"></span>
                          <span className="w-3 h-3 rounded-full bg-[#00dbe9] ring-2 ring-white"></span>
                          <div className="opacity-0 group-hover/pin:opacity-100 transition-opacity absolute right-8 top-1/2 -translate-y-1/2 w-48 bg-[#1f1f23]/95 backdrop-blur-md p-2 rounded border border-[#00dbe9]/40 shadow-xl text-left z-40 pointer-events-none">
                            <span className="font-['Space_Grotesk'] text-[9px] uppercase text-[#00dbe9] block font-mono">
                              180° REAR VIEW
                            </span>
                            <span className="font-['Space_Grotesk'] text-[12px] text-white block leading-tight font-bold">
                              Aviation Aluminum Gimbal
                            </span>
                            <span className="font-['Hanken_Grotesk'] text-[11px] text-[#c5c7c9] block mt-0.5">
                              Cold-machined 6061 yolk with friction damper.
                            </span>
                          </div>
                        </button>
                      </div>
                    )}

                    {/* Hotspot 3: 270° DAC Port */}
                    {opacity270 > 0.1 && (
                      <div
                        className="pointer-events-auto absolute bottom-[30%] right-[26%] z-30 transition-all duration-300"
                        style={{
                          transform: 'translate(-50%, -50%)',
                          opacity: opacity270,
                        }}
                      >
                        <button
                          onClick={() => jumpToAngle(270)}
                          className="relative group/pin flex items-center justify-center w-7 h-7"
                          title="Inspect 270° Lossless DAC Port"
                        >
                          <span className="absolute w-full h-full rounded-full bg-[#00dbe9]/30 hotspot-pulse"></span>
                          <span className="w-3 h-3 rounded-full bg-[#00dbe9] ring-2 ring-white"></span>
                          <div className="opacity-0 group-hover/pin:opacity-100 transition-opacity absolute right-8 top-1/2 -translate-y-1/2 w-52 bg-[#1f1f23]/95 backdrop-blur-md p-2 rounded border border-[#00dbe9]/40 shadow-xl text-left z-40 pointer-events-none">
                            <span className="font-['Space_Grotesk'] text-[9px] uppercase text-[#00dbe9] block font-mono">
                              270° FLANK VIEW
                            </span>
                            <span className="font-['Space_Grotesk'] text-[12px] text-white block leading-tight font-bold">
                              24-bit Lossless USB-C Port
                            </span>
                            <span className="font-['Hanken_Grotesk'] text-[11px] text-[#c5c7c9] block mt-0.5">
                              Direct studio bit-perfect streaming up to 192kHz.
                            </span>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Drag Cue Indicator */}
                  <div className="pointer-events-none absolute bottom-4 left-4 z-20 flex items-center gap-2 bg-[#0d0e11]/80 backdrop-blur-md px-2.5 py-1 rounded border border-[#343538] text-[#8f9194]">
                    <span className="material-symbols-outlined text-[15px] text-[#00dbe9]">drag_pan</span>
                    <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-wider font-mono">
                      DRAG OR SCRUB TO ROTATE
                    </span>
                  </div>

                  {/* Floating Action Tools (Top Right) */}
                  <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
                    {/* Wireframe toggle */}
                    <button
                      onClick={() => setIsWireframe(!isWireframe)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-['Space_Grotesk'] text-[10px] uppercase font-bold tracking-wider backdrop-blur-md transition-all border ${
                        isWireframe ? 'bg-[#00dbe9]/20 border-[#00dbe9] text-white' : 'bg-[#1f1f23]/90 border-[#44474a] text-[#c5c7c9] hover:bg-[#292a2d]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px] text-[#00dbe9]">grid_4x4</span>
                      <span className="hidden sm:inline">Wireframe</span>
                    </button>

                    {/* Zoom toggle */}
                    <button
                      onClick={() => setIsZoomed(!isZoomed)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-['Space_Grotesk'] text-[10px] uppercase font-bold tracking-wider backdrop-blur-md transition-all border ${
                        isZoomed ? 'bg-[#00dbe9]/20 border-[#00dbe9] text-white' : 'bg-[#1f1f23]/90 border-[#44474a] text-[#c5c7c9] hover:bg-[#292a2d]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">
                        {isZoomed ? 'zoom_out' : 'zoom_in'}
                      </span>
                      <span className="hidden sm:inline">{isZoomed ? 'Reset FOV' : '1.5x Zoom'}</span>
                    </button>

                    {/* Auto-rotate button */}
                    <button
                      onClick={() => setIsAutoRotating(!isAutoRotating)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-['Space_Grotesk'] text-[10px] uppercase font-bold tracking-wider backdrop-blur-md transition-all border ${
                        isAutoRotating ? 'bg-[#00dbe9]/20 border-[#00dbe9] text-white' : 'bg-[#1f1f23]/90 border-[#44474a] text-[#c5c7c9] hover:bg-[#292a2d]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px] text-[#00dbe9]">
                        {isAutoRotating ? 'pause' : 'play_arrow'}
                      </span>
                      <span>Auto-360°</span>
                    </button>
                  </div>
                </div>

                {/* Turntable Slider & Controller Bar */}
                <div className="px-4 py-3 bg-[#1b1b1f] border-t border-[#343538] flex flex-col gap-2.5">
                  <div className="flex items-center justify-between text-[#8f9194] font-['Space_Grotesk'] text-[11px] font-mono">
                    <span className="flex items-center gap-1 text-white font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00dbe9]"></span>
                      SCRUB TRACK
                    </span>
                    <div className="flex items-center gap-3 sm:gap-4 text-[10px]">
                      <span>0° FRONT</span>
                      <span>90° PROFILE</span>
                      <span>180° REAR</span>
                      <span>270° FLANK</span>
                      <span>360°</span>
                    </div>
                  </div>

                  {/* Range Slider */}
                  <div className="relative flex items-center">
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="1"
                      value={Math.round(currentAngle)}
                      onChange={(e) => {
                        setIsAutoRotating(false);
                        setCurrentAngle(parseFloat(e.target.value));
                      }}
                      className="w-full h-1.5 bg-[#343538] rounded-lg appearance-none cursor-ew-resize accent-[#7df4ff] focus:outline-none"
                    />
                  </div>

                  {/* Preset Buttons */}
                  <div className="flex items-center justify-between gap-1 overflow-x-auto pt-1 font-['Space_Grotesk'] text-[10px] uppercase font-mono">
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[#8f9194] mr-1">PRESETS:</span>
                      <button
                        onClick={() => jumpToAngle(0)}
                        className={`px-2 py-1 rounded border transition-colors ${
                          Math.round(currentAngle) === 0 ? 'bg-[#292a2d] text-[#00dbe9] border-[#00dbe9]' : 'bg-[#1f1f23] text-[#c5c7c9] border-[#343538]'
                        }`}
                      >
                        0° Front
                      </button>
                      <button
                        onClick={() => jumpToAngle(45)}
                        className={`px-2 py-1 rounded border transition-colors ${
                          Math.round(currentAngle) === 45 ? 'bg-[#292a2d] text-[#00dbe9] border-[#00dbe9]' : 'bg-[#1f1f23] text-[#c5c7c9] border-[#343538]'
                        }`}
                      >
                        45° Oblique
                      </button>
                      <button
                        onClick={() => jumpToAngle(90)}
                        className={`px-2 py-1 rounded border transition-colors ${
                          Math.round(currentAngle) === 90 ? 'bg-[#292a2d] text-[#00dbe9] border-[#00dbe9]' : 'bg-[#1f1f23] text-[#c5c7c9] border-[#343538]'
                        }`}
                      >
                        90° Profile
                      </button>
                      <button
                        onClick={() => jumpToAngle(180)}
                        className={`px-2 py-1 rounded border transition-colors ${
                          Math.round(currentAngle) === 180 ? 'bg-[#292a2d] text-[#00dbe9] border-[#00dbe9]' : 'bg-[#1f1f23] text-[#c5c7c9] border-[#343538]'
                        }`}
                      >
                        180° Cutaway
                      </button>
                      <button
                        onClick={() => jumpToAngle(270)}
                        className={`px-2 py-1 rounded border transition-colors ${
                          Math.round(currentAngle) === 270 ? 'bg-[#292a2d] text-[#00dbe9] border-[#00dbe9]' : 'bg-[#1f1f23] text-[#c5c7c9] border-[#343538]'
                        }`}
                      >
                        270° Ports
                      </button>
                    </div>

                    <button
                      onClick={() => jumpToAngle(0)}
                      className="shrink-0 text-[#8f9194] hover:text-white transition-colors flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[13px]">refresh</span>
                      <span>Reset</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Thumbnails Strip */}
              <div className="grid grid-cols-4 gap-3">
                <button
                  onClick={() => jumpToAngle(0)}
                  className={`group relative aspect-square bg-[#1b1b1f] rounded overflow-hidden p-1 transition-all border ${
                    Math.round(currentAngle) === 0 ? 'ring-1 ring-white border-white' : 'border-[#343538] opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={product.images.front} alt="0° Front" className="w-full h-full object-cover rounded" />
                  <span className="absolute bottom-1 left-1 font-['Space_Grotesk'] text-[9px] uppercase px-1 bg-[#0d0e11]/80 text-white rounded">
                    0° Front
                  </span>
                </button>

                <button
                  onClick={() => jumpToAngle(90)}
                  className={`group relative aspect-square bg-[#1b1b1f] rounded overflow-hidden p-1 transition-all border ${
                    Math.round(currentAngle) === 90 ? 'ring-1 ring-white border-white' : 'border-[#343538] opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={product.images.oblique || product.images.front} alt="90° Chamber" className="w-full h-full object-cover rounded" />
                  <span className="absolute bottom-1 left-1 font-['Space_Grotesk'] text-[9px] uppercase px-1 bg-[#0d0e11]/80 text-white rounded">
                    90° Chamber
                  </span>
                </button>

                <button
                  onClick={() => jumpToAngle(180)}
                  className={`group relative aspect-square bg-[#1b1b1f] rounded overflow-hidden p-1 transition-all border ${
                    Math.round(currentAngle) === 180 ? 'ring-1 ring-white border-white' : 'border-[#343538] opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={product.images.chamber || product.images.front} alt="180° Cutaway" className="w-full h-full object-cover rounded" />
                  <span className="absolute bottom-1 left-1 font-['Space_Grotesk'] text-[9px] uppercase px-1 bg-[#0d0e11]/80 text-white rounded">
                    180° Cutaway
                  </span>
                </button>

                <button
                  onClick={() => jumpToAngle(270)}
                  className={`group relative aspect-square bg-[#1b1b1f] rounded overflow-hidden p-1 transition-all border ${
                    Math.round(currentAngle) === 270 ? 'ring-1 ring-white border-white' : 'border-[#343538] opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={product.images.case || product.images.front} alt="270° Case" className="w-full h-full object-cover rounded" />
                  <span className="absolute bottom-1 left-1 font-['Space_Grotesk'] text-[9px] uppercase px-1 bg-[#0d0e11]/80 text-white rounded">
                    270° Case
                  </span>
                </button>
              </div>

              {/* Acoustic Provenance & Verification Curve */}
              <div className="bg-[#1b1b1f] p-4 rounded border border-[#343538] space-y-4 shadow-sm">
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-[#00dbe9] rounded-full"></span>
                    <span className="font-['Space_Grotesk'] text-[14px] text-white uppercase tracking-wider font-bold">
                      Acoustic Provenance & Verification
                    </span>
                  </div>
                  <span className="font-['Space_Grotesk'] text-[10px] uppercase text-[#8f9194]">
                    Lab Certificate ISO-9001 / Hi-Res
                  </span>
                </div>

                {/* SVG Visualizer */}
                <div className="bg-[#0d0e11] p-3 rounded flex flex-col gap-2 border border-[#292a2d]">
                  <div className="flex items-center justify-between font-['Space_Grotesk'] text-[10px] text-[#8f9194]">
                    <span>SUB-BASS (10Hz)</span>
                    <span>HARMONIC FLAT BAND (1kHz)</span>
                    <span>AIR TREBLE (45kHz)</span>
                  </div>
                  <div className="h-16 w-full flex items-end">
                    <svg className="w-full h-full text-[#00dbe9] stroke-current fill-none" preserveAspectRatio="none" viewBox="0 0 500 70">
                      <line className="stroke-[#343538]" strokeDasharray="3,3" strokeWidth="1" x1="0" x2="500" y1="35" y2="35"></line>
                      <path className="stroke-white" d="M 0,34 Q 40,32 80,33 T 160,35 T 260,35.5 T 360,34.8 T 440,33 T 500,37" strokeWidth="2"></path>
                      <path className="stroke-[#00dbe9]" d="M 0,33 Q 45,30 90,32 T 180,35 T 280,35.2 T 380,34 T 460,32 T 500,35" strokeWidth="2"></path>
                    </svg>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#8f9194] font-['Hanken_Grotesk']">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-white inline-block"></span>
                      Target Curve (Harman-Blowmaggy Lab)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#00dbe9] inline-block"></span>
                      Aura Studio Measured (+0.4 dB bass warmth)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Purchasing & Multi-Variant Selectors (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              {/* Department Tag & Title */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-[#292a2d] text-[#00dbe9] rounded font-['Space_Grotesk'] text-[10px] uppercase font-bold tracking-wider border border-[#44474a]">
                    {product.deptLabel} • {product.deptNumber}
                  </span>
                  <span className="text-[#8f9194] font-['Space_Grotesk'] text-[10px] uppercase">• Hi-Fi Series</span>
                </div>

                <h1
                  className="font-['Bodoni_Moda'] text-3xl sm:text-4xl text-white tracking-tight font-semibold"
                  style={{
                    background: 'linear-gradient(135deg, rgb(196, 181, 253) 0%, rgb(147, 197, 253) 50%, rgb(96, 165, 250) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {product.name}
                </h1>

                <p className="font-['Hanken_Grotesk'] text-[15px] text-[#c5c7c9] leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Price & Rating Box */}
              <div className="bg-[#1b1b1f] p-4 rounded border border-[#343538] space-y-2 shadow-sm">
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="font-['Space_Grotesk'] text-3xl font-bold text-white">
                      ${unitPrice.toFixed(2)}
                    </span>
                    <span className="font-['Space_Grotesk'] text-[10px] uppercase text-[#8f9194]">USD</span>
                    <span className="px-2 py-0.5 bg-[#ba012d]/20 text-[#ffb3b3] font-['Space_Grotesk'] text-[10px] font-bold rounded uppercase">
                      {product.badge || 'Lab Edition'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <div className="flex text-[#00dbe9] text-[15px]">
                      <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>star_half</span>
                    </div>
                    <span className="font-['Space_Grotesk'] text-[13px] font-bold text-white">{product.rating}</span>
                    <span className="font-['Hanken_Grotesk'] text-[12px] text-[#8f9194]">({product.reviewsCount})</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 font-['Hanken_Grotesk'] text-[12px] text-[#c5c7c9]">
                  <span className="material-symbols-outlined text-[16px] text-[#00dbe9]">credit_score</span>
                  <span>Or 4 interest-free payments of <strong className="text-white">${(unitPrice / 4).toFixed(2)}</strong> with Klarna</span>
                </div>
              </div>

              {/* Multi-Attribute Variant Selectors */}
              <div className="bg-[#1b1b1f] p-4 sm:p-5 rounded border border-[#343538] space-y-5 shadow-sm">
                {/* Attribute 1: Colorways */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-['Space_Grotesk'] text-[13px] uppercase font-bold tracking-wider text-white">
                      1. Colorway Palette
                    </label>
                    <span className="font-['Space_Grotesk'] text-[12px] text-[#00dbe9]">
                      {selectedColor} ({selectedColorStock})
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {product.variants?.colors?.map((col) => (
                      <button
                        key={col.name}
                        onClick={() => {
                          setSelectedColor(col.name);
                          setSelectedColorSku(col.sku);
                          setSelectedColorStock(col.stockDesc);
                        }}
                        className={`flex items-center justify-between p-2.5 rounded text-left transition-all border ${
                          selectedColor === col.name
                            ? 'bg-[#292a2d] border-white ring-1 ring-white'
                            : 'bg-[#1f1f23] border-[#343538] hover:bg-[#292a2d]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 rounded-full ring-1 ring-[#8f9194]" style={{ backgroundColor: col.hex }}></span>
                          <span className="font-['Space_Grotesk'] text-[12px] text-white font-medium">{col.name}</span>
                        </div>
                        <span className="font-['Space_Grotesk'] text-[9px] uppercase font-bold text-[#8f9194]">
                          {col.sku}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Attribute 2: Cushion Material Matrix */}
                {product.variants?.cushions && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-['Space_Grotesk'] text-[13px] uppercase font-bold tracking-wider text-white">
                        2. Acoustic Cushion Matrix
                      </label>
                      <span className="font-['Space_Grotesk'] text-[12px] text-[#00dbe9]">
                        {selectedCushion}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2">
                      {product.variants.cushions.map((cush) => (
                        <label
                          key={cush.name}
                          onClick={() => {
                            setSelectedCushion(cush.name);
                            setSelectedCushionSku(cush.sku);
                            setCushionPriceAdd(cush.priceAdd);
                          }}
                          className={`cursor-pointer flex items-center justify-between p-3 rounded transition-all border ${
                            selectedCushion === cush.name
                              ? 'bg-[#292a2d] border-white ring-1 ring-white'
                              : 'bg-[#1f1f23] border-[#343538] hover:bg-[#292a2d]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="cushion"
                              checked={selectedCushion === cush.name}
                              readOnly
                              className="accent-white w-4 h-4"
                            />
                            <div>
                              <p className="font-['Space_Grotesk'] text-[12px] font-bold text-white">{cush.name}</p>
                              <p className="font-['Hanken_Grotesk'] text-[11px] text-[#8f9194]">{cush.desc}</p>
                            </div>
                          </div>
                          <span className="font-['Space_Grotesk'] text-[12px] font-bold font-mono text-white shrink-0">
                            {cush.priceAdd === 0 ? 'Included' : `+$${cush.priceAdd}.00`}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attribute 3: Headband Caliper Tension */}
                {product.variants?.archFits && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-['Space_Grotesk'] text-[13px] uppercase font-bold tracking-wider text-white">
                        3. Headband Caliper Tension
                      </label>
                      <span className="font-['Space_Grotesk'] text-[12px] text-[#00dbe9]">
                        {selectedArch}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {product.variants.archFits.map((arch) => (
                        <button
                          key={arch.name}
                          onClick={() => {
                            setSelectedArch(arch.name);
                            setSelectedArchSku(arch.sku);
                          }}
                          className={`p-2.5 rounded text-left transition-all border ${
                            selectedArch === arch.name
                              ? 'bg-[#292a2d] border-white ring-1 ring-white'
                              : 'bg-[#1f1f23] border-[#343538] hover:bg-[#292a2d]'
                          }`}
                        >
                          <span className="font-['Space_Grotesk'] text-[12px] font-bold text-white block">{arch.name}</span>
                          <span className="font-['Hanken_Grotesk'] text-[11px] text-[#8f9194] block mt-0.5">{arch.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dynamic SKU & Logistics Hub Notice */}
                <div className="p-3 bg-[#0d0e11] rounded border border-[#292a2d] flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-['Space_Grotesk'] text-[10px] uppercase">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-[#00dbe9]">warehouse</span>
                    <span>
                      Config SKU: <strong className="text-white font-mono">{dynamicSku}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#8f9194]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00dbe9]"></span>
                    <span>West Coast Hub • Bay 12 (Direct Dispatch)</span>
                  </div>
                </div>
              </div>

              {/* Quantity, Main Buy CTA, Guarantee */}
              <div className="bg-[#1b1b1f] p-4 rounded border border-[#343538] space-y-4 shadow-md">
                <div className="flex items-center gap-3">
                  {/* Stepper */}
                  <div className="flex items-center bg-[#292a2d] rounded p-1 shrink-0 border border-[#343538]">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-9 h-9 flex items-center justify-center text-white hover:bg-[#343538] rounded transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">remove</span>
                    </button>
                    <span className="w-10 text-center font-['Space_Grotesk'] text-[15px] font-bold text-white font-mono">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-9 h-9 flex items-center justify-center text-white hover:bg-[#343538] rounded transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                    </button>
                  </div>

                  {/* Buy Button */}
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 flex items-center justify-center gap-2 bg-white text-[#121316] py-3.5 px-4 rounded font-['Space_Grotesk'] text-[14px] font-bold uppercase tracking-wider hover:bg-[#ba012d] hover:text-white transition-all shadow-md active:scale-[0.99] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                    <span>Add to Unified Cart — ${totalPrice.toFixed(2)}</span>
                  </button>

                  {/* Wishlist */}
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="w-12 h-12 flex items-center justify-center bg-[#292a2d] hover:bg-[#343538] text-white rounded border border-[#343538] transition-colors shrink-0"
                    title="Save to Wishlist"
                  >
                    <span
                      className="material-symbols-outlined text-[20px]"
                      style={wishlisted ? { fontVariationSettings: "'FILL' 1", color: '#ffb3b3' } : undefined}
                    >
                      favorite
                    </span>
                  </button>
                </div>

                {/* Single Parcel Guarantee */}
                <div className="bg-[#0d0e11] p-3 rounded border border-[#292a2d] flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#ba012d]/20 text-[#ffb3b3] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[16px]">inventory_2</span>
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-['Space_Grotesk'] text-[12px] text-white font-bold uppercase tracking-wider">
                      The Blowmaggy Single-Parcel Guarantee
                    </p>
                    <p className="font-['Hanken_Grotesk'] text-[12px] text-[#8f9194] leading-snug">
                      Bundles smoothly with items from Beauty, Fashion & Pantry into <strong className="text-white">1 consolidated luxury freight parcel</strong>. Zero split deliveries. Zero fragmented courier fees.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Blueprint Cards */}
        {product.specs && (
          <div className="w-full px-4 sm:px-8 lg:px-12 py-12 max-w-7xl mx-auto">
            <div className="bg-[#1b1b1f] rounded p-6 sm:p-8 border border-[#343538] space-y-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-widest text-[#00dbe9] font-bold">
                    Engineering Blueprints
                  </span>
                  <h2
                    className="font-['Bodoni_Moda'] text-2xl sm:text-3xl text-white mt-1 font-semibold"
                    style={{
                      background: 'linear-gradient(135deg, rgb(196, 181, 253) 0%, rgb(147, 197, 253) 50%, rgb(96, 165, 250) 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Acoustic & Material Specifications
                  </h2>
                </div>
                <p className="font-['Hanken_Grotesk'] text-[13px] text-[#8f9194] max-w-md">
                  Every acoustic curve tuned and bench-certified in the Zurich Blowmaggy Acoustics facility before unified parcel packaging.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {product.specs.map((sp) => (
                  <div key={sp.label} className="bg-[#1f1f23] p-4 rounded border border-[#343538] space-y-2">
                    <span className="material-symbols-outlined text-[#00dbe9] text-[24px]">{sp.icon}</span>
                    <p className="font-['Space_Grotesk'] text-[10px] uppercase tracking-wider text-[#8f9194] font-bold">{sp.label}</p>
                    <p className="font-['Space_Grotesk'] text-[14px] font-bold text-white">{sp.value}</p>
                    <p className="font-['Hanken_Grotesk'] text-[12px] text-[#c5c7c9] leading-snug">{sp.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Cross-Department Pairing Showcase: Complete Your Unified Parcel */}
        {product.pairings && (
          <div className="w-full px-4 sm:px-8 lg:px-12 py-10 max-w-7xl mx-auto">
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#ba012d]"></span>
                    <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-widest text-[#8f9194] font-bold">
                      Multi-Department Cross-Docking
                    </span>
                  </div>
                  <h2
                    className="font-['Bodoni_Moda'] text-2xl sm:text-3xl text-white mt-1 font-semibold"
                    style={{
                      background: 'linear-gradient(135deg, rgb(196, 181, 253) 0%, rgb(147, 197, 253) 50%, rgb(96, 165, 250) 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Complete Your Unified Parcel
                  </h2>
                </div>
                <p className="font-['Hanken_Grotesk'] text-[13px] text-[#c5c7c9] max-w-lg">
                  Add artisan items from Beauty, Grocery, and Atelier Fashion. They will be staged concurrently at our centralized cross-dock and delivered in a single master presentation box.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {product.pairings.map((pair) => (
                  <div
                    key={pair.id}
                    className="bg-[#1b1b1f] rounded border border-[#343538] overflow-hidden group shadow-sm flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="relative aspect-[4/3] bg-[#0d0e11] overflow-hidden">
                        <span className="absolute top-3 left-3 z-10 px-2 py-0.5 bg-[#0d0e11]/80 text-[#7df4ff] font-['Space_Grotesk'] text-[10px] uppercase font-bold tracking-wider rounded backdrop-blur-sm border border-[#343538]">
                          {pair.deptLabel}
                        </span>
                        <img
                          src={pair.image}
                          alt={pair.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-4 space-y-1">
                        <div className="flex items-baseline justify-between">
                          <h3 className="font-['Bodoni_Moda'] text-[17px] font-semibold text-white">{pair.name}</h3>
                          <span className="font-['Space_Grotesk'] text-[16px] font-bold text-white">${pair.price.toFixed(2)}</span>
                        </div>
                        <p className="font-['Hanken_Grotesk'] text-[12px] text-[#8f9194] leading-relaxed">
                          {pair.desc}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 pt-0">
                      <button
                        onClick={() => {
                          const matched = PRODUCTS.find((p) => p.id === pair.id);
                          if (matched) addToCart(matched, 1);
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-[#292a2d] hover:bg-white hover:text-[#121316] py-2.5 px-3 rounded text-white font-['Space_Grotesk'] text-[12px] uppercase font-bold tracking-wider transition-all cursor-pointer border border-[#44474a]"
                      >
                        <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
                        <span>+ Bundle into Box (${pair.price.toFixed(0)})</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Audiophile Reviews Section */}
        <div className="w-full px-4 sm:px-8 lg:px-12 py-10 max-w-7xl mx-auto">
          <div className="bg-[#1b1b1f] p-6 sm:p-8 rounded border border-[#343538] space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Rating Stats (4 cols) */}
              <div className="lg:col-span-4 space-y-4">
                <div>
                  <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-widest text-[#8f9194] font-bold">
                    Verified Audiophile Community
                  </span>
                  <h3
                    className="font-['Bodoni_Moda'] text-2xl text-white mt-1 font-semibold"
                    style={{
                      background: 'linear-gradient(135deg, rgb(196, 181, 253) 0%, rgb(147, 197, 253) 50%, rgb(96, 165, 250) 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Acoustic Ratings
                  </h3>
                </div>

                <div className="flex items-baseline gap-3">
                  <span className="font-['Space_Grotesk'] text-5xl font-bold text-white">4.9</span>
                  <div>
                    <div className="flex text-[#00dbe9] text-[18px]">
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star_half</span>
                    </div>
                    <p className="font-['Hanken_Grotesk'] text-[12px] text-[#8f9194]">Across 184 verified purchases</p>
                  </div>
                </div>

                {/* Bars */}
                <div className="space-y-1.5 font-['Space_Grotesk'] text-[10px] uppercase">
                  <div className="flex items-center gap-2">
                    <span className="w-10 text-[#8f9194]">5 Star</span>
                    <div className="flex-1 h-1.5 bg-[#0d0e11] rounded-full overflow-hidden">
                      <div className="h-full bg-white rounded-full" style={{ width: '92%' }}></div>
                    </div>
                    <span className="w-8 text-right text-white">92%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-10 text-[#8f9194]">4 Star</span>
                    <div className="flex-1 h-1.5 bg-[#0d0e11] rounded-full overflow-hidden">
                      <div className="h-full bg-white/70 rounded-full" style={{ width: '6%' }}></div>
                    </div>
                    <span className="w-8 text-right text-white">6%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-10 text-[#8f9194]">3 Star</span>
                    <div className="flex-1 h-1.5 bg-[#0d0e11] rounded-full overflow-hidden">
                      <div className="h-full bg-white/40 rounded-full" style={{ width: '2%' }}></div>
                    </div>
                    <span className="w-8 text-right text-white">2%</span>
                  </div>
                </div>

                <div className="p-3 bg-[#0d0e11] rounded border border-[#292a2d] space-y-1">
                  <p className="font-['Space_Grotesk'] text-[12px] font-bold text-white">Soundstage Score</p>
                  <div className="flex items-center justify-between text-[12px] font-['Hanken_Grotesk'] text-[#8f9194]">
                    <span>Near-field Studio Accuracy</span>
                    <span className="text-[#00dbe9] font-bold">9.8 / 10</span>
                  </div>
                </div>
              </div>

              {/* Reviews Feed (8 cols) */}
              <div className="lg:col-span-8 space-y-4">
                {/* Review 1 */}
                <div className="bg-[#1f1f23] p-4 sm:p-5 rounded border border-[#343538] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-['Space_Grotesk'] text-[14px] font-bold text-white">Dr. Soren K.</span>
                      <span className="px-2 py-0.5 bg-[#292a2d] text-[#00dbe9] font-['Space_Grotesk'] text-[9px] uppercase font-bold rounded">
                        Acoustics Lead, Copenhagen
                      </span>
                    </div>
                    <span className="font-['Space_Grotesk'] text-[10px] text-[#8f9194] uppercase">3 Days Ago</span>
                  </div>
                  <div className="flex text-[#00dbe9] text-[14px]">
                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  </div>
                  <p className="font-['Bodoni_Moda'] text-[16px] font-semibold text-white">
                    "Uncanny planar speed with zero low-end bloat."
                  </p>
                  <p className="font-['Hanken_Grotesk'] text-[13px] text-[#c5c7c9] leading-relaxed">
                    The transients on acoustic percussions are the fastest I have measured in a wireless architecture. Having the integrated USB DAC capability allows me to switch from the morning commute directly to lossless master stems at my mixing console without changing headphones.
                  </p>
                  <div className="pt-2 flex items-center gap-3 font-['Space_Grotesk'] text-[10px] uppercase text-[#8f9194] border-t border-[#343538]/40">
                    <span>Verified Cross-Order: Received with Italian Overcoat in 1 carton</span>
                    <span>•</span>
                    <span>Obsidian / Lambskin / Standard</span>
                  </div>
                </div>

                {/* Review 2 */}
                <div className="bg-[#1f1f23] p-4 sm:p-5 rounded border border-[#343538] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-['Space_Grotesk'] text-[14px] font-bold text-white">Elena V.</span>
                      <span className="px-2 py-0.5 bg-[#292a2d] text-[#ffb3b3] font-['Space_Grotesk'] text-[9px] uppercase font-bold rounded">
                        Verified VIP Shopper
                      </span>
                    </div>
                    <span className="font-['Space_Grotesk'] text-[10px] text-[#8f9194] uppercase">1 Week Ago</span>
                  </div>
                  <div className="flex text-[#00dbe9] text-[14px]">
                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  </div>
                  <p className="font-['Bodoni_Moda'] text-[16px] font-semibold text-white">
                    "Blowmaggy's unified box delivered everything pristine."
                  </p>
                  <p className="font-['Hanken_Grotesk'] text-[13px] text-[#c5c7c9] leading-relaxed">
                    I was skeptical about ordering high-end headphones at the exact same checkout as my pantry olive oil and night serums. Opening a single unified luxury black box where every item was meticulously compartmentalized and protected was a true department store revelation.
                  </p>
                  <div className="pt-2 flex items-center gap-3 font-['Space_Grotesk'] text-[10px] uppercase text-[#8f9194] border-t border-[#343538]/40">
                    <span>Verified Cross-Order: Electronics + Beauty + Pantry</span>
                    <span>•</span>
                    <span>Titanium / Merino Wool</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
