'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Play,
  Sparkles,
} from 'lucide-react';

type AdProduct = {
  _id: string;
  name?: string;
  calculatedPrice?: number;
  oldPrice?: number;
  images?: string[];
  slug?: string;
};

type Ad = {
  _id: string;
  title: string;
  description?: string;
  mediaUrl: string;
  mediaType: 'video' | 'image';
  sellerId: string;
  product?: AdProduct | null;
  category?: string;
  views: number;
};

function formatViews(value: number) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }

  return String(value);
}

export default function SponsoredAdsCarousel() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const trackRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  useEffect(() => {
    let cancelled = false;

    async function loadAds() {
      try {
        const response = await fetch('/api/ads/list');

        if (!response.ok) {
          throw new Error('Unable to load advertisements');
        }

        const data = await response.json();

        const merged: Ad[] = [
          ...(Array.isArray(data.sellerAds) ? data.sellerAds : []),
          ...(Array.isArray(data.otherAds) ? data.otherAds : []),
        ];

        // Remove duplicate IDs and skip incomplete advertisements.
        const uniqueAds = Array.from(
          new Map(
            merged
              .filter(
                (ad) =>
                  ad?._id &&
                  ad.title &&
                  ad.mediaUrl &&
                  ['image', 'video'].includes(ad.mediaType)
              )
              .map((ad) => [String(ad._id), ad])
          ).values()
        );

        if (!cancelled) {
          setAds(uniqueAds.slice(0, 12));
        }
      } catch (error) {
        console.error('Failed to load sponsored ads:', error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAds();

    return () => {
      cancelled = true;
    };
  }, []);

  const scrollToCard = useCallback((direction: 'next' | 'prev') => {
    const track = trackRef.current;
    if (!track) return;

    const firstCard = track.querySelector<HTMLElement>(
      '[data-ad-card]'
    );

    if (!firstCard) return;

    const cardWidth =
      firstCard.getBoundingClientRect().width + 16;

    const maxIndex = Math.max(
      0,
      Math.ceil(track.scrollWidth / cardWidth) -
        Math.floor(track.clientWidth / cardWidth)
    );

    const nextIndex =
      direction === 'next'
        ? Math.min(activeIndex + 1, maxIndex)
        : Math.max(activeIndex - 1, 0);

    track.scrollTo({
      left: nextIndex * cardWidth,
      behavior: 'smooth',
    });

    setActiveIndex(nextIndex);
  }, [activeIndex]);

  // Keep the active index in sync with manual scrolling.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let timeout: ReturnType<typeof setTimeout>;

    const handleScroll = () => {
      clearTimeout(timeout);

      timeout = setTimeout(() => {
        const card = track.querySelector<HTMLElement>(
          '[data-ad-card]'
        );

        if (!card) return;

        const cardWidth =
          card.getBoundingClientRect().width + 16;

        setActiveIndex(
          Math.round(track.scrollLeft / cardWidth)
        );
      }, 100);
    };

    track.addEventListener('scroll', handleScroll, {
      passive: true,
    });

    return () => {
      clearTimeout(timeout);
      track.removeEventListener('scroll', handleScroll);
    };
  }, [ads.length]);

  // Carousel autoplay. Stop while hovered, focused, or tab is hidden.
  useEffect(() => {
    if (paused || ads.length < 2) return;

    const timer = window.setInterval(() => {
      if (document.hidden) return;

      const track = trackRef.current;
      if (!track) return;

      const firstCard = track.querySelector<HTMLElement>(
        '[data-ad-card]'
      );

      if (!firstCard) return;

      const cardWidth =
        firstCard.getBoundingClientRect().width + 16;

      const maxScroll =
        track.scrollWidth - track.clientWidth;

      if (track.scrollLeft >= maxScroll - 8) {
        track.scrollTo({ left: 0, behavior: 'smooth' });
        setActiveIndex(0);
      } else {
        track.scrollBy({
          left: cardWidth,
          behavior: 'smooth',
        });
      }
    }, 5000);

    return () => window.clearInterval(timer);
  }, [paused, ads.length]);

  // Play only videos that are sufficiently visible.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;

          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.6 }
    );

    videoRefs.current.forEach((video) => {
      observer.observe(video);
    });

    return () => observer.disconnect();
  }, [ads]);

  if (!loading && ads.length === 0) {
    return null;
  }

  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5"
      aria-label="Sponsored advertisements"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (
          !event.currentTarget.contains(event.relatedTarget as Node)
        ) {
          setPaused(false);
        }
      }}
    >
      {/* Section heading */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
              <Sparkles size={17} />
            </span>

            <h2 className="text-base font-black tracking-tight text-gray-900 sm:text-lg">
              Sponsored & Trending
            </h2>
          </div>

          <p className="mt-1 text-xs text-gray-500 sm:text-sm">
            Discover products promoted by sellers on NovaXmax.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => scrollToCard('prev')}
            disabled={activeIndex === 0}
            aria-label="Previous advertisements"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-700 transition hover:border-orange-300 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft size={19} />
          </button>

          <button
            type="button"
            onClick={() => scrollToCard('next')}
            aria-label="Next advertisements"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-700 transition hover:border-orange-300 hover:bg-orange-50"
          >
            <ChevronRight size={19} />
          </button>
        </div>
      </div>

      {/* Advertisement cards */}
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="w-[76%] shrink-0 animate-pulse snap-start sm:w-[48%] lg:w-[calc(33.333%-11px)] xl:w-[calc(25%-12px)]"
              >
                <div className="aspect-[4/3] rounded-xl bg-gray-100" />
                <div className="mt-3 h-4 w-3/4 rounded bg-gray-100" />
                <div className="mt-2 h-3 w-1/2 rounded bg-gray-100" />
              </div>
            ))
          : ads.map((ad) => (
              <article
                key={ad._id}
                data-ad-card
                className="w-[76%] shrink-0 snap-start overflow-hidden rounded-xl border border-gray-100 bg-white transition duration-300 hover:-translate-y-0.5 hover:shadow-lg sm:w-[48%] lg:w-[calc(33.333%-11px)] xl:w-[calc(25%-12px)]"
              >
                {/* Media */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                  {ad.mediaType === 'video' ? (
                    <video
                      ref={(element) => {
                        if (element) {
                          videoRefs.current.set(ad._id, element);
                        } else {
                          videoRefs.current.delete(ad._id);
                        }
                      }}
                      src={ad.mediaUrl}
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Image
                      src={ad.mediaUrl}
                      alt={ad.title}
                      fill
                      sizes="(max-width: 640px) 76vw, (max-width: 1024px) 48vw, 25vw"
                      className="object-cover transition duration-500 hover:scale-105"
                      unoptimized
                    />
                  )}

                  <div className="absolute left-3 top-3 rounded-md border border-white/30 bg-black/60 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-md">
                    Sponsored
                  </div>

                  {ad.mediaType === 'video' && (
                    <div className="absolute bottom-3 left-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur">
                      <Play size={15} fill="currentColor" />
                    </div>
                  )}

                  <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/65 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
                    <Eye size={13} />
                    {formatViews(ad.views || 0)} views
                  </div>
                </div>

                {/* Details */}
                <div className="p-3">
                  <h3 className="line-clamp-1 text-sm font-bold text-gray-900">
                    {ad.title}
                  </h3>

                  {ad.description && (
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-500">
                      {ad.description}
                    </p>
                  )}

                  {ad.product?.calculatedPrice != null && (
                    <p className="mt-2 text-sm font-black text-orange-600">
                      KSh{' '}
                      {ad.product.calculatedPrice.toLocaleString()}
                    </p>
                  )}

                  {ad.product?.slug ? (
                    <Link
                      href={`/product/${ad.product.slug}`}
                      className="mt-3 flex min-h-10 items-center justify-center rounded-lg bg-orange-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-orange-600"
                    >
                      Shop Now
                      <ChevronRight size={15} className="ml-1" />
                    </Link>
                  ) : (
                    <Link
                      href="/ads"
                      className="mt-3 flex min-h-10 items-center justify-center rounded-lg bg-gray-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-gray-800"
                    >
                      View Ad
                      <ChevronRight size={15} className="ml-1" />
                    </Link>
                  )}
                </div>
              </article>
            ))}
      </div>

      {!loading && ads.length > 0 && (
        <div className="mt-2 flex justify-center gap-1.5">
          {ads.map((ad, index) => (
            <button
              key={ad._id}
              type="button"
              onClick={() => {
                const track = trackRef.current;
                const card = track?.querySelectorAll<HTMLElement>(
                  '[data-ad-card]'
                )[index];

                card?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'nearest',
                  inline: 'start',
                });

                setActiveIndex(index);
              }}
              aria-label={`Go to advertisement ${index + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                index === activeIndex
                  ? 'w-5 bg-orange-500'
                  : 'w-1.5 bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}