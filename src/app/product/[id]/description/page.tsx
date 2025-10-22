'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  _id: string;
  description?: string;
}

interface Props {
  product?: Product | null;
}

export default function ProductDescriptionSection({ product }: Props) {
  const router = useRouter();
  const [animating, setAnimating] = useState(false);

  const handleReadMore = () => {
    if (!product?._id) return;
    setAnimating(true);

    // Delay navigation slightly after animation starts
    setTimeout(() => {
      router.push(`/product/${product._id}/full-description`);
    }, 800);
  };

  if (!product)
    return (
      <div className="mt-10 bg-white shadow rounded-lg p-6">
        <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-3" />
        <div className="space-y-2">
          <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-5/6 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );

  return (
    <div className="mt-10 bg-white shadow rounded-lg p-6 relative overflow-hidden">
      {/* Header */}
      <h2 className="text-xl font-semibold mb-4 border-b pb-2">
        Product Description
      </h2>

      {/* Product Description Preview */}
      <div
        className="text-gray-700 text-sm md:text-base leading-relaxed max-h-[6rem] overflow-hidden md:max-h-none"
        style={{
          maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
        }}
        dangerouslySetInnerHTML={{
          __html: product.description || '<p>No description available.</p>',
        }}
      />

      {/* Gradient Overlay for Mobile */}
      <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white to-transparent md:hidden" />

      {/* Read More Button for Mobile */}
      {product.description && (
        <div className="md:hidden mt-4 flex justify-end">
          <button
            onClick={handleReadMore}
            className="flex items-center text-orange-600 font-medium hover:underline transition-all duration-300"
          >
            Read More
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 ml-1 transition-transform duration-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* Slide-Up Loading Animation */}
      <AnimatePresence>
        {animating && (
          <motion.div
            key="slide-up"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              duration: 0.6,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center"
          >
            {/* Top drag handle (like modal) */}
            <div className="absolute top-3 w-16 h-1.5 rounded-full bg-gray-300" />

            {/* Loading content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-orange-600 font-semibold text-lg mt-10"
            >
              Loading description...
            </motion.div>

            {/* Subtle pulsing animation */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0.6 }}
              animate={{
                scale: [0.95, 1.05, 0.95],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="mt-3 text-sm text-gray-500"
            >
              Please wait
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
