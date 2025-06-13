'use client';

import { useEffect, useState } from 'react';
import { fetchProductsByCategory } from '@/lib/fetchProductsByCategory';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/app/types/product';

export default function Phone() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProductsByCategory('Phones').then(setProducts);
  }, []);

  return (
<div className="flex overflow-x-auto gap-2 px-2 py-6 snap-x snap-mandatory scrollbar-hide bg-red-100">
  {products.slice(0, 10).map((product) => (
    <div
      key={product._id}
      className="w-64 min-w-[16rem] flex-shrink-0 snap-start"
    >
      <ProductCard product={product} />
    </div>
  ))}
</div>

  );
}
