'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Loader() {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-b from-orange-50 via-orange-100 to-orange-200 overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 6.8, duration: 1.3 }} 
      // ↑ stays full-visible for ~6.8s before fading out
    >
      {/* Pulsing logo */}
      <motion.div
        className="flex items-center justify-center"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.9, 1, 0.9],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div className="rounded-full shadow-lg shadow-orange-300/40 p-3 bg-white/80 backdrop-blur-md">
          <Image
            src="/Logo.png"
            alt="Novaxmax Logo"
            width={120}
            height={120}
            priority
            className="rounded-full"
          />
        </div>
      </motion.div>

      {/* Brand text */}
      <motion.div
        className="absolute bottom-10 text-center text-gray-700 font-medium tracking-wide text-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.2, duration: 1.4 }} 
        // ↑ shows early (2.2s), long before fade-out
      >
        Powered by{' '}
        <span className="font-semibold text-orange-600">
          Novaxpress Ventures Ltd
        </span>
      </motion.div>
    </motion.div>
  );
}
