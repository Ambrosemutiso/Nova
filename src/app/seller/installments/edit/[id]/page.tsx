'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import type { ProductType } from "@/app/types/product";

export default function EditInstallmentPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<ProductType | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch product data
  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/seller/installments/${id}`);
        const data = await res.json();
        if (data.success) {
          setProduct(data.product);
        } else {
          toast.error('Product not found');
        }
      } catch {
        toast.error('Failed to fetch product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Handle form submission
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    try {
      const res = await fetch(`/api/seller/installments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          installmentEnabled: !!product.installmentEnabled, // ensure boolean
          installmentDepositPercent: Number(product.installmentDepositPercent) || 0,
          installmentMonths: Number(product.installmentMonths) || 0,
          installmentPolicy: product.installmentPolicy || '',
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success('Product updated!');
        setTimeout(() => router.push('/seller/installments'), 1500);
      } else {
        toast.error(json.message || 'Failed to update product');
      }
    } catch {
      toast.error('Error updating product');
    }
  };

  if (loading) return <p className="mt-24 px-4">Loading...</p>;

  return (
    <div className="md:ml-64 pt-24 px-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-orange-600 mb-4">
        Edit Installment Plan - {product?.name}
      </h1>

      {product && (
        <form onSubmit={handleUpdate} className="space-y-4">
          {/* Installment Enabled Switch */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={product.installmentEnabled}
              onChange={(e) =>
                setProduct({ ...product, installmentEnabled: e.target.checked })
              }
            />
            Accept Installments
          </label>

          {/* Deposit Percent */}
          <div>
            <label className="text-sm block mb-1">Deposit Percent (%)</label>
            <input
              type="number"
              name="installmentDepositPercent"
              value={product.installmentDepositPercent}
              onChange={(e) =>
                setProduct({ ...product, installmentDepositPercent: Number(e.target.value) })
              }
              className="w-full border px-3 py-2 rounded"
              placeholder="e.g., 30"
              min={0}
            />
          </div>

          {/* Installment Months */}
          <div>
            <label className="text-sm block mb-1">Installment Duration (Months)</label>
            <input
              type="number"
              name="installmentMonths"
              value={product.installmentMonths}
              onChange={(e) =>
                setProduct({ ...product, installmentMonths: Number(e.target.value) })
              }
              className="w-full border px-3 py-2 rounded"
              placeholder="e.g., 6"
              min={0}
            />
          </div>

          {/* Installment Policy */}
          <div>
            <label className="text-sm block mb-1">Installment Policy (Optional)</label>
            <input
              type="text"
              name="installmentPolicy"
              value={product.installmentPolicy || ''}
              onChange={(e) =>
                setProduct({ ...product, installmentPolicy: e.target.value })
              }
              className="w-full border px-3 py-2 rounded"
              placeholder="Terms and conditions"
            />
          </div>

          <button
            type="submit"
            className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
          >
            Save Changes
          </button>
        </form>
      )}
    </div>
  );
}
