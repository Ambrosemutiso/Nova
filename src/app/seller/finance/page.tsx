'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiBarChart2,
  FiDollarSign,
  FiClock,
  FiTrendingUp,
  FiDownloadCloud,
} from 'react-icons/fi';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function FinancePage() {
  const [summary, setSummary] = useState({
    totalSales: 0,
    netEarnings: 0,
    pendingPayouts: 0,
    platformFees: 0,
  });

  const [chartData, setChartData] = useState([
    { month: 'Jan', sales: 30000, payouts: 20000 },
    { month: 'Feb', sales: 40000, payouts: 25000 },
    { month: 'Mar', sales: 38000, payouts: 27000 },
    { month: 'Apr', sales: 45000, payouts: 30000 },
    { month: 'May', sales: 50000, payouts: 35000 },
  ]);

  const [transactions, setTransactions] = useState([
    { date: '2025-09-29', orderId: '#ORD1234', buyer: 'John Doe', amount: 2500, status: 'Completed', method: 'M-Pesa' },
    { date: '2025-09-25', orderId: '#ORD1231', buyer: 'Jane Smith', amount: 3400, status: 'Pending', method: 'Airtel Money' },
  ]);

  useEffect(() => {
    // Later: fetch data from /api/finance/summary and /api/finance/chart-data
  }, []);

  const colors = ['#F97316', '#FB923C', '#FED7AA'];

  return (
    <div className="md:ml-64 p-6 md:p-10 bg-gray-50 min-h-screen pt-10 pb-10">
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-2xl font-bold text-gray-800 mb-6"
      >
        Finance Overview
      </motion.h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10 ">
        <FinanceCard
          title="Total Sales"
          value={`KES ${summary.totalSales.toLocaleString() || '120,000'}`}
          icon={<FiBarChart2 size={22} />}
          gradient="from-orange-500 to-orange-600"
        />
        <FinanceCard
          title="Net Earnings"
          value={`KES ${summary.netEarnings.toLocaleString() || '98,000'}`}
          icon={<FiDollarSign size={22} />}
          gradient="from-green-500 to-emerald-600"
        />
        <FinanceCard
          title="Pending Payouts"
          value={`KES ${summary.pendingPayouts.toLocaleString() || '27,000'}`}
          icon={<FiClock size={22} />}
          gradient="from-yellow-500 to-amber-600"
        />
        <FinanceCard
          title="Platform Fees Paid"
          value={`KES ${summary.platformFees.toLocaleString() || '8,500'}`}
          icon={<FiTrendingUp size={22} />}
          gradient="from-blue-500 to-sky-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <div className="bg-white p-5 rounded-2xl shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Sales vs Payouts</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#F97316" />
              <Line type="monotone" dataKey="payouts" stroke="#10B981" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Payment Method Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'M-Pesa', value: 70 },
                  { name: 'Airtel Money', value: 25 },
                  { name: 'Other', value: 5 },
                ]}
                cx="50%"
                cy="50%"
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
                label
              >
                {colors.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white p-5 rounded-2xl shadow-md mb-10 overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Recent Transactions</h2>
          <button className="flex items-center gap-2 text-orange-600 hover:text-orange-700 transition">
            <FiDownloadCloud /> Download CSV
          </button>
        </div>

        <table className="w-full text-left border-t border-gray-100">
          <thead>
            <tr className="bg-orange-50 text-gray-700 text-sm">
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Order ID</th>
              <th className="py-3 px-4">Buyer</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Method</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn, i) => (
              <tr
                key={i}
                className="border-b border-gray-100 hover:bg-gray-50 transition"
              >
                <td className="py-3 px-4 text-sm">{txn.date}</td>
                <td className="py-3 px-4 text-sm text-orange-600 font-medium">{txn.orderId}</td>
                <td className="py-3 px-4 text-sm">{txn.buyer}</td>
                <td className="py-3 px-4 text-sm">KES {txn.amount.toLocaleString()}</td>
                <td className={`py-3 px-4 text-sm font-medium ${
                  txn.status === 'Completed' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {txn.status}
                </td>
                <td className="py-3 px-4 text-sm">{txn.method}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payout Section */}
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Request a Payout</h2>
        <p className="text-sm text-gray-500 mb-5">
          Your available balance will be sent to your preferred payment method.
        </p>

        <button className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-5 rounded-lg font-medium">
          Request Payout
        </button>
      </div>
    </div>
  );
}

/* --- Reusable Finance Card Component --- */
const FinanceCard = ({ title, value, icon, gradient }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className={`p-5 rounded-2xl shadow-md bg-gradient-to-br ${gradient} text-white flex flex-col gap-2`}
  >
    <div className="flex justify-between items-center">
      <p className="text-sm font-medium opacity-90">{title}</p>
      {icon}
    </div>
    <h3 className="text-2xl font-bold">{value}</h3>
  </motion.div>
);
