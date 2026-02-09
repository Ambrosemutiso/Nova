'use client';

import { useEffect, useState } from 'react';
import InstallmentProductCard from '@/components/InstallmentsProductCard';
import type { ProductType } from "@/app/types/product";

export default function InstallmentsPage() {
  const [items, setItems] = useState<ProductType[]>([]);

  useEffect(() => {
    const fetchInstallments = async () => {
      const res = await fetch('/api/products/installments');
      const data = await res.json();
      setItems(data.products || []);
    };
    fetchInstallments();
  }, []);

  return (
    <div className="pt-24 px-4 md:ml-64">
      <h1 className="text-2xl font-semibold mb-6">Buy on Installments</h1>

      {items.length === 0 ? (
        <p>No installment products available yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map(product => (
            <InstallmentProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
