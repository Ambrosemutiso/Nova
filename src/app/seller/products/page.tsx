'use client';

import { useEffect, useState } from 'react';
import { Product } from '@/app/types/product';

export default function SellerProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const stored = localStorage.getItem('sellerUser');
      if (!stored) return;

      const { id } = JSON.parse(stored);

      try {
        const res = await fetch(`/api/seller/products?sellerId=${id}`);
        const data = await res.json();
        setProducts(data.products || []);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="bg-white p-4 mt-10 rounded shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Products</h2>

      {loading ? (
        <p>Loading products...</p>
      ) : products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-sm">Name</th>
                <th className="px-4 py-2 text-left text-sm">Price</th>
                <th className="px-4 py-2 text-left text-sm">Quantity</th>
                <th className="px-4 py-2 text-left text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-t">
                  <td className="px-4 py-2">{p.name}</td>
                  <td className="px-4 py-2">Ksh {p.calculatedPrice}</td>
                  <td className="px-4 py-2">{p.quantity}</td>
                  <td className="px-4 py-2">
                    {p.quantity > 0 ? (
                      <span className="text-green-600 font-medium">In Stock</span>
                    ) : (
                      <span className="text-red-600 font-medium">Out of Stock</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
