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

  const onMouseDown  = (e: React.MouseEvent) => handleDragStart(e.clientX);
  const onMouseMove  = (e: React.MouseEvent) => handleDragMove(e.clientX);
  const onMouseUp    = () => handleDragEnd();
  const onMouseLeave = () => { handleDragEnd(); setIsHovered(false); };

  const onTouchStart = (e: React.TouchEvent) => handleDragStart(e.touches[0].clientX);
  const onTouchMove  = (e: React.TouchEvent) => handleDragMove(e.touches[0].clientX);
  const onTouchEnd   = () => handleDragEnd();

  if (banners.length === 0) {
    return (
      <div className="w-full rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse aspect-[16/9] sm:aspect-[16/7] md:aspect-[21/7]" />
    );
  }

  const activeBanner = banners[current];

  const podiumProducts = (activeBanner?.products ?? []).slice(0, 3);
  const arranged = podiumProducts.length === 3
    ? [podiumProducts[1], podiumProducts[0], podiumProducts[2]]
    : podiumProducts;
  const pedestalHeights = podiumProducts.length === 3 ? [48, 66, 38] : podiumProducts.map(() => 52);

  return (
    <div className="w-full relative select-none">

      {/* ── Main slider stage — sized by aspect ratio, not a fixed height,
           so object-cover fills it edge-to-edge with no letterbox/frame ── */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-2xl shadow-lg cursor-grab active:cursor-grabbing
          aspect-[16/9] sm:aspect-[16/7] md:aspect-[21/7]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={onMouseLeave}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
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

              {/* image fills the frame completely — no padding, no backdrop clone */}
              <Link
                href={banner.link}
                draggable={false}
                className="absolute inset-0"
                onClick={(e) => { if (Math.abs(dragDelta) > 5) e.preventDefault(); }}
              >
                <Image
                  src={banner.src}
                  alt={banner.alt}
                  fill
                  sizes="100vw"
                  className="object-cover object-center pointer-events-none"
                  priority={i === 0}
                  draggable={false}
                  onLoad={() => setImageLoaded((prev) => ({ ...prev, [i]: true }))}
                />
                {/* soft scrim so overlaid text/CTA stay legible without boxing them in */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/10 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              </Link>
            </div>
          );
        })}

        {/* ── Text + podium overlay — sits directly on the photo, no card boundary ── */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={activeBanner?.id}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -56, opacity: 0 }}
              transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="absolute inset-0"
            >
              {/* text — left side, printed straight onto the image */}
              <div className="absolute left-4 sm:left-8 md:left-14 top-1/2 -translate-y-1/2 w-[64%] sm:w-[50%] md:w-[36%] pointer-events-auto">
                <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-orange-300 drop-shadow-md">
                  Featured this week
                </p>
                <h2 className="mt-1.5 text-lg sm:text-3xl md:text-4xl font-extrabold leading-[1.1] text-white drop-shadow-lg">
                  {activeBanner?.heading}
                </h2>
                {activeBanner?.cta && (
                  <Link
                    href={activeBanner.link}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur-sm
                      px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-neutral-900 shadow-lg
                      transition hover:scale-105 hover:bg-white"
                  >
                    {activeBanner.cta}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>

              {/* podium — bottom right, resting straight on the image */}
              {arranged.length > 0 && (
                <div className="absolute right-4 bottom-3 sm:right-8 sm:bottom-5 md:right-14 md:bottom-6 flex items-end gap-2 sm:gap-3 pointer-events-auto">
                  {arranged.map((p, i) => (
                    <div key={p?._id || i} className="flex flex-col items-center">
                      <div className="relative -mb-3 h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full ring-2 ring-white/90 shadow-lg overflow-hidden bg-white">
                        {p?.images?.[0] && (
                          <img src={p.images[0]} alt={p.name || 'Product'} className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div
                        className="w-11 sm:w-14 md:w-16 rounded-t-lg bg-white/25 shadow-[0_4px_16px_rgba(0,0,0,0.25)]"
                        style={{ height: `${pedestalHeights[i]}px` }}
                      />
                    </div>
                  ))}
                </div>
              )}
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