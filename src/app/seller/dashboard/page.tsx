'use client';

import { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { ShieldCheck } from 'lucide-react';

interface Seller {
  _id: string;
  name: string;
  email: string;
}

interface Metrics {
  totalOrders: number;
  totalRevenue: number;
  activeProducts: number;
  totalFollowers: number;
  deliveredOrders: number;
  cancelledOrders: number;
  pendingOrders: number;
  paidOrders: number;
  subtotalRevenue: number; // <-- Add this in backend as well
}

export default function SellerDashboard() {
  const [seller, setSeller] = useState<Seller | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawMethod, setWithdrawMethod] = useState<'mpesa' | 'airtel' | ''>('');
const [withdrawPhone, setWithdrawPhone] = useState('');
const [withdrawAmount, setWithdrawAmount] = useState<number>(0);


  useEffect(() => {
    const storedUser = localStorage.getItem('sellerUser');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setSeller(parsed);

      fetch('/api/seller/metrics', {
        method: 'POST',
        body: JSON.stringify({ sellerId: parsed._id }),
      })
        .then((res) => res.json())
        .then((data) => setMetrics(data))
        .catch((err) => console.error('Metrics fetch error:', err));
    }
  }, []);

  const chartData = [
    { month: 'Jan', revenue: 12000 },
    { month: 'Feb', revenue: 18000 },
    { month: 'Mar', revenue: 24500 },
    { month: 'Apr', revenue: 30000 },
    { month: 'May', revenue: 27000 },
    { month: 'June', revenue: 37000 },
    { month: 'July', revenue: 17000 },
    { month: 'Aug', revenue: 24000 },
    { month: 'Sep', revenue: 28000 },
    { month: 'Oct', revenue: 21000 },
    { month: 'Nov', revenue: 47000 },
    { month: 'Dec', revenue: 100000 },
  ];

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto px-4 pt-28 pb-10">
      <ToastContainer/>
      <h1 className="text-3xl font-bold text-orange-600 mb-4">
        Welcome, {seller?.name || 'Loading...'}
      </h1>
      {/* Metrics */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
  <div className="bg-white p-6 rounded-xl shadow-md text-center">
    <h3 className="text-lg font-medium text-gray-600">Total Orders</h3>
    <p className="text-3xl font-bold text-orange-600">{metrics?.totalOrders ?? '--'}</p>
  </div>
  <div className="bg-white p-6 rounded-xl shadow-md text-center">
    <h3 className="text-lg font-medium text-gray-600">Delivered Orders</h3>
    <p className="text-3xl font-bold text-green-600">{metrics?.deliveredOrders ?? '--'}</p>
  </div>
  <div className="bg-white p-6 rounded-xl shadow-md text-center">
    <h3 className="text-lg font-medium text-gray-600">Cancelled Orders</h3>
    <p className="text-3xl font-bold text-red-500">{metrics?.cancelledOrders ?? '--'}</p>
  </div>
  <div className="bg-white p-6 rounded-xl shadow-md text-center">
    <h3 className="text-lg font-medium text-gray-600">Pending Orders</h3>
    <p className="text-3xl font-bold text-yellow-500">{metrics?.pendingOrders ?? '--'}</p>
  </div>
  <div className="bg-white p-6 rounded-xl shadow-md text-center">
    <h3 className="text-lg font-medium text-gray-600">Paid Orders</h3>
    <p className="text-3xl font-bold text-blue-600">{metrics?.paidOrders ?? '--'}</p>
  </div>
  <div className="bg-white p-6 rounded-xl shadow-md text-center">
    <h3 className="text-lg font-medium text-gray-600">Active Products</h3>
    <p className="text-3xl font-bold text-orange-600">{metrics?.activeProducts ?? '--'}</p>
  </div>
  <div className="bg-white p-6 rounded-xl shadow-md text-center relative">
    {typeof metrics?.totalFollowers === 'number' && metrics.totalFollowers >= 1 && (
      <span className="absolute top-2 right-2 bg-[color:#FFD700] text-black text-xs px-3 py-1 rounded-full shadow font-semibold z-10 flex items-center gap-1">
        <ShieldCheck size={14} className="text-green-700" />
        Verified Seller
      </span>
    )}
    <h3 className="text-lg font-medium text-gray-600">Followers</h3>
    <p className="text-3xl font-bold text-orange-600">{metrics?.totalFollowers ?? '--'}</p>
  </div>
</div>
        <div className="bg-white p-6 rounded-xl shadow-md text-center">
          <h3 className="text-lg font-medium text-gray-600">Revenue</h3>
          <p className="text-3xl font-bold text-orange-600">
            Ksh {metrics?.subtotalRevenue?.toLocaleString() ?? '--'}
          </p>

          <button
            onClick={() => setShowWithdrawModal(true)}
            className="mt-3 bg-orange-500 hover:bg-orange-600 text-white text-sm py-2 px-4 rounded transition"
          >
            Withdraw Funds
          </button>
        </div>
<div className="bg-white p-6 rounded-xl shadow-md text-center">
  <h3 className="text-lg font-medium text-gray-600">Subtotal Revenue</h3>
  <p className="text-3xl font-bold text-orange-600">
    Ksh {metrics?.subtotalRevenue?.toLocaleString() ?? '--'}
  </p>
  <button
    onClick={() => {
      setWithdrawAmount(metrics?.subtotalRevenue || 0);
      setShowWithdrawModal(true);
    }}
    className="mt-2 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
  >
    Withdraw Funds
  </button>
</div>

      {/* Revenue Chart */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Revenue Overview</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(val) => `Ksh ${val / 1000}k`} />
            <Tooltip formatter={(val: number) => `Ksh ${val.toLocaleString()}`} />
            <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <a
          href="/seller/products/add"
          className="bg-orange-600 text-white px-4 py-2 rounded shadow hover:bg-orange-700 transition"
        >
          ➕ Add Product
        </a>
        <a
          href="/seller/orders"
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
        >
          📦 View Orders
        </a>
        <a
          href="/seller/inventory"
          className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 transition"
        >
          📊 Manage Inventory
        </a>
      </div>

      {/* Seller Info */}
      {seller && (
        <div className="mt-8 bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-600 font-medium">Email:</p>
          <p className="text-lg text-orange-500">{seller.email}</p>
        </div>
      )}

      {/* 💳 Withdrawal Modal */}
{showWithdrawModal && (
  <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
    <div className="bg-white p-6 rounded-xl w-full max-w-md relative">
      <button onClick={() => setShowWithdrawModal(false)} className="absolute top-2 right-4 text-gray-500 text-2xl font-bold">×</button>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Withdraw Funds</h2>
      
      <label className="block mb-2 text-sm text-orange-600">Phone Number</label>
      <input
        type="text"
        value={withdrawPhone}
        onChange={(e) => setWithdrawPhone(e.target.value)}
        className="w-full border px-3 py-2 rounded mb-4"
        placeholder="Enter phone number"
      />

      <label className="block mb-2 text-sm text-orange-600">Amount</label>
      <input
        type="number"
        value={withdrawAmount}
        onChange={(e) => setWithdrawAmount(Number(e.target.value))}
        className="w-full border px-3 py-2 rounded mb-4"
        placeholder="Enter amount"
      />

      <label className="block mb-2 text-sm text-orange-600">Withdraw Method</label>
      <select
        value={withdrawMethod}
        onChange={(e) => setWithdrawMethod(e.target.value as 'mpesa' | 'airtel')}
        className="w-full border px-3 py-2 rounded mb-4"
      >
        <option value="mpesa">M-Pesa</option>
        <option value="airtel">Airtel Money</option>
      </select>

      <button
        onClick={async () => {
          const sellerData = JSON.parse(localStorage.getItem('sellerUser') || '{}');
          const res = await fetch('/api/seller/withdraw', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sellerId: sellerData._id,
              amount: withdrawAmount,
              phoneNumber: withdrawPhone,
              method: withdrawMethod,
            }),
          });

          const json = await res.json();
          if (json.success) {
            alert('Withdrawal request submitted!');
            setShowWithdrawModal(false);
          } else {
            alert(json.error || 'Error submitting withdrawal.');
          }
        }}
        className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded"
      >
        Submit Withdrawal
      </button>
    </div>
  </div>
)}

    </div>
  );
}
