'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function BannerSlide({ banner }: { banner: any }) {
  const [productIndex, setProductIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProductIndex((prev) =>
        prev + 3 >= banner.products.length ? 0 : prev + 3
      );
    }, 3000);
    return () => clearInterval(interval);
  }, [banner.products.length]);

  const visibleProducts = banner.products.slice(productIndex, productIndex + 3);

  return (
    <div className="relative w-full h-[360px] overflow-hidden rounded-lg shadow-md">
      <Image
        src={banner.src}
        alt={banner.alt}
        fill
        className="object-cover brightness-[0.5]"
        priority
      />
      <div className="absolute inset-0 flex flex-col justify-center px-6 text-white">
        <h2 className="text-3xl font-bold mb-3 drop-shadow">{banner.heading}</h2>
        <button className="bg-orange-500 px-5 py-2 rounded-md text-sm font-semibold shadow hover:bg-orange-600 transition">
          {banner.cta}
        </button>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full px-4">
        <div className="flex justify-center gap-4">
          {visibleProducts.map((product: any, idx: number) => (
            <div
              key={idx}
              className="bg-white w-28 sm:w-36 p-2 rounded-md shadow text-center text-sm"
            >
              <img
                src={product.image}
                alt={product.name}
                className="h-20 w-full object-contain mb-2"
              />
              <p className="font-medium truncate">{product.name}</p>
              <p className="text-orange-600 text-sm">KSh {product.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}