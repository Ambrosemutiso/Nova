'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { CldImage } from 'next-cloudinary';

type Product = {
  id: string;
  name: string;
  images: string[];
  calculatedPrice: number;
  oldPrice: number;
  quantity: number;
};

type Banner = {
  id: number;
  src: string;
  alt: string;
  heading: string;
  cta: string;
  products: Product[];
};

const SLIDE_INTERVAL = 6000;
const PRODUCT_ROTATION_INTERVAL = 3000;

export default function HeroSlider() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isInView, setIsInView] = useState(true);
  const [banners, setBanners] = useState<Banner[]>([]);

  // Fetch banners
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

  // Auto scroll logic
  useEffect(() => {
    const interval = setInterval(() => {
      if (!containerRef.current || isHovered || !isInView || banners.length === 0) return;

      const container = containerRef.current;
      const cardWidth = container.querySelector('div')?.clientWidth || 400;
      const maxScroll = container.scrollWidth - container.clientWidth;

      if (container.scrollLeft + cardWidth >= maxScroll) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: cardWidth, behavior: 'smooth' });
      }
    }, SLIDE_INTERVAL);

    return () => clearInterval(interval);
  }, [isHovered, isInView, banners]);

  // Pause auto scroll when not in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.1 }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="w-full overflow-x-auto whitespace-nowrap scroll-smooth scrollbar-hide px-4 pt-28 pb-10"
    >
      <div className="inline-flex gap-4">
        {banners.map((banner) => (
          <BannerCard key={banner.id} banner={banner} />
        ))}
      </div>
    </div>
  );
}

function BannerCard({ banner }: { banner: Banner }) {
  const [productIndex, setProductIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentProduct = banner.products[productIndex];

  useEffect(() => {
    startRotation();
    return () => stopRotation();
  }, []);

  const startRotation = () => {
    intervalRef.current = setInterval(() => {
      setProductIndex((prev) => (prev + 1) % banner.products.length);
    }, PRODUCT_ROTATION_INTERVAL);
  };

  const stopRotation = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const getDiscount = (oldPrice: number, calculatedPrice: number) =>
    Math.round(((oldPrice - calculatedPrice) / oldPrice) * 100);

  const getPublicId = (url?: string) => {
    if (!url || typeof url !== 'string') return '';
    const match = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
    return match ? match[1] : url;
  };

  return (
    <div
      className="relative min-w-[300px] sm:min-w-[340px] md:min-w-[400px] aspect-[16/9] rounded-lg overflow-hidden shadow-md flex-shrink-0"
      onMouseEnter={stopRotation}
      onMouseLeave={startRotation}
    >
      <Image
        src={banner.src}
        alt={banner.alt}
        fill
        className="object-cover brightness-75 transition-all duration-700"
        priority
      />

      <div className="absolute inset-0 bg-black/40 flex flex-col justify-between p-4">
        {/* Banner title */}
        <h2 className="text-white text-xl sm:text-2xl md:text-3xl font-bold drop-shadow mb-2">
          {banner.heading}
        </h2>

        {/* Product info */}
        <div className="flex justify-between items-center bg-white p-2 rounded shadow">
          {/* Product details */}
          <div className="w-2/3">
            <p className="text-gray-800 font-semibold text-sm truncate">
              {currentProduct.name}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-orange-600 font-bold text-sm">
                KSh {currentProduct.calculatedPrice.toLocaleString()}
              </span>
              <span className="line-through text-gray-500 text-xs">
                KSh {currentProduct.oldPrice.toLocaleString()}
              </span>
              <span className="text-xs text-green-600">
                -{getDiscount(currentProduct.oldPrice, currentProduct.calculatedPrice)}%
              </span>
            </div>
               <p className={`text-left text-sm font-semibold ${currentProduct.quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                 {currentProduct.quantity > 0 ? `${currentProduct.quantity} unit${currentProduct.quantity > 1 ? 's' : ''} left` : 'Out of stock'}
               </p>
          </div>

          {/* Product image */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded overflow-hidden">
            <CldImage
              src={getPublicId(currentProduct.images[0])}
              alt={currentProduct.name}
              width="300"
              height="300"
              crop="fill"
              className="object-cover rounded shadow"
              loading="lazy"
            />
          </div>
        </div>

        {/* CTA */}
        <button
          aria-label={`Shop now for ${currentProduct.name}`}
          className="mt-2 bg-orange-500 text-white text-xs sm:text-sm px-3 py-1 rounded-md hover:bg-orange-600 transition self-start"
        >
          {banner.cta}
        </button>
      </div>
    </div>
  );
}
