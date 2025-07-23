'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];

export default function SellerAnalytics({ sellerId }: { sellerId: string }) {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { ref, inView } = useInView({ triggerOnce: true });

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const res = await fetch('/api/seller/metrics', {
          method: 'POST',
          body: JSON.stringify({ sellerId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Something went wrong');
        setMetrics(data);
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, [sellerId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (!metrics) {
    return <div className="text-center text-gray-500">No data available</div>;
  }

  const pieData = [
    { name: 'Delivered', value: metrics.deliveredOrders },
    { name: 'Pending', value: metrics.pendingOrders },
    { name: 'Paid', value: metrics.paidOrders },
    { name: 'Cancelled', value: metrics.cancelledOrders },
  ];

  return (
    <div className="p-6 space-y-8">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card><CardContent className="p-4">Total Orders: {metrics.totalOrders}</CardContent></Card>
        <Card><CardContent className="p-4">Revenue: KES {metrics.totalRevenue.toLocaleString()}</CardContent></Card>
        <Card><CardContent className="p-4">Active Products: {metrics.activeProducts}</CardContent></Card>
        <Card><CardContent className="p-4">Followers: {metrics.totalFollowers}</CardContent></Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow p-4"
      >
        <h2 className="text-lg font-semibold mb-2">Monthly Revenue</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={metrics.chartData}>
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#4f46e5"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl shadow p-4"
      >
        <h2 className="text-lg font-semibold mb-2">Order Status</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label
            >
              {pieData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
