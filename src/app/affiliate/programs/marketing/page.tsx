'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUsers,
  FiDollarSign,
  FiClock,
  FiTrendingUp,
  FiCopy,
  FiShare2,
  FiDownloadCloud,
  FiCheckCircle,
  FiX,
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
import { toast } from 'react-toastify';

interface Referral {
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

  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // Verification Modal fields
  const [shopName, setShopName] = useState('');
  const [transactionCode, setTransactionCode] = useState('');
  const [plan, setPlan] = useState<'Basic' | 'Premium'>('Basic');

  // Withdraw Modal fields
  const [withdrawPhone, setWithdrawPhone] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState<number | ''>('');
  const [withdrawMethod, setWithdrawMethod] = useState<'mpesa' | 'airtel' | ''>('');

  useEffect(() => {
    // Simulated fetch
    setTimeout(() => {
      setSummary({
        totalEarnings: 14300,
        pendingPayouts: 2700,
        referredSellers: 34,
        conversionRate: 58,
      });

      setChartData([
        { month: 'July', earnings: 2500, referrals: 8 },
        { month: 'Aug', earnings: 4000, referrals: 12 },
        { month: 'Sept', earnings: 5200, referrals: 9 },
        { month: 'Oct', earnings: 4600, referrals: 5 },
      ]);

      setReferrals([
        { name: 'John Mwangi', plan: 'Premium', commission: 500, status: 'Paid', date: '02 Oct 2025' },
        { name: 'Mary Otieno', plan: 'Basic', commission: 300, status: 'Pending', date: '03 Oct 2025' },
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  const colors = ['#2563EB', '#60A5FA'];
  const referralLink = 'https://yourplatform.com/register?ref=AFF12345';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied!');
  };

  // 🔹 Verify Seller Transaction
  const handleVerifySubmit = () => {
    if (!shopName || !transactionCode) {
      toast.error('Please fill all fields.');
      return;
    }

    toast.success('Transaction verified successfully! Commission added.');
    setReferrals([
      ...referrals,
      {
        name: shopName,
        plan,
        commission: plan === 'Basic' ? 300 : 500,
        status: 'Pending',
        date: new Date().toLocaleDateString(),
      },
    ]);

    setShowVerifyModal(false);
    setShopName('');
    setTransactionCode('');
  };

  // 🔹 Handle Withdraw Request
  const handleWithdraw = () => {
    if (!withdrawPhone || !withdrawAmount || !withdrawMethod) {
      toast.error('Please fill all withdrawal fields.');
      return;
    }

    toast.success('Withdrawal request submitted successfully!');
    setShowWithdrawModal(false);
    setWithdrawPhone('');
    setWithdrawAmount('');
    setWithdrawMethod('');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2 }}
          className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"
        ></motion.div>
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
        <AffiliateCard title="Total Earnings" value={`KES ${summary.totalEarnings.toLocaleString()}`} icon={<FiDollarSign size={22} />} gradient="from-blue-500 to-blue-600" />
        <AffiliateCard title="Pending Payouts" value={`KES ${summary.pendingPayouts.toLocaleString()}`} icon={<FiClock size={22} />} gradient="from-yellow-500 to-amber-600" />
        <AffiliateCard title="Referred Sellers" value={summary.referredSellers.toString()} icon={<FiUsers size={22} />} gradient="from-green-500 to-emerald-600" />
        <AffiliateCard title="Conversion Rate" value={`${summary.conversionRate}%`} icon={<FiTrendingUp size={22} />} gradient="from-indigo-500 to-blue-600" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <div className="bg-white p-5 rounded-2xl shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Earnings vs Referrals</h2>
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

        <div className="bg-white p-5 rounded-2xl shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Plan Type Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={[{ name: 'Basic Plan', value: 65 }, { name: 'Premium Plan', value: 35 }]} cx="50%" cy="50%" outerRadius={90} fill="#8884d8" dataKey="value" label>
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

      {/* Referral Link */}
      <div className="bg-white p-5 rounded-2xl shadow-md mb-10 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-700">Your Referral Link</h2>
          <p className="text-gray-600 text-sm mt-1">{referralLink}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleCopyLink} className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg">
            <FiCopy /> Copy
          </button>
          <button className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg">
            <FiShare2 /> Share
          </button>
        </div>
      </div>

      {/* Referral Table + Verify Button */}
      <div className="bg-white p-5 rounded-2xl shadow-md mb-10 overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Referral Commissions</h2>
          <div className="flex items-center gap-4">
            <button onClick={() => setShowVerifyModal(true)} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2">
              <FiCheckCircle /> Verify Seller Transaction
            </button>
            <button className="flex items-center gap-2 text-orange-600 hover:text-orange-700 transition">
              <FiDownloadCloud /> Export CSV
            </button>
          </div>
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
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="py-3 px-4 text-sm">{ref.name}</td>
                  <td className="py-3 px-4 text-sm">{ref.plan}</td>
                  <td className="py-3 px-4 text-sm text-blue-600 font-medium">KES {ref.commission}</td>
                  <td className={`py-3 px-4 text-sm font-medium ${ref.status === 'Paid' ? 'text-green-600' : 'text-yellow-600'}`}>{ref.status}</td>
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

      {/* Payout Section */}
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Request a Payout</h2>
        <p className="text-sm text-gray-500 mb-5">Your commissions will be sent to your preferred payment method.</p>
        <button onClick={() => setShowWithdrawModal(true)} className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-5 rounded-lg font-medium">
          Request Payout
        </button>
      </div>

      {/* --- Verify Modal --- */}
      <AnimatePresence>
        {showVerifyModal && (
          <motion.div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} className="bg-white rounded-2xl shadow-lg p-6 w-[90%] max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Verify Seller Transaction</h2>
                <button onClick={() => setShowVerifyModal(false)}>
                  <FiX className="text-gray-500 hover:text-gray-700" size={20} />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <input type="text" placeholder="Shop Name" value={shopName} onChange={(e) => setShopName(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />

                <input type="text" placeholder="Transaction Code" value={transactionCode} onChange={(e) => setTransactionCode(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />

                <select value={plan} onChange={(e) => setPlan(e.target.value as 'Basic' | 'Premium')} className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="Basic">Basic - Earn KES 300</option>
                  <option value="Premium">Premium - Earn KES 500</option>
                </select>

                <button onClick={handleVerifySubmit} className="bg-orange-600 hover:bg-orange-700 text-white w-full py-2 rounded-lg font-medium mt-2">
                  Verify & Submit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Withdraw Modal --- */}
      <AnimatePresence>
        {showWithdrawModal && (
          <motion.div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} className="bg-white p-6 rounded-xl w-full max-w-md relative">
              <button onClick={() => setShowWithdrawModal(false)} className="absolute top-2 right-4 text-gray-500 text-2xl font-bold">
                ×
              </button>

              <h2 className="text-xl font-semibold text-gray-800 mb-4">Withdraw Funds</h2>

              <label className="block mb-2 text-sm text-gray-700">Phone Number</label>
              <input type="text" value={withdrawPhone} onChange={(e) => setWithdrawPhone(e.target.value)} className="w-full border px-3 py-2 rounded mb-4" placeholder="Enter phone number" />

              <label className="block mb-2 text-sm text-gray-700">Amount</label>
              <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(Number(e.target.value))} className="w-full border px-3 py-2 rounded mb-4" placeholder="Enter amount" />

              <label className="block mb-2 text-sm text-gray-700">Withdraw Method</label>
              <div className="flex items-center gap-4 mb-4">
                <button onClick={() => setWithdrawMethod('mpesa')} className={`flex-1 flex items-center gap-2 border px-3 py-2 rounded-lg transition ${withdrawMethod === 'mpesa' ? 'border-green-500 bg-green-50' : 'hover:border-green-400'}`}>
                  <img src="/mpesa.png" alt="M-Pesa" className="h-6" />
                  <span className="font-medium text-gray-700">M-Pesa</span>
                </button>

                <button onClick={() => setWithdrawMethod('airtel')} className={`flex-1 flex items-center gap-2 border px-3 py-2 rounded-lg transition ${withdrawMethod === 'airtel' ? 'border-red-500 bg-red-50' : 'hover:border-red-400'}`}>
                  <img src="/airtel.png" alt="Airtel" className="h-6" />
                  <span className="font-medium text-gray-700">Airtel Money</span>
                </button>
              </div>

              <button onClick={handleWithdraw} disabled={!withdrawMethod || !withdrawAmount || !withdrawPhone} className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded disabled:opacity-50">
                Submit Withdrawal
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* --- Reusable Card --- */
const AffiliateCard = ({
  title,
  value,
  icon,
  gradient,
}: {
  title: string;
  value: string | number;
  icon: JSX.Element;
  gradient: string;
}) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className={`p-5 rounded-2xl shadow-md bg-gradient-to-br ${gradient} text-white flex flex-col gap-2`}>
    <div className="flex justify-between items-center">
      <p className="text-sm font-medium opacity-90">{title}</p>
      {icon}
    </div>
    <h3 className="text-2xl font-bold">{value}</h3>
  </motion.div>
);
