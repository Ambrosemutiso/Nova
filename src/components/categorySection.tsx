'use client';

import { ReactNode, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CategorySectionProps {
  title: string;
  categorySlug: string; 
  children: ReactNode;
}

export default function CategorySection({ title, categorySlug, children }: CategorySectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [visibleCount] = useState(10); // Show only first 10 items

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollRef.current;
    if (container) {
      const scrollAmount = container.offsetWidth * 0.8;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Convert children to array for slicing
  const childrenArray = Array.isArray(children) ? children : [children];
  const visibleChildren = childrenArray.slice(0, visibleCount);

  return (
    <div className="relative my-12 bg-white shadow-md rounded-md p-4">
      {/* Title and See All */}
      <div className="absolute -top-4 left-4 right-4 bg-orange-500 text-white px-4 py-2 text-sm font-semibold rounded-md shadow-lg z-10 flex justify-between items-center">
        <span>{title}</span>
        <button
          onClick={() => router.push(`/category/${categorySlug}`)}
          className="text-xs underline hover:text-white/80"
        >
          See All
        </button>
      </div>

      {/* Scroll Arrows */}
      <button
        onClick={() => scroll('left')}
        className="absolute top-1/2 -left-4 transform -translate-y-1/2 bg-white shadow p-1 rounded-full z-20"
      >
        <ChevronLeft className="w-5 h-5 text-orange-500" />
      </button>

      <button
        onClick={() => scroll('right')}
        className="absolute top-1/2 -right-4 transform -translate-y-1/2 bg-white shadow p-1 rounded-full z-20"
      >
        <ChevronRight className="w-5 h-5 text-orange-500" />
      </button>

      {/* Product Row */}
      <div
        ref={scrollRef}
        className="pt-8 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide"
      >
        <div className="flex flex-nowrap gap-4 min-w-max px-2">
          {visibleChildren.map((child, index) => (
            <div key={index} className="snap-start flex-shrink-0">
              {child}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
