'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

type Order = {
  _id: string;
  customerName: string;
  deliveryAddress: string;
  deliveryStatus: string;
  items: { name: string; quantity: number }[];
  createdAt: string;
};

const COLORS = ['#34D399', '#FB923C']; // green, orange

export default function LogisticsDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    axios
      .get('/api/logistics/orders')
      .then((res) => setOrders(res.data))
      .catch((err) => console.error('Failed to fetch orders', err));
  }, []);

  // Filter logic
  const filteredOrders = orders.filter((order) =>
    order.customerName.toLowerCase().includes(search.toLowerCase()) ||
    order.deliveryAddress.toLowerCase().includes(search.toLowerCase())
  );

  const filteredByDate = filteredOrders.filter((order) => {
    const orderDate = new Date(order.createdAt);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    return (!start || orderDate >= start) && (!end || orderDate <= end);
  });

  const delivered = filteredByDate.filter((o) => o.deliveryStatus === 'Delivered').length;
  const pending = filteredByDate.filter((o) => o.deliveryStatus !== 'Delivered').length;

  const chartData = [
    { name: 'Delivered', value: delivered },
    { name: 'Pending', value: pending },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold mb-4">📦 Logistics Partner Dashboard</h2>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="🔍 Search by name or address"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded w-full md:w-1/3"
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border px-3 py-2 rounded"
        />
      </div>

      {/* Pie Chart */}
      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="text-lg font-semibold mb-2">📊 Delivery Status Summary</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
              label
            >
              {chartData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-2">Customer</th>
              <th className="text-left px-4 py-2">Address</th>
              <th className="text-left px-4 py-2">Status</th>
              <th className="text-left px-4 py-2">Date</th>
              <th className="text-left px-4 py-2">Items</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredByDate.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-medium">{order.customerName}</td>
                <td className="px-4 py-2">{order.deliveryAddress}</td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      order.deliveryStatus === 'Delivered'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {order.deliveryStatus}
                  </span>
                </td>
                <td className="px-4 py-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-2">
                  <ul className="list-disc list-inside">
                    {order.items.map((item, idx) => (
                      <li key={idx}>
                        {item.name} × {item.quantity}
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
            {filteredByDate.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-400">
                  No orders match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
