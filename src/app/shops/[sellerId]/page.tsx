'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { useAuth } from '@/app/context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import type { Product } from '@/app/types/product';
import type { Seller } from '@/app/types/seller';

export default function SellerShopPage() {
  const { sellerId } = useParams();
  const { user } = useAuth();

  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/shops/${sellerId}`);
      const data = await res.json();

      if (data.error) {
        setSeller(null);
      } else {
        setSeller(data.seller);
        setProducts(data.products);

        if (user) {
          const userIsFollowing = data.seller.followers?.some(
            (f: { userId: string }) => f.userId === user._id
          );
          setIsFollowing(userIsFollowing);
        }
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch shop', err);
      setLoading(false);
    }
  }, [sellerId, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFollowAction = async (action: 'follow' | 'unfollow') => {
    if (!user) {
      toast.error(`Please log in to ${action} sellers`);
      return;
    }

    if (user._id === sellerId) {
      return toast.error('You cannot follow yourself.');
    }

    try {
      const res = await fetch('/api/follow-seller', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerId, userId: user._id, action }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(data.message || `${action}ed seller`);
        setIsFollowing(action === 'follow');
        fetchData();
      } else {
        toast.error(data.message || `Failed to ${action}`);
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred.');
    }
  };

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
      <ToastContainer/>
      {/* Banner */}
      <div
        className="w-full h-40 md:h-60 bg-cover bg-center"
        style={{ backgroundImage: `url('/banner3.jpg')` }}
      />

      {/* Shop Header */}
      <div className="px-6 flex justify-between items-start gap-6 mb-8 -mt-10">
        <div className="flex items-center gap-4">
          <img
            src={seller.image || '/default-avatar.png'}
            alt={seller.name}
            className="w-20 h-20 rounded-full object-cover border-4 border-white bg-white"
          />
          <div>
            <h1 className="text-lg font-semibold">{seller.shopName || seller.name}</h1>
            <p className="text-sm text-gray-500">
              {seller.followers?.length || 0} Followers
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            handleFollowAction(isFollowing ? 'unfollow' : 'follow')
          }
          className={`px-4 py-2 rounded-md font-medium ${
            isFollowing ? 'bg-gray-300 text-gray-800' : 'bg-orange-500 text-white'
          }`}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </button>
      </div>

      {/* Products by Category */}
      <div className="px-6">
        {sortedCategories.length === 0 ? (
          <p className="text-gray-500">No products found.</p>
        ) : (
          sortedCategories.map((category) => {
            const productsInCategory = groupedByCategory[category];
            const displayedProducts = productsInCategory.slice(0, 12);

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
