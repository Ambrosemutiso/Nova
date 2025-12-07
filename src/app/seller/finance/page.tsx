'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
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
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// ✅ Seller interface
export interface Seller {
  _id: string;
  name: string;
  email: string;
  image?: string;
  logo?: string;
  banner?: string;
  phoneNumber?: string;
  role: 'seller';
  shopName?: string;
  isVerified: boolean;
  followers: { userId: string; followedAt?: Date }[];
  shop: {
    isActive: boolean;
    activatedAt?: Date;
    expiresAt?: Date;
    amountPaid?: number;
    transactionId?: string;
    packageType?: 'free' | 'basic' | 'premium';
  };
  createdAt: Date;
}

interface Summary {
  totalSales: number;
  netEarnings: number;
  pendingPayouts: number;
  platformFees: number;
}

interface Transaction {
  date: string;
  orderId: string;
  buyer: string;
  amount: number;
  status: string;
  method: string;
}

export default function FinancePage() {
  const [summary, setSummary] = useState<Summary>({
    totalSales: 0,
    netEarnings: 0,
    pendingPayouts: 0,
    platformFees: 0,
  });

  const [chartData, setChartData] = useState<
    { month: string; sales: number; payouts: number }[]
  >([]);

  const [seller] = useState<Seller | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawMethod, setWithdrawMethod] = useState<'mpesa' | 'airtel' | ''>('');
  const [withdrawPhone, setWithdrawPhone] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
  

  // ✅ Read seller object from localStorage
  const getSellerId = (): string | null => {
    if (typeof window === 'undefined') return null;

    try {
      const sellerData = localStorage.getItem('sellerUser');
      if (sellerData) {
        const seller: Seller = JSON.parse(sellerData);
        return seller._id || null;
      }

      // fallback to old method if only sellerId was saved
      return localStorage.getItem('sellerId');
    } catch {
      return null;
    }
  };

  // ✅ Fetch metrics from unified endpoint
  useEffect(() => {
    const fetchMetrics = async () => {
      const sellerId = getSellerId();

      if (!sellerId) {
        setError('No seller ID found. Please log in again.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const res = await fetch('/api/seller/finance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sellerId }),
        });

        if (!res.ok) throw new Error('Failed to fetch seller metrics.');

        const data = await res.json();

        setSummary({
          totalSales: data.summary?.totalSales || 0,
          netEarnings: data.summary?.netEarnings || 0,
          pendingPayouts: data.summary?.pendingPayouts || 0,
          platformFees: data.summary?.platformFees || 0,
        });

        setChartData(data.chart || []);
        setTransactions(data.transactions || []);
      } catch (err: any) {
        console.error('Metrics fetch error:', err);
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  
  
    const handleWithdraw = async () => {
      if (!seller) return;
      const res = await fetch('/api/seller/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerId: seller._id,
          amount: withdrawAmount,
          phoneNumber: seller.phoneNumber,
          method: withdrawMethod,
        }),
      });
  
      const json = await res.json();
      if (json.success) {
        toast.success('Withdrawal request submitted!');
        setShowWithdrawModal(false);
      } else {
        toast.error(json.error || 'Error submitting withdrawal.');
      }
    };

  // 🔹 Generate Pie Chart Data Dynamically
const paymentSummary = transactions.reduce(
  (acc, txn) => {
    const method = txn.method || 'Other';
    acc[method] = (acc[method] || 0) + txn.amount;
    return acc;
  },
  {} as Record<string, number>
);

const totalPayment = Object.values(paymentSummary).reduce((a, b) => a + b, 0);

