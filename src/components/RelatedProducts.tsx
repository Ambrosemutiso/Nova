// components/RelatedProducts.tsx
'use client';

import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { Product } from '@/app/types/product';

interface RelatedProductsProps {
  name: string;
  currentId: string;
}

export default function RelatedProducts({ name, currentId }: RelatedProductsProps) {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const keyword = name.split(' ')[0]; // take the first word, e.g., "iPhone"
        const res = await fetch(`/api/products/related?keyword=${keyword}&excludeId=${currentId}`);
        const data = await res.json();
        setRelatedProducts(data.products);
      } catch (err) {
        console.error('Failed to fetch related products:', err);
      }
    };

    fetchRelated();
  }, [name, currentId]);

  if (relatedProducts.length === 0) return null;

  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold mb-4">Related Products</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {relatedProducts.map(product => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}
