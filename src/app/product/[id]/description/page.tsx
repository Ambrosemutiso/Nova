'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  _id: string;
  description: string;
}

interface Props {
  product: Product;
}

export default function ProductDescriptionSection({ product }: Props) {
  const router = useRouter();
  const [animating, setAnimating] = useState(false);

  const handleReadMore = () => {
    setAnimating(true);
    setTimeout(() => {
      router.push(`/product/${product._id}/full-description`);
    }, 700); // Delay for animation
  };

  return (
    <div className="mt-10 bg-white shadow rounded-lg p-6 relative overflow-hidden">
      {/* Section Header */}
      <h2 className="text-xl font-semibold mb-4 border-b pb-2">
        Product Description
      </h2>

      {/* Product Description Preview */}
      <div
        className="text-gray-700 text-sm md:text-base transition-all duration-300 ease-in-out 
                   max-h-[6rem] overflow-hidden md:max-h-none leading-relaxed"
        style={{
          maskImage:
            'linear-gradient(to bottom, black 80%, transparent 100%)',
        }}
        dangerouslySetInnerHTML={{ __html: product.description }}
      />

      {/* Gradient Overlay for Mobile */}
      <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white to-transparent md:hidden"></div>

      {/* Read More Button for Mobile */}
      <div className="md:hidden mt-4 flex justify-end">
        <button
          onClick={handleReadMore}
          className="flex items-center text-orange-600 font-medium hover:underline transition-all duration-300"
        >
          Read More
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Slide-Up Animation Overlay */}
      <AnimatePresence>
        {animating && (
          <motion.div
            key="slide-up"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              duration: 0.6,
              ease: [0.25, 0.1, 0.25, 1], // smooth cubic ease
            }}
            className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-orange-600 font-semibold text-lg"
            >
              Loading description...
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
