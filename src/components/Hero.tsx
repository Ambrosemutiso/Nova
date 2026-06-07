//Object literal may only specify known properties, and 'ring' does not exist in type 'Properties<string | number, string & {}>'.
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Banner = {
  id: number;
  src: string;
  alt: string;
  link: string;
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
      <div className="w-full rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse"
        style={{ aspectRatio: '21/9' }} />
    );
  }

  return (
    <div className="w-full relative select-none">

      {/* ── Main slider track ── */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-2xl shadow-xl cursor-grab active:cursor-grabbing"
        style={{ aspectRatio: '21/9' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={onMouseLeave}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* slides */}
        {banners.map((banner, i) => {
          /* offset: current slide = 0, others are ±1, ±2 etc */
          const offset = i - current;
          /* wrap-around: if offset is > half the total, flip it */
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
              {/* shimmer while image loads */}
              {!imageLoaded[i] && (
                <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100
                  animate-[shimmer_1.4s_infinite_linear]"
                  style={{ backgroundSize: '800px 100%' }}
                />
              )}

              {/* prevent Link navigation during drag */}
              <div
                onClick={(e) => { if (Math.abs(dragDelta) > 5) e.preventDefault(); }}
              >
                <Link href={banner.link} draggable={false}>
                  <Image
                    src={banner.src}
                    alt={banner.alt}
                    fill
                    sizes="100vw"
                    className="object-cover pointer-events-none"
                    priority={i === 0}
                    draggable={false}
                    onLoad={() => setImageLoaded((prev) => ({ ...prev, [i]: true }))}
                  />
                  {/* subtle dark gradient at bottom for dot visibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
                </Link>
              </div>
            </div>
          );
        })}

        {/* ── Prev / Next arrows ── */}
        <button
          onClick={(e) => { e.stopPropagation(); prev(); }}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-10
            w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow-lg
            flex items-center justify-center
            opacity-0 group-hover:opacity-100
            hover:bg-white hover:scale-110 active:scale-95
            transition-all duration-200"
          style={{ opacity: isHovered ? 1 : 0 }}
          aria-label="Previous"
        >
          <ChevronLeft className="w-5 h-5 text-gray-800" />
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); next(); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-10
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
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
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
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20 z-10">
            <div
              key={current} // re-mounts on slide change to restart animation
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

      {/* progress keyframe injected via style tag */}
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