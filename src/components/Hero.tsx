'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
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
  const [banners, setBanners] = useState<Banner[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  // Responsive detection
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Auto slide (desktop)
  useEffect(() => {
    if (!isDesktop || banners.length === 0) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % banners.length);
    }, SLIDE_INTERVAL);
    return () => clearInterval(interval);
  }, [banners, isDesktop]);

  // Auto slide + progress (mobile)
  useEffect(() => {
    if (isDesktop || banners.length === 0) return;

    let startTime = Date.now();
    const duration = SLIDE_INTERVAL;
    const step = 50;

    const tick = () => {
      if (isPaused) return;
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);

      if (pct >= 100) {
        setProgress(0);
        startTime = Date.now();
        setActiveIndex((prev) => (prev + 1) % banners.length);
      }
    };

    progressRef.current = setInterval(tick, step);
    return () => {
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [banners, isDesktop, isPaused]);

  if (banners.length === 0) return null;

  return (
    <div className="w-full pt-28 pb-6 lg:pb-10 select-none">
      {/* 🖥 Desktop View */}
      {isDesktop ? (
        <div className="relative w-full h-[400px] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              className="absolute inset-0"
            >
              <BannerCard banner={banners[activeIndex]} />
            </motion.div>
          </AnimatePresence>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`w-3 h-3 rounded-full transition-all ${
                  i === activeIndex ? 'bg-orange-500 scale-110' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      ) : (
        /* 📱 Mobile View: swipe + momentum snapping */
        <div
          className="relative w-full overflow-hidden"
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          <motion.div
            className="flex cursor-grab active:cursor-grabbing"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info: PanInfo) => {
              const swipeThreshold = 100;
              if (info.offset.x < -swipeThreshold) {
                // swipe left → next
                setActiveIndex((prev) => (prev + 1) % banners.length);
                setProgress(0);
              } else if (info.offset.x > swipeThreshold) {
                // swipe right → previous
                setActiveIndex(
                  (prev) => (prev - 1 + banners.length) % banners.length
                );
                setProgress(0);
              }
            }}
            animate={{
              x: `-${activeIndex * 100}%`,
            }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
            style={{
              width: `${banners.length * 100}%`,
            }}
          >
            {banners.map((banner) => (
              <div key={banner.id} className="w-full flex-shrink-0 snap-center">
                <BannerCard banner={banner} />
              </div>
            ))}
          </motion.div>

          {/* Progress Indicators */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 w-3/4">
            {banners.map((_, i) => (
              <div
                key={i}
                className="flex-1 h-1.5 rounded-full bg-gray-300 overflow-hidden"
              >
                {i === activeIndex && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-orange-500"
                    transition={{
                      ease: 'linear',
                      duration: SLIDE_INTERVAL / 1000,
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      className="relative w-[90vw] sm:w-[80vw] lg:w-full h-[230px] sm:h-[260px] lg:h-[400px] rounded-xl overflow-hidden shadow-md"
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

      <div className="absolute inset-0 bg-black/40 flex flex-col justify-between p-4 lg:p-8">
        <h2 className="text-white text-lg sm:text-2xl lg:text-4xl font-bold drop-shadow mb-2">
          {banner.heading}
        </h2>

        <div className="flex justify-between items-center bg-white/95 p-2 rounded-lg shadow">
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
            <p
              className={`text-xs mt-1 font-medium ${
                currentProduct.quantity > 0 ? 'text-green-600' : 'text-red-500'
              }`}
            >
              {currentProduct.quantity > 0
                ? `${currentProduct.quantity} left`
                : 'Out of stock'}
            </p>
          </div>

          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded overflow-hidden">
            <CldImage
              src={getPublicId(currentProduct.images[0])}
              alt={currentProduct.name}
              width="300"
              height="300"
              crop="fill"
              className="object-cover rounded"
            />
          </div>
        </div>

        <button
          aria-label={`Shop now for ${currentProduct.name}`}
          className="mt-2 bg-orange-500 text-white text-xs sm:text-sm px-4 py-2 rounded-md hover:bg-orange-600 transition self-start"
        >
          {banner.cta}
        </button>
      </div>
    </div>
  );
}
