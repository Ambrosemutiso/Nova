'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { CldImage } from 'next-cloudinary';
import type { ProductType } from "@/app/types/product";

type Banner = {
  id: number;
  src: string;
  alt: string;
  heading: string;
  cta: string;
  products: ProductType[];
};

const SLIDE_INTERVAL = 6000;

export default function HeroSlider() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Fetch banners
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch('/api/products/featured');
        const data = await res.json();
        setBanners(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchBanners();
  }, []);

  // Auto slide (fade style)
  useEffect(() => {
    if (isHovered || banners.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, SLIDE_INTERVAL);

    return () => clearInterval(interval);
  }, [isHovered, banners]);

  const getPublicId = (url?: string) => {
    if (!url) return '';
    const match = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
    return match ? match[1] : url;
  };

  return (
    <div
      className="relative w-full h-[320px] sm:h-[400px] md:h-[460px] overflow-hidden pt-24"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* BACKGROUND */}
          <Image
            src={banner.src}
            alt={banner.alt}
            fill
            className="object-cover brightness-75"
            priority
          />

          {/* DARK GRADIENT */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

          {/* GLOW EFFECT */}
          <div className="absolute right-20 bottom-10 w-72 h-72 bg-orange-500/20 blur-3xl rounded-full" />

          {/* TEXT */}
          <div className="absolute left-6 sm:left-10 top-1/2 -translate-y-1/2 z-20 max-w-[60%]">
            <h2 className="text-white text-2xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4 drop-shadow">
              {banner.heading}
            </h2>

            <button className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-md text-sm sm:text-base transition">
              {banner.cta}
            </button>
          </div>

          {/* FLOATING PRODUCTS */}
          {banner.products.map((product, i) => {
            const positions = [
              'right-6 bottom-6 w-32 sm:w-40 md:w-48',
              'right-32 top-10 w-24 sm:w-32 md:w-36',
              'right-10 top-1/2 -translate-y-1/2 w-20 sm:w-28 md:w-32',
              'left-1/2 bottom-6 -translate-x-1/2 w-24 sm:w-32 md:w-36',
            ];

            const rotations = [
              'rotate-[-10deg]',
              'rotate-[8deg]',
              'rotate-[4deg]',
              'rotate-[-6deg]',
            ];

            return (
              <div
                key={product._id}
                className={`absolute ${positions[i]} ${rotations[i]} transition-all duration-700 hover:scale-110`}
              >
                <CldImage
                  src={getPublicId(product.images[0])}
                  alt={product.name}
                  width="400"
                  height="400"
                  className="object-contain drop-shadow-2xl"
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}