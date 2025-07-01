'use client';

import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { Product } from '@/app/types/product';

export default function SponsoredProducts() {
  const [sponsoredProducts, setSponsoredProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchSponsored = async () => {
      try {
        const res = await fetch('/api/products/sponsored');
        const data = await res.json();
        setSponsoredProducts(data.products || []);
      } catch (err) {
        console.error('Failed to fetch sponsored products:', err);
      }
    };

    fetchSponsored();
  }, []);

  if (sponsoredProducts.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-xl font-semibold mb-4">Sponsored Products</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {sponsoredProducts.map((product) => (
          <ProductCard key={product._id} product={product} showSponsoredBadge />
        ))}
      </div>
    </div>
  );
}
