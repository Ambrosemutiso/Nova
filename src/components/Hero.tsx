'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

type Banner = {
  id: number;
  src: string;
  alt: string;
  link: string;
};

const SLIDE_INTERVAL = 6000;

export default function HeroSlider() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isInView, setIsInView] = useState(true);
  const [banners, setBanners] = useState<Banner[]>([]);

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
      className="w-full overflow-x-auto whitespace-nowrap scroll-smooth scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 px-4 pt-28 pb-10"
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
  return (
    <Link href={banner.link}>
      <div className="relative min-w-[300px] sm:min-w-[340px] md:min-w-[400px] aspect-[16/9] rounded-lg overflow-hidden shadow-md flex-shrink-0 cursor-pointer hover:scale-[1.02] transition">
        
        <Image
          src={banner.src}
          alt={banner.alt}
          fill
          className="object-cover"
          priority
        />

      </div>
    </Link>
  );
}