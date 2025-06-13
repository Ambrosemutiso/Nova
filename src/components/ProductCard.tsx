'use client';

import { useRouter } from 'next/navigation';
import { CldImage } from 'next-cloudinary';
import { Product } from '@/app/types/product';

export default function ProductCard({ product }: { product: Product }) {
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
