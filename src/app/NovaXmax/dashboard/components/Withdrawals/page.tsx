"use client";

import { useEffect, useState } from "react";

// Shared withdrawal types
interface SellerInfo {
  shopName?: string;
}

interface AffiliateInfo {
  name?: string;
}

interface SellerWithdrawal {
  _id: string;
  sellerId?: SellerInfo;
  amount: number;
  method: string;
  phoneNumber: string;
  status: "pending" | "approved" | "rejected";
}

interface AffiliateWithdrawal {
  _id: string;
  affiliateId?: AffiliateInfo;
  amount: number;
  method: string;
  phone: string;
  status: "Pending" | "Approved" | "Rejected";
}

export default function Withdrawals() {
  const [mode, setMode] = useState<"seller" | "affiliate">("seller");
  const [withdrawals, setWithdrawals] = useState<any[]>([]);

  const fetchRequests = async () => {
    const url =
      mode === "seller"
        ? "/api/admin/withdraw/list"
        : "/api/admin/withdraw/affiliate";

    const res = await fetch(url);
    const data = await res.json();
    setWithdrawals(data);
  };

  useEffect(() => {
    fetchRequests();
  }, [mode]);

  const updateStatus = async (
    id: string,
    status: "approved" | "rejected" | "Approved" | "Rejected"
  ) => {
    const url =
      mode === "seller"
        ? `/api/admin/withdraw/${id}`
        : `/api/admin/withdraw/affiliate/${id}`;

    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    const data = await res.json();
    alert(data.message);
    fetchRequests();
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Withdrawal Requests</h1>

      {/* Mode Switch */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setMode("seller")}
          className={`px-4 py-2 rounded ${
            mode === "seller" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Seller Withdrawals
        </button>

        <button
          onClick={() => setMode("affiliate")}
          className={`px-4 py-2 rounded ${
            mode === "affiliate" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Affiliate Withdrawals
        </button>
      </div>

      {withdrawals.length === 0 && <p>No withdrawal requests found.</p>}

      <div className="space-y-4">
        {withdrawals.map((w: any) => (
          <div key={w._id} className="border p-4 rounded shadow-sm">
            {mode === "seller" ? (
              <p>
                <b>Seller:</b> {w.sellerId?.shopName || "Unknown"}
              </p>
            ) : (
              <p>
                <b>Affiliate:</b> {w.affiliateId?.name || "Unknown"}
              </p>
            )}

            <p>
              <b>Amount:</b> KES {w.amount}
            </p>
            <p>
              <b>Method:</b> {w.method}
            </p>
            <p>
              <b>Phone:</b> {w.phoneNumber || w.phone}
            </p>

            <p>
              <b>Status:</b> {w.status}
            </p>

            {(w.status.toLowerCase() === "pending" ||
              w.status === "Pending") && (
              <div className="mt-3 flex gap-3">
                <button
                  onClick={() =>
                    updateStatus(
                      w._id,
                      mode === "seller" ? "approved" : "Approved"
                    )
                  }
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  Approve & Pay
                </button>

                <button
                  onClick={() =>
                    updateStatus(
                      w._id,
                      mode === "seller" ? "rejected" : "Rejected"
                    )
                  }
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
