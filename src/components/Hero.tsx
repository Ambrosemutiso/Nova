'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

type Banner = {
  id: number;
  src: string;
  alt: string;
  heading: string;
  cta: string;
};

const SLIDE_INTERVAL = 6000;

export default function HeroSlider() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // ✅ Fetch featured banners
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

  // ✅ Auto slide for desktop view
  useEffect(() => {
    if (banners.length === 0 || isHovered) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, SLIDE_INTERVAL);
    return () => clearInterval(interval);
  }, [banners, isHovered]);

  return (
    <section className="w-full relative overflow-hidden pt-24 md:pt-28 pb-10">
      {/* DESKTOP VIEW: Single banner fade slider */}
      <div
        className="hidden md:block relative w-full h-[60vh] max-h-[600px]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <Image
              src={banner.src}
              alt={banner.alt}
              fill
              className="object-cover"
              priority={index === current}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
            <div className="absolute bottom-16 left-12 text-white z-20">
              <h2 className="text-4xl font-bold mb-4 drop-shadow-lg">{banner.heading}</h2>
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-md text-lg font-medium transition">
                {banner.cta}
              </button>
            </div>
          </div>
        ))}

        {/* Dots navigation */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-30">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-3 h-3 rounded-full transition ${
                current === i ? 'bg-orange-500' : 'bg-gray-300'
              }`}
            ></button>
          ))}
        </div>
      </div>

      {/* MOBILE VIEW: Scrollable cards */}
      <div className="md:hidden w-full overflow-x-auto scroll-smooth px-4 whitespace-nowrap scrollbar-hide">
        <div className="inline-flex gap-4">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="relative banner-card min-w-[90%] aspect-[16/9] rounded-xl overflow-hidden shadow-md flex-shrink-0"
            >
              <Image
                src={banner.src}
                alt={banner.alt}
                fill
                className="object-cover brightness-95"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white z-10">
                <h2 className="text-xl font-bold mb-2">{banner.heading}</h2>
                <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium transition">
                  {banner.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
