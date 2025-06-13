'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Loader() {
  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen bg-orange-200"
      initial={{ scale: 1, opacity: 1 }}
      animate={{ scale: 5, opacity: 0 }}
      transition={{ duration: 1.5, delay: 2.5 }}
    >
      <motion.div
        animate={{
            opacity: [0.7, 1, 0.7],
            scale: [1, 1.2, 1],
         }}
        transition={{ repeat: Infinity, duration: 5 }}
      >
        <Image className="rounded-full"
          src="/Logo.png"
          alt="Logo"
          width={120}
          height={120}
          priority
        />
      </motion.div>
    </motion.div>
  );
}
