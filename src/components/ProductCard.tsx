'use client';

import { useRouter } from 'next/navigation';
import { CldImage } from 'next-cloudinary';
import { Product } from '@/app/types/product';

interface ProductCardProps {
  product: Product;
  showSponsoredBadge?: boolean; // 👈 NEW
}

export default function ProductCard({ product, showSponsoredBadge }: ProductCardProps) {
  const router = useRouter();

  const calculateDiscount = (oldPrice: number, calculatedPrice: number) =>
    Math.round(((oldPrice - calculatedPrice) / oldPrice) * 100);

  const getPublicId = (url: string) => {
    const regex = /\/upload\/(?:v\d+\/)?([^\.]+)/;
    const match = url.match(regex);
    return match ? match[1] : url;
  };

  return (
    <div className="w-52 flex-shrink-0 relative bg-white p-3 shadow rounded hover:shadow-lg transition">
   {showSponsoredBadge && (
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1">
          <span className="w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-md">
            ✓
          </span>
          <span className="text-xs text-blue-600 font-semibold">Sponsored</span>
        </div>
      )}
      <div className="absolute top-0 right-0 bg-red-500 text-white px-2 py-1 rounded-bl text-xs">
        {calculateDiscount(product.oldPrice, product.calculatedPrice)}% OFF
      </div>

      <div onClick={() => router.push(`/product/${product._id}`)} className="cursor-pointer">
        <CldImage
          src={getPublicId(product.images[0])}
          alt={product.name}
          width="300"
          height="300"
          crop="fill"
          className="w-full h-44 object-cover rounded"
        />
      </div>

      <h3 className="mt-2 text-sm font-medium">{product.name}</h3>
      <div className="text-sm mt-1 flex gap-2 items-center">
        <span className="line-through text-gray-400">Ksh.{product.oldPrice}</span>
        <span className="text-red-600 font-bold">Ksh.{product.calculatedPrice}</span>
      </div>
    </div>
  );
}
