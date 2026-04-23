'use client';
import { useEffect, useState } from 'react';
import type { ProductType } from "@/app/types/product";
import ProductCard from './ProductCard';
import { Section } from './SectionWrapper';

export default function TopPicksForYou() {
  const [products, setProducts] = useState<ProductType[]>([]);

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
    <Section>
    <section className="px-1 py-1">
      <h2 className="text-xl font-semibold mb-4">Top Picks for You</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {products.map(p => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </section>
    </Section>
  );
}
