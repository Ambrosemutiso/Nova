'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export default function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setVisible(window.scrollY > 400);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return visible ? (
    <button
      onClick={scrollToTop}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-orange-500/50 backdrop-blur-md text-white py-3 px-6 rounded-full flex items-center gap-2 text-sm font-medium shadow-lg transition-all duration-300 hover:bg-orange-600/60 z-50"
    >
      <ArrowUp className="animate-bounce-slow" size={20} />
      Back to Top
    </button>
  ) : null;
}
