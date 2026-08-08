'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Product = {
  _id?: string;
  name?: string;
  images?: string[];
  calculatedPrice?: number;
};

type Banner = {
  id: number;
  src: string;
  alt: string;
  link: string;
  heading?: string;
  cta?: string;
  products?: Product[];
};

const SLIDE_INTERVAL = 5000;

export default function HeroSlider() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragDelta, setDragDelta] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [imageLoaded, setImageLoaded] = useState<Record<number, boolean>>({});
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /* ── fetch banners ── */
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch('/api/products/featured');
        if (!res.ok) throw new Error('Failed to fetch banners');
        const data = await res.json();
        setBanners(data);
      } catch (error) {
        console.error('Banner fetch error:', error);
      }
    };
    fetchBanners();
  }, []);

  /* ── navigation ── */
  const goTo = useCallback((index: number) => {
    if (isAnimating || banners.length === 0) return;
    setIsAnimating(true);
    setCurrent((index + banners.length) % banners.length);
    setTimeout(() => setIsAnimating(false), 500);
  }, [isAnimating, banners.length]);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  /* ── autoplay ── */
  const resetAutoplay = useCallback(() => {
    if (autoplayRef.current) clearInterval(autoplayRef.current);
    if (!isHovered) {
      autoplayRef.current = setInterval(next, SLIDE_INTERVAL);
    }
  }, [isHovered, next]);

  useEffect(() => {
    resetAutoplay();
    return () => { if (autoplayRef.current) clearInterval(autoplayRef.current); };
  }, [resetAutoplay]);

  /* ── touch / mouse drag ── */
  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    setDragStart(clientX);
    setDragDelta(0);
    if (autoplayRef.current) clearInterval(autoplayRef.current);
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;
    setDragDelta(clientX - dragStart);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const threshold = 60;
    if (dragDelta < -threshold) next();
    else if (dragDelta > threshold) prev();
    setDragDelta(0);
    resetAutoplay();
  };

  /* mouse events */
  const onMouseDown  = (e: React.MouseEvent) => handleDragStart(e.clientX);
  const onMouseMove  = (e: React.MouseEvent) => handleDragMove(e.clientX);
  const onMouseUp    = () => handleDragEnd();
  const onMouseLeave = () => { handleDragEnd(); setIsHovered(false); };

  /* touch events */
  const onTouchStart = (e: React.TouchEvent) => handleDragStart(e.touches[0].clientX);
  const onTouchMove  = (e: React.TouchEvent) => handleDragMove(e.touches[0].clientX);
  const onTouchEnd   = () => handleDragEnd();

  if (banners.length === 0) {
    return (
      <div className="w-full rounded-3xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse h-[320px] sm:h-[400px] md:h-[460px] lg:h-[560px]" />
    );
  }

  const activeBanner = banners[current];

  // Podium arrangement: tallest pedestal in the center, so with 3 products
  // the visual order becomes [2nd, 1st, 3rd] rather than left-to-right rank.
  const podiumProducts = (activeBanner?.products ?? []).slice(0, 3);
  const arranged = podiumProducts.length === 3
    ? [podiumProducts[1], podiumProducts[0], podiumProducts[2]]
    : podiumProducts;
  const pedestalHeights = podiumProducts.length === 3 ? [56, 76, 46] : podiumProducts.map(() => 60);

  return (
    <div className="w-full relative select-none">

      {/* ── Main slider stage ── */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-3xl shadow-2xl cursor-grab active:cursor-grabbing h-[320px] sm:h-[400px] md:h-[460px] lg:h-[560px] bg-neutral-900"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={onMouseLeave}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* slides — image only, no cropping */}
        {banners.map((banner, i) => {
          const offset = i - current;
          const len = banners.length;
          const wrapped = ((offset + len + Math.floor(len / 2)) % len) - Math.floor(len / 2);

          const translateX = wrapped * 100 + (isDragging ? (dragDelta / (containerRef.current?.clientWidth || 1)) * 100 : 0);
          const isVisible = Math.abs(wrapped) <= 1;

          return (
            <div
              key={banner.id}
              className="absolute inset-0"
              style={{
                transform:  `translateX(${translateX}%)`,
                transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                zIndex:     wrapped === 0 ? 2 : 1,
                visibility: isVisible ? 'visible' : 'hidden',
                willChange: 'transform',
              }}
            >
              {!imageLoaded[i] && (
                <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100
                  animate-[shimmer_1.4s_infinite_linear]"
                  style={{ backgroundSize: '800px 100%' }}
                />
              )}

              <div onClick={(e) => { if (Math.abs(dragDelta) > 5) e.preventDefault(); }} className="absolute inset-0">
              
                <div className="absolute inset-0 overflow-hidden">
                  <Image
                    src={banner.src}
                    alt=""
                    fill
                    sizes="100vw"
                    aria-hidden
                    className="object-cover scale-125 blur-3xl saturate-150 opacity-70 pointer-events-none"/>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-black/30" />
                </div>

                {/* real banner image, shown in full */}
                <Link href={banner.link} draggable={false} className="absolute inset-0 flex items-center justify-center p-4 sm:p-6 md:p-10">
                  <div className="relative w-full h-full">
                    <Image
                      src={banner.src}
                      alt={banner.alt}
                      fill
                      sizes="100vw"
                      className="object-contain drop-shadow-2xl pointer-events-none"
                      priority={i === 0}
                      draggable={false}
                      onLoad={() => setImageLoaded((prev) => ({ ...prev, [i]: true }))}
                    />
                  </div>
                </Link>
              </div>
            </div>
          );
        })}

        <div className="absolute inset-0 z-20 pointer-events-none">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={activeBanner?.id}
              initial={{ y: 48, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -64, opacity: 0 }}
              transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="absolute inset-0"
            >

              {arranged.length > 0 && (
                <div className="absolute right-4 bottom-4 sm:right-6 sm:bottom-6 md:right-10 md:bottom-8 flex items-end gap-2 sm:gap-3 pointer-events-auto">
                  {arranged.map((p, i) => (
                    <div key={p?._id || i} className="flex flex-col items-center">
                      <div className="relative -mb-3 h-9 w-9 sm:h-11 sm:w-11 md:h-14 md:w-14 rounded-full ring-2 ring-white/85 shadow-lg overflow-hidden bg-white">
                        {p?.images?.[0] && (
                          <img src={p.images[0]} alt={p.name || 'Product'} className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div
                        className="w-12 sm:w-16 md:w-20 rounded-t-xl bg-gradient-to-b from-white/45 to-white/10 backdrop-blur-md border border-white/30 shadow-inner"
                        style={{ height: `${pedestalHeights[i]}px` }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* text panel — left side, glass card */}
              <div className="absolute left-3 sm:left-6 md:left-10 top-1/2 -translate-y-1/2 w-[62%] sm:w-[52%] md:w-[36%] max-w-xs pointer-events-auto">
                <div className="rounded-2xl md:rounded-3xl bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl border border-white/25 shadow-2xl p-4 sm:p-6 md:p-7">
                  <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.18em] text-orange-300 drop-shadow">
                    Featured this week
                  </p>
                  <h2 className="mt-1.5 text-lg sm:text-2xl md:text-3xl font-extrabold leading-tight text-white drop-shadow-md">
                    {activeBanner?.heading}
                  </h2>
                  {activeBanner?.cta && (
                    <Link
                      href={activeBanner.link}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-neutral-900 shadow-lg transition hover:scale-105 hover:bg-orange-50"
                    >
                      {activeBanner.cta}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Prev / Next arrows ── */}
        <button
          onClick={(e) => { e.stopPropagation(); prev(); }}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-30
            w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow-lg
            flex items-center justify-center
            hover:bg-white hover:scale-110 active:scale-95
            transition-all duration-200"
          style={{ opacity: isHovered ? 1 : 0 }}
          aria-label="Previous"
        >
          <ChevronLeft className="w-5 h-5 text-gray-800" />
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); next(); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-30
            w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow-lg
            flex items-center justify-center
            hover:bg-white hover:scale-110 active:scale-95
            transition-all duration-200"
          style={{ opacity: isHovered ? 1 : 0 }}
          aria-label="Next"
        >
          <ChevronRight className="w-5 h-5 text-gray-800" />
        </button>

        {/* ── Dot indicators ── */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); goTo(i); }}
              className="transition-all duration-300 rounded-full bg-white shadow-sm"
              style={{
                width:   i === current ? '20px' : '6px',
                height:  '6px',
                opacity: i === current ? 1 : 0.5,
              }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* ── Progress bar ── */}
        {!isHovered && !isDragging && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20 z-30">
            <div
              key={current}
              className="h-full bg-white/70 rounded-full"
              style={{
                animation: `progress ${SLIDE_INTERVAL}ms linear forwards`,
              }}
            />
          </div>
        )}
      </div>

      {/* ── Thumbnail strip (desktop only) ── */}
      {banners.length > 1 && (
        <div className="hidden md:flex gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar">
          {banners.map((banner, i) => (
            <button
              key={banner.id}
              onClick={() => goTo(i)}
              className="shrink-0 relative rounded-xl overflow-hidden transition-all duration-200"
              style={{
                width:   '80px',
                height:  '45px',
                opacity: i === current ? 1 : 0.5,
                outline: i === current ? '2px solid #f97316' : '2px solid transparent',
              }}
              aria-label={`Go to slide ${i + 1}`}
            >
              <Image
                src={banner.src}
                alt={banner.alt}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <style>{`
        @keyframes progress {
          from { width: 0%; }
          to   { width: 100%; }
        }
        @keyframes shimmer {
          0%   { background-position: -800px 0; }
          100% { background-position: 800px 0; }
        }
      `}</style>
    </div>
  );
}