'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUsers,
  FiDollarSign,
  FiClock,
  FiTrendingUp,
  FiCopy,
  FiCheckCircle,
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
  BarChart,
  Bar,
} from 'recharts';

import { toast } from 'react-toastify';

interface Referral {
  _id?: string;
  name: string;
  plan: 'Basic' | 'Premium';
  commission: number;
  status: 'Paid' | 'Pending';
  date: string;
}

interface Summary {
  totalEarnings: number;
  pendingPayouts: number;
  referredSellers: number;
  conversionRate: number;
}

interface InsightsData {
  plans: { name: string; value: number }[];
  withdrawMethods: { name: string; value: number }[];
}

export default function AffiliatePage() {
  const [summary, setSummary] = useState<Summary>({
    totalEarnings: 0,
    pendingPayouts: 0,
    referredSellers: 0,
    conversionRate: 0,
  });

  const [chartData, setChartData] = useState<
    { month: string; earnings: number; referrals: number }[]
  >([]);
  const [insights, setInsights] = useState<InsightsData>({
    plans: [],
    withdrawMethods: [],
  });
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // Verify Modal fields
  const [name, setName] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [plan, setPlan] = useState<'Basic' | 'Premium'>('Basic');

  // Withdraw Modal fields
  const [withdrawPhone, setWithdrawPhone] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState<number | ''>('');
  const [withdrawMethod, setWithdrawMethod] = useState<'mpesa' | 'airtel' | ''>(
    ''
  );

  const referralLink = 'https://NovaXpress.com/seller/register?ref=AFF1TJ79';
  const planColors = ['#2563EB', '#60A5FA'];
  const withdrawColors = ['#10B981', '#EF4444'];

// 🔹 Fetch Affiliate Data
useEffect(() => {
  const fetchData = async () => {
    try {
      const token = localStorage.getItem('affiliateToken');
      if (!token) return;

      const [summaryRes, referralsRes] = await Promise.all([
        fetch('/api/affiliate/summary', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/affiliate/refferals', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const summaryData = await summaryRes.json();
      const referralsData = await referralsRes.json();

      // ✅ Summary
      if (summaryData.success) {
        setSummary(summaryData.data);
      }

      // ✅ Referrals Breakdown
      if (referralsData.success) {
        console.log('Affiliate Breakdown Data:', referralsData.breakdown);

        setReferrals(referralsData.data || []);
        setChartData(referralsData.chart || []);

        // 🔸 Capitalize first letter for each plan name
        const plans =
          referralsData.breakdown?.plans?.length > 0
            ? referralsData.breakdown.plans.map((p: any) => ({
                name:
                  p.name.charAt(0).toUpperCase() + p.name.slice(1).toLowerCase(),
                value: p.value,
              }))
            : [{ name: 'No Data', value: 1 }];

        // 🔸 Format withdrawal methods (MPESA / AIRTEL)
        const withdrawMethods =
          referralsData.breakdown?.withdrawMethods?.length > 0
            ? referralsData.breakdown.withdrawMethods.map((m: any) => ({
                name: m.name.toUpperCase(),
                value: m.value,
              }))
            : [{ name: 'No Data', value: 1 }];

        setInsights({ plans, withdrawMethods });
      } else {
        toast.error(referralsData.message || 'Failed to load referral data.');
      }
    } catch (error) {
      console.error('Error fetching affiliate data:', error);
      toast.error('Failed to load affiliate data.');
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);

  // 🟠 Copy referral link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied!');
  };

  // 🟢 Verify seller & award commission
  const handleVerifySubmit = async () => {
    if (!name.trim() || !transactionId.trim()) {
      toast.error('Please fill all fields.');
      return;
    }

    const token = localStorage.getItem('affiliateToken');
    if (!token) {
      toast.error('You must be logged in.');
      return;
    }

    try {
      const res = await fetch('/api/affiliate/seller-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, transactionId, plan }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(`Seller verified! KES ${data.referral.commission} awarded.`);
        setReferrals((prev) => [data.referral, ...prev]);
      } else {
        toast.error(data.message || 'Verification failed.');
      }
    } catch (error) {
      console.error('Verify error:', error);
      toast.error('Verification failed. Try again.');
    } finally {
      setShowVerifyModal(false);
      setName('');
      setTransactionId('');
    }
  };

  // 🟣 Handle Withdraw
  const handleWithdraw = async () => {
    if (!withdrawPhone || !withdrawAmount || !withdrawMethod) {
      toast.error('Please fill all withdrawal fields.');
      return;
    }

    const token = localStorage.getItem('affiliateToken');
    if (!token) {
      toast.error('You must be logged in to withdraw.');
      return;
    }

    try {
      const res = await fetch('/api/affiliate/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone: withdrawPhone,
          amount: withdrawAmount,
          method: withdrawMethod,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Withdrawal request submitted successfully!');
        setWithdrawAmount('');
        setWithdrawPhone('');
        setWithdrawMethod('');
      } else {
        toast.error(data.message || 'Withdrawal failed.');
      }
    } catch (error) {
      console.error('Withdraw error:', error);
      toast.error('Failed to submit withdrawal request.');
    } finally {
      setShowWithdrawModal(false);
    }
  };

  // Loader
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2 }}
          className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen pt-10 pb-10 relative">
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-2xl font-bold text-gray-800 mb-6"
      >
        Affiliate Dashboard
      </motion.h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        <AffiliateCard
          title="Total Earnings"
          value={`KES ${summary.totalEarnings.toLocaleString()}`}
          icon={<FiDollarSign size={22} />}
          gradient="from-blue-500 to-blue-600"
        />
        <AffiliateCard
          title="Pending Payouts"
          value={`KES ${summary.pendingPayouts.toLocaleString()}`}
          icon={<FiClock size={22} />}
          gradient="from-yellow-500 to-amber-600"
        />
        <AffiliateCard
          title="Referred Sellers"
          value={summary.referredSellers.toString()}
          icon={<FiUsers size={22} />}
          gradient="from-green-500 to-emerald-600"
        />
        <AffiliateCard
          title="Conversion Rate"
          value={`${summary.conversionRate}%`}
          icon={<FiTrendingUp size={22} />}
          gradient="from-indigo-500 to-blue-600"
        />
      </div>

      {/* Unified Affiliate Insights Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10"
      >
        {/* Earnings vs Referrals */}
        <div className="bg-white p-5 rounded-2xl shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Earnings vs Referrals
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="earnings" stroke="#2563EB" />
              <Line type="monotone" dataKey="referrals" stroke="#10B981" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Affiliate Insights */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-5 rounded-2xl shadow-md flex flex-col lg:flex-row items-center justify-around gap-6"
        >
          <PieDisplay
            title="Plan Type Breakdown"
            data={insights.plans}
            colors={planColors}
          />
          <PieDisplay
            title="Withdrawal Methods"
            data={insights.withdrawMethods}
            colors={withdrawColors}
          />
        </motion.div>
      </motion.div>

      {/* Referral Link Section */}
      <div className="bg-white p-5 rounded-2xl shadow-md mb-10 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-700">
            Your Referral Link
          </h2>
          <p className="text-gray-600 text-sm mt-1">{referralLink}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg"
          >
            <FiCopy /> Copy
          </button>
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            Withdraw
          </button>
        </div>
      </div>

      {/* Referral Table */}
      <div className="bg-white p-5 rounded-2xl shadow-md mb-10 overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700">
            Referral Commissions
          </h2>
          <button
            onClick={() => setShowVerifyModal(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
          >
            <FiCheckCircle /> Verify Seller Transaction
          </button>
        </div>

        <table className="w-full text-left border-t border-gray-100">
          <thead>
            <tr className="bg-blue-50 text-gray-700 text-sm">
              <th className="py-3 px-4">Seller</th>
              <th className="py-3 px-4">Plan</th>
              <th className="py-3 px-4">Commission</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {referrals.length > 0 ? (
              referrals.map((ref, i) => (
                <tr
                  key={ref._id || i}
                  className="border-b border-gray-100 hover:bg-gray-50 transition"
                >
                  <td className="py-3 px-4 text-sm">{ref.name}</td>
                  <td className="py-3 px-4 text-sm">{ref.plan}</td>
                  <td className="py-3 px-4 text-sm text-blue-600 font-medium">
                    KES {ref.commission}
                  </td>
                  <td
                    className={`py-3 px-4 text-sm font-medium ${
                      ref.status === 'Paid'
                        ? 'text-green-600'
                        : 'text-yellow-600'
                    }`}
                  >
                    {ref.status}
                  </td>
                  <td className="py-3 px-4 text-sm">{ref.date}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-500">
                  No referrals yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ Verify Seller Modal */}
      <AnimatePresence>
        {showVerifyModal && (
          <motion.div
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white p-6 rounded-xl w-full max-w-md relative"
            >
              <button
                onClick={() => setShowVerifyModal(false)}
                className="absolute top-2 right-4 text-gray-500 text-2xl font-bold"
              >
                ×
              </button>

              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Verify Seller Transaction
              </h2>

              <label className="block mb-2 text-sm text-gray-700">
                Shop Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border px-3 py-2 rounded mb-4"
                placeholder="Enter seller shop name"
              />

              <label className="block mb-2 text-sm text-gray-700">
                Transaction Code
              </label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="w-full border px-3 py-2 rounded mb-4"
                placeholder="Enter transaction code"
              />

              <label className="block mb-2 text-sm text-gray-700">
                Seller’s Plan
              </label>
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={() => setPlan('Basic')}
                  className={`flex-1 border px-3 py-2 rounded-lg transition ${
                    plan === 'Basic'
                      ? 'border-blue-500 bg-blue-50'
                      : 'hover:border-blue-400'
                  }`}
                >
                  Basic Plan
                </button>
                <button
                  onClick={() => setPlan('Premium')}
                  className={`flex-1 border px-3 py-2 rounded-lg transition ${
                    plan === 'Premium'
                      ? 'border-amber-500 bg-amber-50'
                      : 'hover:border-amber-400'
                  }`}
                >
                  Premium Plan
                </button>
              </div>

              <button
                onClick={handleVerifySubmit}
                disabled={!name || !transactionId}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded disabled:opacity-50"
              >
                Verify & Reward
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 💰 Withdraw Modal */}
      <AnimatePresence>
        {showWithdrawModal && (
          <motion.div
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white p-6 rounded-xl w-full max-w-md relative"
            >
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="absolute top-2 right-4 text-gray-500 text-2xl font-bold"
              >
                ×
              </button>

              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Withdraw Funds
              </h2>

              <label className="block mb-2 text-sm text-gray-700">
                Phone Number
              </label>
              <input
                type="number"
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

              <label className="block mb-2 text-sm text-gray-700">
                Withdraw Method
              </label>
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={() => setWithdrawMethod('mpesa')}
                  className={`flex-1 flex items-center gap-2 border px-3 py-2 rounded-lg transition ${
                    withdrawMethod === 'mpesa'
                      ? 'border-green-500 bg-green-50'
                      : 'hover:border-green-400'
                  }`}
                >
                  <img src="/mpesa.png" alt="M-Pesa" className="h-6" />
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
                  <img src="/airtel.png" alt="Airtel" className="h-6" />
                  <span className="font-medium text-gray-700">Airtel Money</span>
                </button>
              </div>

              <button
                onClick={handleWithdraw}
                disabled={!withdrawPhone || !withdrawAmount || !withdrawMethod}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded disabled:opacity-50"
              >
                Request Withdrawal
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 🧱 Summary Card Component
const AffiliateCard = ({
  title,
  value,
  icon,
  gradient,
}: {
  title: string;
  value: string;
  icon: JSX.Element;
  gradient: string;
}) => (
  <motion.div
    whileHover={{ y: -5 }}
    className={`bg-gradient-to-r ${gradient} text-white p-5 rounded-2xl shadow-md flex justify-between items-center`}
  >
    <div>
      <p className="text-sm opacity-80">{title}</p>
      <h3 className="text-lg font-semibold mt-1">{value}</h3>
    </div>
    <div className="text-3xl opacity-80">{icon}</div>
  </motion.div>
);
// 🟢 Pie Display Component with Percentage Tooltips
const PieDisplay = ({
  title,
  data,
  colors,
}: {
  title: string;
  data: { name: string; value: number }[];
  colors: string[];
}) => {
  // Calculate total for percentage computation
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="w-full lg:w-1/2">
      <h2 className="text-lg font-semibold text-gray-700 mb-3 text-center">
        {title}
      </h2>

      {data.length === 0 || total === 0 ? (
        <div className="flex justify-center items-center h-[250px]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
          />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={85}
              dataKey="value"
              label={({ name, value }) => {
                const percent = ((value / total) * 100).toFixed(1);
                return `${name} (${percent}%)`;
              }}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Pie>

            {/* Custom Tooltip showing name + percent */}
            <Tooltip
              formatter={(value: number, name: string) => {
                const percent = ((value / total) * 100).toFixed(1);
                return [`${value} (${percent}%)`, name];
              }}
              contentStyle={{
                backgroundColor: '#fff',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              }}
              labelStyle={{ fontWeight: 600, color: '#111827' }}
              itemStyle={{ color: '#374151' }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
