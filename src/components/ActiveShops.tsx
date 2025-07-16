'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Seller {
  _id: string;
  name: string;
  email: string;
  image?: string;
  shopName?: string;
}

export default function ActiveShops() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/shop/active')
      .then(res => res.json())
      .then(data => {
        setSellers(data.sellers);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching active shops:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 pt-24 pb-12">
      <h1 className="text-2xl font-bold text-orange-600 mb-6">Available Seller Shops</h1>
      {sellers.length === 0 ? (
        <p className="text-gray-600">No active shops available right now.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {sellers.map(seller => (
            <Link
              key={seller._id}
              href={`/shops/${seller._id}`}
              className="block bg-white border rounded-lg shadow-sm p-4 hover:shadow-lg transition"
            >
              <div className="flex items-center gap-4">
                <img
                  src={seller.image || '/default-avatar.png'}
                  alt={seller.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {seller.shopName || seller.name}
                  </h3>
                  <p className="text-sm text-gray-500">{seller.email}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
