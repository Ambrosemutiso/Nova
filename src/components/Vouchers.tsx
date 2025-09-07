"use client";

import { useEffect, useState } from "react";

interface Voucher {
  _id: string;
  code: string;
  discount: number;
  expiry: string;
  status: string;
}

export default function MyVouchersPage() {
  const [data, setData] = useState<{
    ordersCount: number;
    percentage: number;
    isTopCustomer: boolean;
    vouchers: Voucher[];
  } | null>(null);

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    const res = await fetch("/api/user/vouchers");
    const result = await res.json();
    setData(result);
  };

  if (!data) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-blue-600">🎁 My Vouchers</h1>

      {/* Progress */}
      <div className="rounded-2xl shadow-md p-4 bg-white">
        <h2 className="text-lg font-semibold mb-2">Your Shopping Progress</h2>
        <p className="text-sm text-gray-600 mb-2">
          You have placed <span className="font-bold">{data.ordersCount}</span>{" "}
          orders so far.
        </p>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full"
            style={{ width: `${data.percentage}%` }}
          ></div>
        </div>
        <p className="text-sm mt-2 text-yellow-600 font-medium">
          {data.percentage}% of all customer orders
        </p>
      </div>

      {/* Top Customer Notification */}
      {data.isTopCustomer && (
        <div className="bg-yellow-100 border-l-4 border-yellow-400 rounded-2xl p-4">
          <p className="text-yellow-700 font-semibold">
            🏆 Congratulations! You are currently the <b>Top Customer</b> 🎉  
            Keep shopping to maintain your crown!
          </p>
        </div>
      )}

      {/* Available Vouchers */}
      <div className="rounded-2xl shadow-md p-4 bg-white">
        <h2 className="text-lg font-semibold text-blue-600 mb-4">
          Available Vouchers
        </h2>
        {data.vouchers.length > 0 ? (
          <ul className="space-y-3">
            {data.vouchers.map((voucher) => (
              <li
                key={voucher._id}
                className="p-3 bg-blue-50 rounded-lg flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-blue-700">
                    Code: {voucher.code}
                  </p>
                  <p className="text-sm text-gray-600">
                    Discount: {voucher.discount}% off
                  </p>
                  <p className="text-sm text-gray-500">
                    Expiry: {new Date(voucher.expiry).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-green-600 font-bold">Active</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No active vouchers yet.</p>
        )}
      </div>

      {/* Instructions */}
      <div className="rounded-2xl shadow-md p-4 bg-white">
        <h2 className="text-lg font-semibold text-orange-600 mb-3">
          How to Use Your Voucher
        </h2>
        <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700">
          <li>Copy your voucher code.</li>
          <li>Go to the checkout page when shopping.</li>
          <li>Enter the voucher code in the “Voucher/Promo Code” field.</li>
          <li>Enjoy your discount on eligible items 🎉</li>
        </ul>
      </div>
    </div>
  );
}
