// ✅ /components/MoreFromSeller.tsx
'use client';
import { useEffect, useState } from 'react';
import { Product } from '@/app/types/product';
import Link from 'next/link';
import ProductCard from './ProductCard';

export default function MoreFromSeller({ sellerId, currentProductId }: { sellerId: string; currentProductId: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sellerId) return;

    const fetchSellerProducts = async () => {
      try {
        const res = await fetch(`/api/products-by-seller/${sellerId}`);
        if (!res.ok) throw new Error('Failed to fetch seller products');

        const data = await res.json();
        const filtered = data.products.filter((p: Product) => p._id !== currentProductId);
        setProducts(filtered);
      } catch (err) {
        console.error('Error fetching seller products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerProducts();
  }, [sellerId, currentProductId]);

  if (loading || !products.length) return null;

  return (
   <div className="mt-10">
      <h2 className="text-xl font-semibold mb-4">More from this seller</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {products.slice(0, 10).map((product) => (
          <ProductCard key={product._id} product={product} />
          ))}
      </div>
    </div>
  );
}