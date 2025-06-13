// components/CustomersAlsoViewed.tsx
'use client';

import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { Product } from '@/app/types/product';

export default function CustomersAlsoViewed({ productId }: { productId: string }) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/products/alsoviewed?excludeId=${productId}`);
        const data = await res.json();
        setProducts(data.products || []);
      } catch (err) {
        console.error('Error fetching also viewed products:', err);
      }
    };

    fetchData();
  }, [productId]);

  if (products.length === 0) return null;

  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold mb-4">Customers Also Viewed</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {products.map(product => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}
