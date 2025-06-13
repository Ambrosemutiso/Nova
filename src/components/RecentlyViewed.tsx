// components/RecentlyViewed.tsx
'use client';

import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { Product } from '@/app/types/product';

export default function RecentlyViewed() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchViewed = async () => {
      const stored = localStorage.getItem('recentlyViewed');
      if (!stored) return;

      const ids = JSON.parse(stored);
      if (ids.length === 0) return;

      try {
        const res = await fetch(`/api/products/recentlyviewed`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids }),
        });
        const data = await res.json();
        setProducts(data.products || []);
      } catch (err) {
        console.error('Failed to fetch recently viewed:', err);
      }
    };

    fetchViewed();
  }, []);

  if (products.length === 0) return null;

  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold mb-4">Recently Viewed</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {products.map(product => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}
