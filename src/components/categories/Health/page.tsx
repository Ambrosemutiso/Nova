'use client';

import { useEffect, useState } from 'react';
import { fetchProductsByCategory } from '@/lib/fetchProductsByCategory';
import ProductCard from '@/components/ProductCard';
import  { Product }  from '@/app/types/product'

export default function Health() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProductsByCategory('Health').then(setProducts);
  }, []);

  return (
<div className="flex overflow-x-auto gap-2 py-6 snap-x snap-mandatory bg-red-100 px-1 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
  {products.slice(0, 10).map((product) => (
    <div
      key={product._id}
      className="flex gap-4 overflow-x-auto pb-2"
    >
      <ProductCard product={product} />
    </div>
  ))}
</div>

  );
}

   
   