'use client';

import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import type { ProductType } from "@/app/types/product";
import { Section } from './SectionWrapper';

export default function SponsoredProducts() {
  const [sponsored, setSponsored] = useState<ProductType[]>([]);

  useEffect(() => {
    const fetchSponsored = async () => {
      try {
        const res = await fetch('/api/products/sponsored');
        const data = await res.json();
        setSponsored(data.products || []);
      } catch (err) {
        console.error('Failed to fetch sponsored products:', err);
      }
    };

    fetchSponsored();
  }, []);

  if (sponsored.length === 0) return null;

  return (
    <Section>
    <div className="px-1 py-1">
      <h2 className="text-xl font-semibold mb-4">Sponsored Products</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {sponsored.map((product) => (
          <ProductCard key={product._id} product={product} showSponsoredBadge />
        ))}
      </div>
    </div>
    </Section>
  );
}
