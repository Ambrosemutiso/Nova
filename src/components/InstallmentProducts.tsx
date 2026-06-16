'use client';

import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import type { ProductType } from "@/app/types/product";
import { Section } from './SectionWrapper';

export default function InstallmentProducts() {
  const [items, setItems] = useState<ProductType[]>([]);

  useEffect(() => {
    const fetchInstallments = async () => {
      try {
        const res = await fetch('/api/products/installments');
        const data = await res.json();
        setItems(data.products || []);
      } catch (err) {
        console.error('Failed to fetch installment products:', err);
      }
    };

    fetchInstallments();
  }, []);

  if (items.length === 0) return null;
  return (
    <Section>
    <div className="px-1 py-1">
      <h2 className="text-xl font-semibold mb-4">Buy In Installments</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {items.map((product) => (
<ProductCard
  key={product._id}
  product={product}
  redirectAllTo="/installments"
/>

        ))}
      </div>
    </div>
    </Section>
  );
}
