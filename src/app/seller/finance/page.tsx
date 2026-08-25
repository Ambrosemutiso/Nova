'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  FiBarChart2,
  FiDollarSign,
  FiClock,
  FiTrendingDown,
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

/* ─── Design tokens ──────────────────────────────────────────────────────────
   Same system as the wallet page, so the seller finance area reads as one
   product: ink + paper + warm gray + brand orange, with red reserved
   exclusively for money leaving the seller (platform fees, errors).
   ──────────────────────────────────────────────────────────────────────────── */
const T = {
  ink:      '#111110',
  canvas:   '#FFFFFF',
  paper:    '#FFFFFF',
  line:     '#EAE6DD',
  muted:    '#8C8780',
  orange:   '#F97316',
  orangeDk: '#C2410C',
  red:      '#DC2626',
  redBg:    '#FDEEEE',
};

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

  const pieColors = [T.ink, T.orange, '#D8D3C8'];

  // 🔸 Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen" style={{ background: T.canvas }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2 }}
          className="w-10 h-10 rounded-full"
          style={{ border: `4px solid ${T.orange}`, borderTopColor: 'transparent' }}
        ></motion.div>
      </div>
    );
  }

  // 🔸 Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center" style={{ background: T.canvas }}>
        <p className="font-medium text-lg mb-4" style={{ color: T.red }}>{error}</p>
        <button
          onClick={() => location.reload()}
          className="px-4 py-2 rounded-lg text-white font-medium transition"
          style={{ background: T.orange }}
        >
          Retry
        </button>
      </div>
    );
  }

  // 🔸 Main Page
  return (
    <div className="min-h-screen" style={{ background: T.canvas }}>
      <div className="max-w-6xl mx-auto px-4 pt-28 pb-10">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <p className="text-[11px] font-semibold tracking-[0.14em] uppercase" style={{ color: T.muted }}>Finance</p>
          <h1 className="text-2xl font-bold mt-0.5" style={{ color: T.ink, fontFamily: "'Outfit', sans-serif" }}>
            Finance Overview
          </h1>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <FinanceCard
            title="Total Sales"
            value={`KES ${summary.totalSales.toLocaleString()}`}
            icon={<FiBarChart2 size={18} />}
            chipBg={T.ink}
            chipFg="#fff"
          />
          <FinanceCard
            title="Net Earnings"
            value={`KES ${summary.netEarnings.toLocaleString()}`}
            icon={<FiDollarSign size={18} />}
            chipBg={T.orange}
            chipFg="#fff"
            highlight
          />
          <FinanceCard
            title="Pending Payouts"
            value={`KES ${summary.pendingPayouts.toLocaleString()}`}
            icon={<FiClock size={18} />}
            chipBg={T.canvas}
            chipFg={T.ink}
            chipBorder
          />
          <FinanceCard
            title="Platform Fees Paid"
            value={`KES ${summary.platformFees.toLocaleString()}`}
            icon={<FiTrendingDown size={18} />}
            chipBg={T.redBg}
            chipFg={T.red}
            valueColor={T.red}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <div className="rounded-2xl p-5" style={{ background: T.paper, border: `1px solid ${T.line}` }}>
            <h2 className="text-sm font-bold mb-4" style={{ color: T.ink }}>
              Sales vs Payouts
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={T.line} />
                <XAxis dataKey="month" stroke={T.muted} tick={{ fontSize: 11, fill: T.muted }} />
                <YAxis stroke={T.muted} tick={{ fontSize: 11, fill: T.muted }} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: `1px solid ${T.line}`, fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="sales" stroke={T.orange} strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="payouts" stroke={T.ink} strokeWidth={2} dot={false} strokeDasharray="4 3" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-2xl p-5" style={{ background: T.paper, border: `1px solid ${T.line}` }}>
            <h2 className="text-sm font-bold mb-4" style={{ color: T.ink }}>
              Payment Method Breakdown
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={88}
                  dataKey="value"
                  label={{ fontSize: 11, fill: T.muted }}
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: `1px solid ${T.line}`, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="rounded-2xl p-5 mb-8 overflow-x-auto" style={{ background: T.paper, border: `1px solid ${T.line}` }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold" style={{ color: T.ink }}>
              Recent Transactions
            </h2>
            <button className="flex items-center gap-2 text-xs font-semibold transition" style={{ color: T.orange }}>
              <FiDownloadCloud size={14} /> Download CSV
            </button>
          </div>

          <table className="w-full text-left" style={{ borderTop: `1px solid ${T.line}` }}>
            <thead>
              <tr className="text-xs" style={{ background: T.canvas, color: T.muted }}>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Order ID</th>
                <th className="py-3 px-4 font-semibold">Buyer</th>
                <th className="py-3 px-4 font-semibold">Amount</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Method</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.map((txn, i) => {
                  const isCompleted = txn.status === 'Completed';
                  return (
                    <tr
                      key={i}
                      className="transition"
                      style={{ borderBottom: `1px solid ${T.line}` }}
                      onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = T.canvas; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}
                    >
                      <td className="py-3 px-4 text-sm" style={{ color: T.muted }}>
                        {new Date(txn.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold" style={{ color: T.orange }}>
                        #{txn.orderId?.substring(0, 5).toUpperCase()}
                      </td>
                      <td className="py-3 px-4 text-sm" style={{ color: T.ink }}>{txn.buyer}</td>
                      <td className="py-3 px-4 text-sm font-medium tabular-nums" style={{ color: T.ink }}>
                        KES {txn.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={
                            isCompleted
                              ? { background: `${T.orange}1A`, color: T.orangeDk }
                              : { background: T.canvas, color: T.muted }
                          }
                        >
                          {txn.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm" style={{ color: T.muted }}>{txn.method}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-sm" style={{ color: T.muted }}>
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {showWithdrawModal && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="rounded-2xl w-full max-w-md relative p-6" style={{ background: T.paper }}>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="absolute top-3 right-4 text-2xl font-bold transition"
                style={{ color: T.muted }}
              >
                ×
              </button>

              <h2 className="text-lg font-bold mb-5" style={{ color: T.ink }}>Withdraw Funds</h2>

              <label className="block mb-2 text-sm font-medium" style={{ color: T.ink }}>Phone Number</label>
              <input
                type="text"
                value={withdrawPhone}
                onChange={(e) => setWithdrawPhone(e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 mb-4 text-sm outline-none focus:ring-2"
                style={{ border: `1px solid ${T.line}`, color: T.ink, ['--tw-ring-color' as any]: `${T.orange}55` }}
                placeholder="Enter phone number"
              />

              <label className="block mb-2 text-sm font-medium" style={{ color: T.ink }}>Amount</label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                className="w-full rounded-xl px-3 py-2.5 mb-4 text-sm outline-none focus:ring-2"
                style={{ border: `1px solid ${T.line}`, color: T.ink, ['--tw-ring-color' as any]: `${T.orange}55` }}
                placeholder="Enter amount"
              />

              <label className="block mb-2 text-sm font-medium" style={{ color: T.ink }}>Withdraw Method</label>
              <div className="flex items-center gap-3 mb-5">
                <button
                  onClick={() => setWithdrawMethod('mpesa')}
                  className="flex-1 flex items-center gap-2 rounded-xl px-3 py-2.5 transition"
                  style={
                    withdrawMethod === 'mpesa'
                      ? { border: `1px solid ${T.orange}`, background: `${T.orange}0F` }
                      : { border: `1px solid ${T.line}` }
                  }
                >
                  <img src="/mpesa.png" alt="M-Pesa" className="h-5" />
                  <span className="font-medium text-sm" style={{ color: T.ink }}>M-Pesa</span>
                </button>

                <button
                  onClick={() => setWithdrawMethod('airtel')}
                  className="flex-1 flex items-center gap-2 rounded-xl px-3 py-2.5 transition"
                  style={
                    withdrawMethod === 'airtel'
                      ? { border: `1px solid ${T.orange}`, background: `${T.orange}0F` }
                      : { border: `1px solid ${T.line}` }
                  }
                >
                  <img src="/airtel.png" alt="Airtel" className="h-5" />
                  <span className="font-medium text-sm" style={{ color: T.ink }}>Airtel Money</span>
                </button>
              </div>

              <button
                onClick={handleWithdraw}
                disabled={!withdrawMethod || !withdrawAmount || !withdrawPhone}
                className="w-full text-white py-2.5 rounded-xl font-medium transition disabled:opacity-50"
                style={{ background: T.orange }}
              >
                Submit Withdrawal
              </button>
            </div>
          </div>
        )}

        {/* Payout Section */}
        <div className="rounded-2xl p-6" style={{ background: T.paper, border: `1px solid ${T.line}` }}>
          <h2 className="text-sm font-bold mb-2" style={{ color: T.ink }}>
            Request a Payout
          </h2>
          <p className="text-sm mb-5" style={{ color: T.muted }}>
            Your available balance will be sent to your preferred payment method.
          </p>

          <button
            onClick={() => setShowWithdrawModal(true)}
            className="text-white py-2.5 px-5 rounded-xl font-medium transition"
            style={{ background: T.orange }}
          >
            Request Payout
          </button>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800&display=swap');
      `}</style>
    </div>
  );
}

/* --- Reusable Finance Card --- */
const FinanceCard = ({
  title,
  value,
  icon,
  chipBg,
  chipFg,
  chipBorder,
  valueColor,
  highlight,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  chipBg: string;
  chipFg: string;
  chipBorder?: boolean;
  valueColor?: string;
  highlight?: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="p-4 rounded-2xl flex flex-col gap-2.5"
    style={{
      background: T.paper,
      border: highlight ? `1px solid ${T.orange}` : `1px solid ${T.line}`,
      boxShadow: highlight ? `0 10px 24px -14px ${T.orange}99` : 'none',
    }}
  >
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center"
      style={{ background: chipBg, color: chipFg, border: chipBorder ? `1px solid ${T.line}` : 'none' }}
    >
      {icon}
    </div>
    <p className="text-xs" style={{ color: T.muted }}>{title}</p>
    <h3 className="text-xl font-bold tabular-nums" style={{ color: valueColor || T.ink, fontFamily: "'Outfit', sans-serif" }}>
      {value}
    </h3>
  </motion.div>
);