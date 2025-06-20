'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  createdAt: string;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sellerData = localStorage.getItem('sellerUser');
    if (!sellerData) return;

    const { _id: sellerId } = JSON.parse(sellerData);
    console.log('Using sellerId:', sellerId);

    const fetchProducts = async () => {
      try {
        const res = await fetch(`/api/seller/products?sellerId=${sellerId}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setProducts(json.data);
        } else {
          setProducts([]); // fallback in case data is missing
        }
      } catch (error) {
        console.error('Failed to fetch products', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleDelete = async (productId: string) => {
    const confirmDelete = confirm('Are you sure you want to delete this product?');
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/seller/products/${productId}`, {
        method: 'DELETE',
      });
      const json = await res.json();

      if (json.success) {
        alert('Product deleted!');
        setProducts((prev) => prev.filter((p) => p._id !== productId));
      } else {
        alert('Failed to delete: ' + json.message);
      }
    } catch (err) {
      console.error('Delete failed:', err);
      alert('An error occurred while deleting the product.');
    }
  };

  return (
    <div className="pt-24 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-orange-600">My Inventory</h1>
        <Link
          href="/seller/products/add"
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
        >
          + Add Product
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : Array.isArray(products) && products.length === 0 ? (
        <p className="text-gray-500">No products in your inventory yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 divide-y">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-left">Price</th>
                <th className="px-4 py-2 text-left">Quantity</th>
                <th className="px-4 py-2 text-left">Created</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((product) => (
                <tr key={product._id}>
                  <td className="px-4 py-2 font-medium">{product.name}</td>
                  <td className="px-4 py-2">{product.category}</td>
                  <td className="px-4 py-2">Ksh {product.price.toFixed(2)}</td>
                  <td className="px-4 py-2">{product.quantity}</td>
                  <td className="px-4 py-2">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    <Link
                      href={`/seller/editproduct/${product._id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
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
