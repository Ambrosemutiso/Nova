'use client';

import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import type { ProductType } from "@/app/types/product";
import { Section } from './SectionWrapper';

export default function UsedRefurbishedProducts() {
  const [products, setProducts] = useState<ProductType[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products/refurbished');
        const data = await res.json();
        setProducts(data.products);
      } catch (err) {
        console.error('Failed to fetch used/refurbished products:', err);
      }
    };

    fetchProducts();
  }, []);

  if (products.length === 0) return null;

  return (
    <Section>
    <div className="px-1 py-1">
      <h2 className="text-xl font-semibold mb-4">
        Used & Refurbished Deals
      </h2>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {products.map(product => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
    </Section>
  );
}
