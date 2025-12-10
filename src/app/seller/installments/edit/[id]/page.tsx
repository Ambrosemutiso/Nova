"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function EditInstallmentPage() {
  const { id } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      const res = await fetch(`/api/seller/installments/${id}`);
      const json = await res.json();

      if (json.success) setProduct(json.product);
      else toast.error("Product not found");

      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  const handleUpdate = async (e: any) => {
    e.preventDefault();

    try {
      const res = await fetch(`/api/seller/installments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });

      const json = await res.json();
      if (json.success) {
        toast.success("Installment updated!");
        setTimeout(() => router.push("/seller/installments"), 1500);
      } else {
        toast.error(json.message);
      }
    } catch {
      toast.error("Update failed");
    }
  };

  const handleChange = (e: any) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  if (loading) return <p className="mt-24 px-4">Loading...</p>;

  return (
    <div className="md:ml-64 pt-24 px-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-orange-600 mb-4">
        Edit Installment Plan
      </h1>

      <form onSubmit={handleUpdate} className="space-y-4">
        <input
          type="number"
          name="installmentMonthlyAmount"
          value={product.installmentMonthlyAmount}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          placeholder="Monthly Amount"
        />

        <input
          type="number"
          name="installmentDuration"
          value={product.installmentDuration}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          placeholder="Duration in months"
        />

        <button className="bg-orange-600 text-white px-4 py-2 rounded">
          Save Changes
        </button>
      </form>
    </div>
  );
}
