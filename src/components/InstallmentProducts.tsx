'use client';

import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { Product } from '@/app/types/product';

export default function InstallmentProducts() {
  const [items, setItems] = useState<Product[]>([]);

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
    <div className="mt-10">
      <h2 className="text-xl font-semibold mb-4">Buy in Installments</h2>

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
  );
}
