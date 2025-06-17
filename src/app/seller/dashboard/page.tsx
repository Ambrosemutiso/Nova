'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface Seller {
  _id: string;
  name: string;
  email: string;
}

interface Metrics {
  totalOrders: number;
  totalRevenue: number;
  activeProducts: number;
}

export default function SellerDashboard() {
  const [seller, setSeller] = useState<Seller | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);

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
  ]; // Replace with real backend data later

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-3xl font-bold text-orange-600 mb-4">
        Welcome, {seller?.name || 'Loading...'}
      </h1>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md text-center">
          <h3 className="text-lg font-medium text-gray-600">Total Orders</h3>
          <p className="text-3xl font-bold text-orange-600">{metrics?.totalOrders ?? '--'}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md text-center">
          <h3 className="text-lg font-medium text-gray-600">Revenue</h3>
          <p className="text-3xl font-bold text-orange-600">Ksh {metrics?.totalRevenue?.toLocaleString() ?? '--'}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md text-center">
          <h3 className="text-lg font-medium text-gray-600">Active Products</h3>
          <p className="text-3xl font-bold text-orange-600">{metrics?.activeProducts ?? '--'}</p>
        </div>
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
          href="/seller/addproduct"
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

      {/* Seller Info (optional) */}
      {seller && (
        <div className="mt-8 bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-600 font-medium">Email:</p>
          <p className="text-lg text-gray-800">{seller.email}</p>
        </div>
      )}
    </div>
  );
}
