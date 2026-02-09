'use client';

import { useEffect, useState } from 'react';
import type { ProductType } from "@/app/types/product";
import { getWishlist, removeFromWishlist } from '@/lib/wishlist';
import { useRouter } from 'next/navigation';
import { CldImage } from 'next-cloudinary';
import { Player } from '@lottiefiles/react-lottie-player';
import { motion } from 'framer-motion';

const getPublicId = (url?: string) => {
  if (!url || typeof url !== 'string') return '';
  const match = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
  return match ? match[1] : url;
};

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<ProductType[]>([]);
  const router = useRouter();

  useEffect(() => {
    const items = getWishlist();
    setWishlistItems(items);
  }, []);

  const handleRemove = (id: string) => {
    removeFromWishlist(id);
    setWishlistItems((prev) => prev.filter((item) => item._id !== id));
  };

  return (
    <div className="relative min-h-screen pt-28 pb-16 px-6 overflow-hidden bg-gradient-to-b from-orange-50 via-white to-orange-100">
      {/* 🌈 Animated Background Blobs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4, y: [0, 25, 0] }}
        transition={{ repeat: Infinity, duration: 10 }}
        className="absolute -top-24 left-10 w-96 h-96 bg-gradient-to-r from-orange-300 to-yellow-200 rounded-full blur-3xl opacity-40"
      ></motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4, y: [0, -30, 0] }}
        transition={{ repeat: Infinity, duration: 12 }}
        className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-gradient-to-l from-orange-200 to-orange-100 rounded-full blur-3xl opacity-30"
      ></motion.div>

      {/* ❤️ Wishlist Header */}
      <div className="relative z-10 text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-orange-600">
          My Wishlist
        </h1>
        <p className="text-gray-700 mt-2">
          All your favorite items, saved in one place.
        </p>
      </div>

      {/* 🧺 Wishlist Items */}
      {wishlistItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] relative z-10">
          <Player
            autoplay
            loop
            src="https://assets5.lottiefiles.com/packages/lf20_qh5z2fdq.json"
            style={{ height: '300px', width: '300px' }}
          />
          <p className="mt-4 text-lg text-orange-700 font-medium">
            Your Wishlist is empty
          </p>
        </div>
      ) : (
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {wishlistItems.map((product) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="border p-4 rounded-2xl bg-white/70 backdrop-blur-sm shadow-md hover:shadow-lg transition-all"
            >
              <div
                onClick={() => router.push(`/product/${product.slug}`)}
                className="cursor-pointer mb-3 w-full h-44 relative"
              >
                <CldImage
                  src={getPublicId(product.images[0]) || '/Electronics.jpg'}
                  alt={product.name}
                  width={300}
                  height={300}
                  crop="fill"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <h3 className="text-md font-semibold line-clamp-2">
                {product.name}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Ksh {product.calculatedPrice}
              </p>

              <div className="mt-3 flex justify-between">
                <button
                  onClick={() => router.push(`/product/${product.slug}`)}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded text-sm transition-all"
                >
                  View
                </button>
                <button
                  onClick={() => handleRemove(product._id)}
                  className="text-red-500 border border-red-300 px-3 py-1.5 rounded text-sm hover:bg-red-50 transition-all"
                >
                  Remove
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
