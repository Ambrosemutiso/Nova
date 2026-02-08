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
  const [filtered, setFiltered] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('name');

  // 🔹 Fetch Active Sellers
  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const res = await fetch('/api/shop/active');
        const data = await res.json();
        setSellers(data.sellers || []);
        setFiltered(data.sellers || []);
      } catch (err) {
        console.error('Error fetching active shops:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSellers();
  }, []);

  // 🔹 Filter & Sort Logic
  useEffect(() => {
    let filteredList = sellers.filter(
      (s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.shopName?.toLowerCase().includes(search.toLowerCase())
    );

    if (sort === 'name') {
      filteredList = filteredList.sort((a, b) =>
        (a.shopName || a.name).localeCompare(b.shopName || b.name)
      );
    } else if (sort === 'recent') {
      filteredList = filteredList.sort((a, b) => b._id.localeCompare(a._id));
    }

    setFiltered(filteredList);
  }, [search, sort, sellers]);

  // 🔹 Skeleton Loader
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-12">
        <h1 className="text-2xl font-bold text-orange-600 mb-6">Available Seller Shops</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white p-5 rounded-xl shadow-sm">
              <div className="w-14 h-14 bg-gray-200 rounded-full mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-6xl mx-auto px-4 pt-28 pb-10">
      {/* 🔹 Search & Sort Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <input
          type="text"
          placeholder="Search shops..."
          className="w-full sm:w-1/2 border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          onChange={(e) => setSort(e.target.value)}
          value={sort}
        >
          <option value="name">Sort by Name (A-Z)</option>
          <option value="recent">Most Recent</option>
        </select>
      </div>

      {/* 🔹 Shops Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-600 mb-3">😔 No active shops found.</p>
          <Link
            href="/desc/sell-on-novaxmax"
            className="text-orange-600 font-medium hover:underline"
          >
            Become a Seller →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filtered.map((seller) => (
            <Link
              key={seller._id}
              href={`/shops/${seller._id}`}
              className="group relative bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <img
                  src={seller.image || `https://api.dicebear.com/7.x/thumbs/png?seed=${encodeURIComponent(seller.name || 'guest')}`}
                  alt={seller.name}
                  loading="lazy"
                  className="w-14 h-14 rounded-full object-cover border border-gray-200"
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition">
                    {seller.shopName || seller.name}
                  </h3>
                </div>
              </div>

              <div className="absolute top-2 right-2">
                <span className="bg-orange-100 text-orange-700 text-xs font-medium px-2 py-1 rounded-full">
                  Active
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
    </div>
  );
}
