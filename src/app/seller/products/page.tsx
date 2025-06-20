'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

type Product = {
  _id: string;
  name: string;
  image: string;
  calculatedPrice: number;
  quantity: number;
  createdAt: string;
};

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/seller/products');
        const json = await res.json();
        if (json.success) {
          setProducts(json.products);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">📦 Inventory Management</h1>

      {loading ? (
        <div className="text-gray-600">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="text-gray-600">No products found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <div key={product._id} className="border rounded-lg shadow p-4">
              <Image
                src={product.image || '/placeholder.png'}
                alt={product.name}
                width={300}
                height={200}
                className="w-full h-48 object-cover rounded"
              />
              <h2 className="text-lg font-semibold mt-2">{product.name}</h2>
              <p className="text-gray-600">Price: KSh {product.calculatedPrice}</p>
              <p className={`mt-1 text-sm ${product.quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {product.quantity > 0 ? `In Stock: ${product.quantity}` : 'Out of Stock'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Added: {new Date(product.createdAt).toLocaleDateString()}
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => router.push(`/seller/edit/${product._id}`)}
                  className="px-4 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => console.log('Delete logic here')}
                  className="px-4 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
