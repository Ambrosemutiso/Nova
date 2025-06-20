'use client';

import { useState } from 'react';
import { Product } from '@/app/types/product';

interface EditProductModalProps {
  product: Product;
  onClose: () => void;
  onSave: (updatedProduct: Product) => void;
}

export default function EditProductModal({ product, onClose, onSave }: EditProductModalProps) {
  const [formData, setFormData] = useState<Product>({ ...product });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/seller/products/${product._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (json.success) onSave(json.product);
    } catch (err) {
      console.error('Failed to update product:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[90%] md:w-[500px] shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Edit Product</h2>

        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Product Name"
          className="w-full mb-3 p-2 border rounded"
        />

        <input
          name="price"
          value={formData.price}
          onChange={handleChange}
          placeholder="Price"
          className="w-full mb-3 p-2 border rounded"
        />

        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description"
          className="w-full mb-3 p-2 border rounded"
        />

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
