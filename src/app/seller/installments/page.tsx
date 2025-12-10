"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";

// Define the product type
interface Product {
  _id: string;
  name: string;
  installmentEnabled: boolean;
  installmentDepositPercent: number;
  installmentMonths: number;
  installmentPolicy?: string;
}

export default function SellerInstallmentsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sellerData = localStorage.getItem("sellerUser");
    if (!sellerData) return;

    const { _id: sellerId } = JSON.parse(sellerData);

    const fetchProducts = async () => {
      try {
        const res = await fetch(`/api/seller/installments?sellerId=${sellerId}`);
        const json = await res.json();

        if (json.success) setProducts(json.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

const saveSettings = async () => {
  if (!editing) return;

  try {
    const res = await fetch(`/api/seller/installments/${editing._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        installmentEnabled: editing.installmentEnabled,
        installmentDepositPercent: editing.installmentDepositPercent,
        installmentMonths: editing.installmentMonths,
        installmentPolicy: editing.installmentPolicy,
      }),
    });

    const json = await res.json();

    if (json.success && json.product) {
      toast.success("Updated!");

      setProducts((prev) =>
        prev.map((p) => (p._id === json.product._id ? json.product : p))
      );

      setEditing(null);
    } else {
      toast.error(json.message || "Failed to update");
    }
  } catch (err) {
    console.error(err);
    toast.error("Error saving");
  }
};


  if (loading) return <p>Loading Installment Products...</p>;

  return (
    <div className="md:ml-64 pt-24 px-4">
      <h1 className="text-2xl font-semibold text-orange-600 mb-4">
        Installment Products
      </h1>

      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="grid gap-4">
          {products.map((product) => (
            <div
              key={product._id}
              className="border p-4 rounded flex justify-between"
            >
              <div>
                <p className="font-semibold">{product.name}</p>
                {product.installmentEnabled ? (
                  <p className="text-orange-700 text-sm">
                    Enabled — {product.installmentDepositPercent}% deposit /{" "}
                    {product.installmentMonths} months
                  </p>
                ) : (
                  <p className="text-gray-500 text-sm">Installment Disabled</p>
                )}
              </div>

              <button
                onClick={() => setEditing(product)}
                className="bg-orange-600 text-white px-3 py-1 rounded"
              >
                Configure
              </button>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white p-6 rounded w-full max-w-md">
            <h2 className="font-semibold mb-3">
              Configure Installments — {editing.name}
            </h2>

            <label className="flex gap-2 mb-3">
              <input
                type="checkbox"
                checked={editing.installmentEnabled}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    installmentEnabled: e.target.checked,
                  })
                }
              />
              Enable Installments
            </label>

            <div className="mb-3">
              <label className="text-sm">Deposit Percent (%)</label>
              <input
                type="number"
                className="w-full border p-2 rounded"
                value={editing.installmentDepositPercent}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    installmentDepositPercent: Number(e.target.value),
                  })
                }
              />
            </div>

            <div className="mb-3">
              <label className="text-sm">Months</label>
              <input
                type="number"
                className="w-full border p-2 rounded"
                value={editing.installmentMonths}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    installmentMonths: Number(e.target.value),
                  })
                }
              />
            </div>

            <div className="flex gap-3 justify-end mt-4">
              <button
                className="px-4 py-2 border rounded"
                onClick={() => setEditing(null)}
              >
                Cancel
              </button>
              <button
                onClick={saveSettings}
                className="px-4 py-2 bg-orange-600 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
