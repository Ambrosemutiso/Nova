'use client';
import { useEffect, useState } from 'react';
import type { ProductType } from "@/app/types/product";
import ProductCard from './ProductCard';
import { Section } from './SectionWrapper';

export default function SuggestedForYou() {
  const [products, setProducts] = useState<ProductType[]>([]);

  useEffect(() => {
    const recent = JSON.parse(localStorage.getItem('recentViews') || '[]');
    if (!recent.length) return;

    fetch('/api/suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recent }),
    })
      .then(res => res.json())
      .then(setProducts);
  }, []);

  if (!products.length) return null;

  return (
    <Section>
    <div className="px-1 py-1">
      <div className="flex gap-4 overflow-x-auto pb-2">
        {products.map(product => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
    </Section>
  );
}
