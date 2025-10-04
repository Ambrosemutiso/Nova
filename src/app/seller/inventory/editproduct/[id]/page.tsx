'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import type { Product } from '@/app/types/product';

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/seller/products/${id}`);
        const data = await res.json();
        if (data.success) {
          setProduct(data.product);
        } else {
          toast.error('Product not found');
        }
      } catch (err) {
        toast.error('Failed to fetch product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    try {
      const res = await fetch(`/api/seller/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });

      const json = await res.json();
      if (json.success) {
        toast.success('Product updated!');
        setTimeout(() => router.push('/seller/inventory'), 1500);
      } else {
        toast.error(json.message || 'Failed to update product');
      }
    } catch (err) {
      toast.error('Error updating product');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!product) return;
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  if (loading) return <p className="mt-24 px-4">Loading...</p>;

  return (
    <div className="md:ml-64 pt-24 px-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-orange-600 mb-4">Edit Product</h1>
      {product && (
        <form onSubmit={handleUpdate} className="space-y-4">
          <input
            type="text"
            name="name"
            value={product.name}
            onChange={handleChange}
            placeholder="Product name"
            className="w-full border rounded px-3 py-2"
          />
          <input
            type="text"
            name="category"
            value={product.category}
            onChange={handleChange}
            placeholder="Category"
            className="w-full border rounded px-3 py-2"
          />
          <input
            type="number"
            name="price"
            value={product.calculatedPrice}
            onChange={handleChange}
            placeholder="Price"
            className="w-full border rounded px-3 py-2"
          />
          <input
            type="number"
            name="quantity"
            value={product.quantity}
            onChange={handleChange}
            placeholder="Quantity"
            className="w-full border rounded px-3 py-2"
          />
          <button
            type="submit"
            className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
          >
            Update Product
          </button>
        </form>
      )}
    </div>
  );
}
