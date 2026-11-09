'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export default function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setVisible(window.scrollY > 400);
    };

    toggleVisibility();

    window.addEventListener('scroll', toggleVisibility, {
      passive: true,
    });

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      title="Back to top"
      className={`
        fixed bottom-24 right-4 sm:bottom-8 sm:right-7
        z-[60]
        flex h-12 w-12 sm:h-14 sm:w-14
        items-center justify-center
        rounded-full
        border border-white/80
        bg-orange-600 text-white
        shadow-[0_5px_20px_rgba(234,88,12,0.30)]
        transition-all duration-300 ease-out
        hover:-translate-y-1
        hover:bg-orange-700
        hover:shadow-[0_8px_25px_rgba(234,88,12,0.40)]
        active:scale-90
        focus:outline-none focus-visible:ring-4
        focus-visible:ring-orange-300/60
        ${
          visible
            ? 'translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none translate-y-5 scale-90 opacity-0'
        }
      `}
    >
      <ArrowUp
        size={23}
        strokeWidth={2.5}
        className="transition-transform duration-300 group-hover:-translate-y-1"
      />
    </button>
  );
}