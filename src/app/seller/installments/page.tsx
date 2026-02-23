'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";

export default function InstallmentsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sellerData = localStorage.getItem("sellerUser");
    if (!sellerData) return;

    const { _id: sellerId } = JSON.parse(sellerData);

    const fetchInstallments = async () => {
      try {
        const res = await fetch(`/api/seller/installments?sellerId=${sellerId}`);
        const json = await res.json();

        if (json.success) {
          setProducts(json.data);
        }
      } catch {
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchInstallments();
  }, []);

  if (loading) return <p className="mt-24 px-4">Loading...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-6xl mx-auto px-4 pt-28 pb-10">
      <h1 className="text-2xl font-semibold text-orange-600 mb-6">
        Lipa Mdogo Mdogo Products
      </h1>

      {products.length === 0 ? (
        <p>No installment-enabled products.</p>
      ) : (
        <table className="min-w-full border divide-y">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Product</th>
              <th className="px-4 py-2 text-left">Price</th>
              <th className="px-4 py-2 text-left">Deposit (%)</th>
              <th className="px-4 py-2 text-left">Months</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {products.map((p: any) => (
              <tr key={p._id}>
                <td className="px-4 py-2">{p.name}</td>
                <td className="px-4 py-2">Ksh {p.calculatedPrice}</td>
                <td className="px-4 py-2">{p.installmentDepositPercent}%</td>
                <td className="px-4 py-2">{p.installmentMonths} months</td>

                <td className="px-4 py-2">
                  <Link
                    href={`/seller/installments/edit/${p._id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
    </div>
  );
}
