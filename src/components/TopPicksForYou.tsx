'use client';
import { useEffect, useState } from 'react';
import { Product } from '@/app/types/product';
import ProductCard from './ProductCard';

export default function TopPicksForYou() {
  const [products, setProducts] = useState<Product[]>([]);

useEffect(() => {
  const counts = JSON.parse(localStorage.getItem('viewCounts') || '{}');
  const sortedIds = (Object.entries(counts) as [string, number][])
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id)
    .slice(0, 6);

  if (!sortedIds.length) return;

  fetch('/api/top-picks', {
    method: 'POST',
    body: JSON.stringify({ ids: sortedIds }),
    headers: { 'Content-Type': 'application/json' },
  })
    .then(res => res.json())
    .then(setProducts);
}, []);


  if (!products.length) return null;

  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold mb-4">Top Picks for You</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map(p => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </section>
  );
}
