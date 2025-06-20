'use client';

import { useEffect, useState } from 'react';
import { Product } from '@/app/types/product';
import { getWishlist, removeFromWishlist } from '@/lib/wishlist';
import { useRouter } from 'next/navigation';
import { CldImage } from 'next-cloudinary';
import { Player } from '@lottiefiles/react-lottie-player';

const getPublicId = (url?: string) => {
  if (!url || typeof url !== 'string') return '';
  const match = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
  return match ? match[1] : url;
};

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
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
    <div className="px-6 pt-28 pb-10">
      {wishlistItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-112px)] pt-20">
                <Player
                  autoplay
                  loop
                  src="https://assets5.lottiefiles.com/packages/lf20_qh5z2fdq.json"
                  style={{ height: '300px', width: '300px' }}
                />
                <p className="mt-4 text-lg text-orange-700">Your Wishlist is empty</p>
              </div>
      ) : (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {wishlistItems.map((product) => (
            <div key={product._id} className="border p-4 rounded-md bg-white shadow-sm">
              <div
                onClick={() => router.push(`/product/${product._id}`)}
                className="cursor-pointer mb-2 w-full h-40 relative"
              >
                <CldImage
                  src={getPublicId(product.images[0]) || '/Electronics.jpg'}
                  alt={product.name}
                  width={300}
                  height={300}
                  crop="fill"
                  className="w-full h-full object-cover rounded"
                />
              </div>
              <h3 className="text-md font-semibold">{product.name}</h3>
              <p className="text-sm text-gray-500">Ksh {product.calculatedPrice}</p>

              <div className="mt-2 flex justify-between">
                <button
                  onClick={() => router.push(`/product/${product._id}`)}
                  className="bg-orange-500 text-white px-3 py-1 rounded text-sm"
                >
                  View
                </button>
                <button
                  onClick={() => handleRemove(product._id)}
                  className="text-red-500 border border-red-300 px-3 py-1 rounded text-sm hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
