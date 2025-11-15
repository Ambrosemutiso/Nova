'use client';

import { useRouter } from 'next/navigation';
import { CldImage } from 'next-cloudinary';
import { Product } from '@/app/types/product';
import { useEffect, useState } from 'react';
import { getExchangeRate, formatCurrency } from '@/lib/convertCurrency';
import { useAuth } from '@/app/context/AuthContext';

interface ProductCardProps {
  product: Product;
  showSponsoredBadge?: boolean;
  badge?: React.ReactNode;
}

export default function ProductCard({ product, showSponsoredBadge, badge }: ProductCardProps) {
  const router = useRouter();
  const { user } = useAuth();

  const [displayPrice, setDisplayPrice] = useState(product.calculatedPrice);
  const [displayOldPrice, setDisplayOldPrice] = useState(product.oldPrice);
  const [displayCurrency, setDisplayCurrency] = useState(product.currency || "KES");

  // Convert price based on current user
useEffect(() => {
  const convert = async () => {
    if (!user?.currency || user.currency === product.currency) return;

    const rate = await getExchangeRate(product.currency || "KES", user.currency);

    setDisplayPrice(Math.round(product.calculatedPrice * rate));
    setDisplayOldPrice(Math.round(product.oldPrice * rate));
    setDisplayCurrency(user.currency);
  };

  convert();
}, [
  user?.currency, 
  product.calculatedPrice, 
  product.oldPrice, 
  product.currency
]);


  const calculateDiscount = (oldPrice: number, calculatedPrice: number) =>
    Math.round(((oldPrice - calculatedPrice) / oldPrice) * 100);

const getPublicId = (url: string) => { const regex = /\/upload\/(?:v\d+\/)?([^\.]+)/; const match = url.match(regex); return match ? match[1] : url; };

  return (
    <div className="w-52 flex-shrink-0 relative bg-white p-3 shadow rounded hover:shadow-lg transition">

      {/* Sponsored badge */}
      {showSponsoredBadge && (
        <div className="absolute top-0 left-0 flex items-center gap-1 bg-white px-2 py-1 rounded-br z-10 shadow text-xs font-semibold">
          <svg className="w-4 h-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-1.654 0-3 1.346-3 3H7.5c-.827 0-1.5.673-1.5 1.5v2.085c0 .408-.246.775-.623.923l-1.727.69a1.5 1.5 0 000 2.78l1.727.69c.377.149.623.515.623.923V16.5c0 .827.673 1.5 1.5 1.5H9c0 1.654 1.346 3 3 3s3-1.346 3-3h1.5c.827 0 1.5-.673 1.5-1.5v-2.085c0-.408.246-.775.623-.923l1.727-.69a1.5 1.5 0 000-2.78l-1.727-.69a1.001 1.001 0 01-.623-.923V4.5c0-.827-.673-1.5-1.5-1.5H15c0-1.654-1.346-3-3-3zm-1 15l-3-3 1.414-1.414L11 12.172l4.586-4.586L17 9l-6 6z" />
          </svg>
          <span className="text-blue-600">Sponsored</span>
        </div>
      )}

      {badge && (
        <div className="absolute top-0 left-0 bg-yellow-400 text-black text-xs px-2 py-1 rounded-br z-10 font-bold shadow">
          {badge}
        </div>
      )}

      <div className="absolute top-0 right-0 bg-red-500 text-white px-2 py-1 rounded-bl text-xs">
        {calculateDiscount(displayOldPrice, displayPrice)}% OFF
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

      <h3 className="mt-2 text-sm text-gray-800 font-medium truncate">{product.name}</h3>

      {/* Converted prices */}
      <div className="text-sm mt-1 flex gap-2 items-center">
        <span className="line-through text-gray-400">
          {formatCurrency(displayOldPrice, displayCurrency)}
        </span>

        <span className="text-red-600 font-bold">
          {formatCurrency(displayPrice, displayCurrency)}
        </span>
      </div>
    </div>
  );
}
