'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/app/types/product';

interface Seller {
  _id: string;
  name: string;
  email: string;
  image?: string;
  shopName?: string;
}

export default function SellerShopPage() {
  const { sellerId } = useParams();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sellerId) return;

    fetch(`/api/shops/${sellerId}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setSeller(null);
        } else {
          setSeller(data.seller);
          setProducts(data.products);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [sellerId]);

  const groupedByCategory = products.reduce<Record<string, Product[]>>((acc, product) => {
    const cat = product.category || 'Uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(product);
    return acc;
  }, {});

  const sortedCategories = Object.keys(groupedByCategory).sort();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto"></div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="text-center py-20 text-orange-500">
        <p>Shop not found or inactive.</p>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-10">
      {/* Banner */}
      <div className="w-full h-40 md:h-60 bg-cover bg-center" style={{ backgroundImage: `url('/banner4.jpg')` }} />

      {/* Shop Header */}
      <div className="px-6 flex items-center gap-6 mb-8 -mt-10">
        <img
          src={seller.image || '/default-avatar.png'}
          alt={seller.name}
          className="w-20 h-20 rounded-full object-cover border-4 border-white bg-white"
        />
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {seller.shopName || `${seller.name}'s Shop`}
          </h1>
          <p className="text-sm text-gray-500">{seller.email}</p>
        </div>
      </div>

      {/* Products by Category */}
      <div className="px-6">
        {sortedCategories.length === 0 ? (
          <p className="text-gray-500">No products found.</p>
        ) : (
          sortedCategories.map((category) => {
            const productsInCategory = groupedByCategory[category];
            const displayedProducts = productsInCategory.slice(0, 12); // Show only 12

            return (
              <div key={category} className="mb-10 relative">
                <div className="absolute -top-4 left-4 right-4 bg-orange-500 text-white px-4 py-2 text-sm font-semibold rounded-md shadow-lg z-10 flex justify-between items-center">
                  <span>{category}</span>
                  {productsInCategory.length > 1 && (
                    <Link
                      href={`/shops/${sellerId}/category/${encodeURIComponent(category)}`}
                      className="text-sm text-white hover:underline"
                    >
                      See All →
                    </Link>
                  )}
                </div>
                <div className="pt-10">
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {displayedProducts.map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
