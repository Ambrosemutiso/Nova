'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Star, Clock, Truck, MessageSquare, ChevronLeft } from 'lucide-react';

interface Seller {
  _id: string;
  name: string;
  shopName: string;
  logo?: string;
  description?: string;
  rating: number;
  deliveryRate: number;
  responseTime: string;
  joinDate: string;
  county: string;
  town: string;
}

interface Product {
  _id: string;
  name: string;
  calculatedPrice: number;
  oldPrice?: number;
  image: string;
}

export default function SellerPage() {
  const { id } = useParams();
  const router = useRouter();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSeller = async () => {
      try {
        const res = await fetch(`/api/seller/${id}`);
        if (!res.ok) throw new Error('Failed to fetch seller');
        const data = await res.json();
        setSeller(data.seller);
        setProducts(data.products);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchSeller();
  }, [id]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="w-10 h-10 border-4 border-orange-500 border-dashed rounded-full animate-spin"></div>
        <p className="mt-3 text-gray-500 text-sm">Loading seller details...</p>
      </div>
    );

  if (!seller)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-600">
        <p>Seller not found.</p>
        <button
          onClick={() => router.back()}
          className="mt-3 px-4 py-2 bg-orange-600 text-white rounded-lg"
        >
          Go Back
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white shadow-sm flex items-center gap-3 px-4 py-3">
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-semibold text-gray-800 truncate">
          {seller.shopName || seller.name}
        </h1>
      </div>

      {/* Seller Info */}
      <div className="bg-white mx-4 mt-5 rounded-xl shadow-sm p-5 flex flex-col sm:flex-row gap-5 items-center sm:items-start">
        <img
          src={seller.logo || '/default-shop.png'}
          alt={seller.shopName}
          className="w-24 h-24 rounded-full object-cover border border-gray-200"
        />
        <div className="flex-1 space-y-2 text-center sm:text-left">
          <h2 className="text-2xl font-bold text-gray-800">{seller.shopName}</h2>
          <p className="text-sm text-gray-600">{seller.description || 'No description provided.'}</p>
          <p className="text-sm text-gray-600">
            Location: {seller.town}, {seller.county}
          </p>
          <p className="text-sm text-gray-500">
            Joined: {new Date(seller.joinDate).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Seller Performance */}
      <div className="mx-4 mt-5 bg-white shadow-sm rounded-xl p-5 grid grid-cols-3 gap-3 text-center">
        <div>
          <Star className="w-5 h-5 mx-auto text-yellow-500" />
          <p className="font-bold text-gray-800">{seller.rating.toFixed(1)}</p>
          <p className="text-xs text-gray-500">Rating</p>
        </div>
        <div>
          <Truck className="w-5 h-5 mx-auto text-green-500" />
          <p className="font-bold text-gray-800">{seller.deliveryRate}%</p>
          <p className="text-xs text-gray-500">Delivery Success</p>
        </div>
        <div>
          <Clock className="w-5 h-5 mx-auto text-blue-500" />
          <p className="font-bold text-gray-800">{seller.responseTime}</p>
          <p className="text-xs text-gray-500">Response Time</p>
        </div>
      </div>

      {/* Product List */}
      <div className="mx-4 mt-7">
        <h2 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
          Products by {seller.shopName}
        </h2>
        {products.length === 0 ? (
          <p className="text-gray-500 text-sm">No products available.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <div
                key={product._id}
                onClick={() => router.push(`/product/${product._id}`)}
                className="bg-white rounded-lg shadow hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-40 object-cover"
                />
                <div className="p-3 space-y-1">
                  <p className="text-sm font-medium text-gray-800 line-clamp-2">
                    {product.name}
                  </p>
                  <p className="text-orange-600 font-bold text-sm">
                    Ksh {product.calculatedPrice.toLocaleString()}
                  </p>
                  {product.oldPrice && (
                    <p className="text-gray-400 line-through text-xs">
                      Ksh {product.oldPrice.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contact Seller */}
      <div className="fixed bottom-4 left-0 right-0 flex justify-center">
        <button
          onClick={() => router.push(`/chat/${seller._id}`)}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-medium px-5 py-3 rounded-full shadow-lg transition-all"
        >
          <MessageSquare className="w-4 h-4" />
          Contact Seller
        </button>
      </div>
    </div>
  );
}
