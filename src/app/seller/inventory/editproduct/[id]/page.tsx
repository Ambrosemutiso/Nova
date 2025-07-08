'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Product } from '@/app/types/product';

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/seller/products/${id}`);
        const data = await res.json();
        if (data.success) {
          setProduct(data.product);
        } else {
          setError('Failed to load product.');
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error('Error loading product:', err.message);
        } else {
          console.error('Unknown error loading product');
        }
        setError('Error loading product.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  const handleChange = (field: keyof Product, value: string | number) => {
    if (!product) return;
    setProduct({ ...product, [field]: value });
  };

  const handleSave = async () => {
    if (!product) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/seller/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      const data = await res.json();
      if (data.success) {
        alert('Product updated successfully!');
        router.push('/seller/inventory');
      } else {
        alert('Failed to update product');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Error updating product:', err.message);
      } else {
        console.error('Unknown error updating product');
      }
      alert('Error updating product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!product) return null;

  return (
    <div className="max-w-3xl mx-auto mt-24 p-6 bg-white shadow rounded">
      <h1 className="text-2xl font-semibold text-orange-600 mb-4">Edit Product</h1>

      <label className="block mb-2">
        <span className="font-semibold">Product Name</span>
        <input
          value={product.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className="w-full border rounded px-4 py-2 mt-1"
        />
      </label>

      <label className="block mb-2">
        <span className="font-semibold">Price</span>
        <input
          type="number"
          value={product.price}
          onChange={(e) => handleChange('price', parseFloat(e.target.value))}
          className="w-full border rounded px-4 py-2 mt-1"
        />
      </label>

      <label className="block mb-2">
        <span className="font-semibold">Quantity</span>
        <input
          type="number"
          value={product.quantity}
          onChange={(e) => handleChange('quantity', parseInt(e.target.value))}
          className="w-full border rounded px-4 py-2 mt-1"
        />
      </label>

      <label className="block mb-4">
        <span className="font-semibold">Description</span>
        <textarea
          value={product.description}
          onChange={(e) => handleChange('description', e.target.value)}
          className="w-full border rounded px-4 py-2 mt-1"
          rows={5}
        />
      </label>

      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded shadow transition"
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
}