const pieData = Object.entries(paymentSummary).map(([name, value]) => ({
  name,
  value: totalPayment > 0 ? Math.round((value / totalPayment) * 100) : 0,
}));


  const colors = ['#F97316', '#FB923C', '#FED7AA'];

  // 🔸 Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2 }}
          className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full"
        ></motion.div>
      </div>
    );
  }

  // 🔸 Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <p className="text-red-600 font-medium text-lg mb-4">{error}</p>
        <button
          onClick={() => location.reload()}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
        >
          Retry
        </button>
      </div>
    );
  }

  // 🔸 Main Page
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
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        <FinanceCard
          title="Total Sales"
          value={`KES ${summary.totalSales.toLocaleString()}`}
          icon={<FiBarChart2 size={22} />}
          gradient="from-orange-500 to-orange-600"
        />
        <FinanceCard
          title="Net Earnings"
          value={`KES ${summary.netEarnings.toLocaleString()}`}
          icon={<FiDollarSign size={22} />}
          gradient="from-green-500 to-emerald-600"
        />
        <FinanceCard
          title="Pending Payouts"
          value={`KES ${summary.pendingPayouts.toLocaleString()}`}
          icon={<FiClock size={22} />}
          gradient="from-yellow-500 to-amber-600"
        />
        <FinanceCard
          title="Platform Fees Paid"
          value={`KES ${summary.platformFees.toLocaleString()}`}
          icon={<FiTrendingUp size={22} />}
          gradient="from-blue-500 to-sky-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <div className="bg-white p-5 rounded-2xl shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Sales vs Payouts
          </h2>
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
  <h2 className="text-lg font-semibold text-gray-700 mb-4">
    Payment Method Breakdown
  </h2>
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={pieData}
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
          <h2 className="text-lg font-semibold text-gray-700">
            Recent Transactions
          </h2>
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
            {transactions.length > 0 ? (
              transactions.map((txn, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-100 hover:bg-gray-50 transition"
                >
                  <td className="py-3 px-4 text-sm">
                    {new Date(txn.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-orange-600 font-medium">
                    #{txn.orderId?.substring(0, 5).toUpperCase()}
                    </td>
                  <td className="py-3 px-4 text-sm">{txn.buyer}</td>
                  <td className="py-3 px-4 text-sm">
                    KES {txn.amount.toLocaleString()}
                  </td>
                  <td
                    className={`py-3 px-4 text-sm font-medium ${
                      txn.status === 'Completed'
                        ? 'text-green-600'
                        : 'text-yellow-600'
                    }`}
                  >
                    {txn.status}
                  </td>
                  <td className="py-3 px-4 text-sm">{txn.method}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-500">
                  No transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      
{showWithdrawModal && (
  <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
    <div className="bg-white p-6 rounded-xl w-full max-w-md relative">
      <button
        onClick={() => setShowWithdrawModal(false)}
        className="absolute top-2 right-4 text-gray-500 text-2xl font-bold"
      >
        ×
      </button>

      <h2 className="text-xl font-semibold text-gray-800 mb-4">Withdraw Funds</h2>

      <label className="block mb-2 text-sm text-gray-700">Phone Number</label>
      <input
        type="text"
        value={withdrawPhone}
        onChange={(e) => setWithdrawPhone(e.target.value)}
        className="w-full border px-3 py-2 rounded mb-4"
        placeholder="Enter phone number"
      />

      <label className="block mb-2 text-sm text-gray-700">Amount</label>
      <input
        type="number"
        value={withdrawAmount}
        onChange={(e) => setWithdrawAmount(Number(e.target.value))}
        className="w-full border px-3 py-2 rounded mb-4"
        placeholder="Enter amount"
      />

      <label className="block mb-2 text-sm text-gray-700">Withdraw Method</label>
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => setWithdrawMethod('mpesa')}
          className={`flex-1 flex items-center gap-2 border px-3 py-2 rounded-lg transition ${
            withdrawMethod === 'mpesa'
              ? 'border-green-500 bg-green-50'
              : 'hover:border-green-400'
          }`}
        >
          <img
            src="/mpesa.png" 
            alt="M-Pesa"
            className="h-6"
          />
          <span className="font-medium text-gray-700">M-Pesa</span>
        </button>

        <button
          onClick={() => setWithdrawMethod('airtel')}
          className={`flex-1 flex items-center gap-2 border px-3 py-2 rounded-lg transition ${
            withdrawMethod === 'airtel'
              ? 'border-red-500 bg-red-50'
              : 'hover:border-red-400'
          }`}
        >
          <img
            src="/airtel.png" 
            alt="Airtel"
            className="h-6"
          />
          <span className="font-medium text-gray-700">Airtel Money</span>
        </button>
      </div>

      {/* Submit */}
      <button
        onClick={handleWithdraw}
        disabled={!withdrawMethod || !withdrawAmount || !withdrawPhone}
        className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded disabled:opacity-50"
      >
        Submit Withdrawal
      </button>
    </div>
  </div>
)}

      {/* Payout Section */}
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">
          Request a Payout
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          Your available balance will be sent to your preferred payment method.
        </p>

        <button 
        onClick={() => {
        setShowWithdrawModal(true);
        }}
        className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-5 rounded-lg font-medium">
        Request Payout
        </button>
      </div>
    </div>
  );
}

/* --- Reusable Finance Card --- */
const FinanceCard = ({
  title,
  value,
  icon,
  gradient,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  gradient: string;
}) => (
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
