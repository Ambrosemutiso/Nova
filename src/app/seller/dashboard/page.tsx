'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { ShieldCheck, Store } from 'lucide-react';

interface Seller {
  _id: string;
  name: string;
  email: string;
  shop?: {
    isActive: boolean;
    activatedAt?: string;
    expiresAt: string;
    amountPaid?: number;
    transactionId?: string;
  };
}

interface ChartPoint {
  month: string;
  revenue: number;
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
  subtotalRevenue: number;
  chartData: ChartPoint[];
}

export default function SellerDashboard() {
  const [seller, setSeller] = useState<Seller | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawMethod, setWithdrawMethod] = useState<'mpesa' | 'airtel' | ''>('');
  const [withdrawPhone, setWithdrawPhone] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);

  const [activatingShop, setActivatingShop] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('sellerUser');
    if (!storedUser) return;

    const parsed = JSON.parse(storedUser);
    setSeller(parsed);
    fetchMetrics(parsed._id, year);
  }, [year]);

  const fetchMetrics = async (sellerId: string, selectedYear: number) => {
    setLoading(true);
    try {
      const res = await fetch('/api/seller/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerId, year: selectedYear }),
      });
      const data = await res.json();
      setMetrics(data);
    } catch (err) {
      console.error('Metrics fetch error:', err);
      toast.error('Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  const activateShop = async () => {
    if (!seller) return;
    setActivatingShop(true);

    try {
      const res = await fetch('/api/seller/shop-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerId: seller._id }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Shop activated!');
        const updated: Seller = {
          ...seller,
          shop: {
            isActive: true,
            expiresAt: data.shopExpiry,
            activatedAt: new Date().toISOString(),
            amountPaid: 1300,
            transactionId: data.transactionId || 'TEST-ID',
          },
        };
        setSeller(updated);
        localStorage.setItem('sellerUser', JSON.stringify(updated));
      } else {
        toast.error(data.error || 'Failed to activate shop');
      }
    } catch (error) {
      toast.error('Activation failed');
    } finally {
      setActivatingShop(false);
    }
  };

  const handleWithdraw = async () => {
    if (!seller) return;
    const res = await fetch('/api/seller/withdraw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sellerId: seller._id,
        amount: withdrawAmount,
        phoneNumber: withdrawPhone,
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

  const isShopActive =
    seller?.shop?.isActive &&
    seller.shop.expiresAt &&
    new Date(seller.shop.expiresAt) > new Date();

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto pt-28 pb-10">
      <h1 className="text-3xl font-bold text-orange-600 mb-4">
        Welcome, {seller?.name || 'Loading...'}
      </h1>

      {/* Shop Status */}
      <div className="mb-6 p-4 rounded-lg border bg-white shadow flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-700">
            <Store className="w-5 h-5 text-orange-500" />
            Seller Shop
          </h2>
{seller?.shop?.expiresAt ? (
  <p className="text-green-600 text-sm mt-1">
    Your shop is active until{' '}
    <strong>{new Date(seller.shop.expiresAt).toLocaleDateString()}</strong>.
  </p>
) : (
  <p className="text-red-600 text-sm mt-1">You don&apos;t have an active shop.</p>
)}
        </div>
        {!isShopActive && (
          <button
            onClick={activateShop}
            disabled={activatingShop}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded"
          >
            {activatingShop ? 'Activating...' : 'Activate Shop (Ksh 1300)'}
          </button>
        )}
      </div>

      {/* Year Selector */}
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-700 mr-2">Select Year:</label>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="border rounded px-3 py-1"
        >
          {[2023, 2024, 2025].map((yr) => (
            <option key={yr} value={yr}>
              {yr}
            </option>
          ))}
        </select>
      </div>

      {/* Metrics */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <MetricCard label="Total Orders" value={metrics?.totalOrders} color="orange" />
            <MetricCard label="Delivered Orders" value={metrics?.deliveredOrders} color="green" />
            <MetricCard label="Cancelled Orders" value={metrics?.cancelledOrders} color="red" />
            <MetricCard label="Pending Orders" value={metrics?.pendingOrders} color="yellow" />
            <MetricCard label="Paid Orders" value={metrics?.paidOrders} color="blue" />
            <MetricCard label="Active Products" value={metrics?.activeProducts} color="orange" />
            <div className="bg-white p-6 rounded-xl shadow-md text-center relative">
              {metrics?.totalFollowers && metrics.totalFollowers >= 1 && (
                <span className="absolute top-2 right-2 bg-yellow-400 text-black text-xs px-3 py-1 rounded-full shadow font-semibold flex items-center gap-1">
                  <ShieldCheck size={14} className="text-green-700" />
                  Verified Seller
                </span>
              )}
              <h3 className="text-lg font-medium text-gray-600">Followers</h3>
              <p className="text-3xl font-bold text-orange-600">
                {metrics?.totalFollowers ?? '--'}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md text-center col-span-full md:col-span-2">
              <h3 className="text-lg font-medium text-gray-600">Subtotal Revenue</h3>
              <p className="text-3xl font-bold text-orange-600">
                Ksh {metrics?.subtotalRevenue?.toLocaleString() ?? '--'}
              </p>
              <button
                onClick={() => {
                  setWithdrawAmount(metrics?.subtotalRevenue || 0);
                  setShowWithdrawModal(true);
                }}
                className="mt-3 bg-orange-500 hover:bg-orange-600 text-white text-sm py-2 px-4 rounded transition"
              >
                Withdraw Funds
              </button>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white p-6 rounded-xl shadow-md mb-8">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">
              Revenue Overview ({year})
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics?.chartData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(val) => `Ksh ${val / 1000}k`} />
                <Tooltip formatter={(val: number) => `Ksh ${val.toLocaleString()}`} />
                <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-4">
            <a href="/seller/products/add" className="action-btn bg-orange-600">
              ➕ Add Product
            </a>
            <a href="/seller/orders" className="action-btn bg-blue-600">
              📦 View Orders
            </a>
            <a href="/seller/inventory" className="action-btn bg-green-600">
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
        </>
      )}

      {/* Withdrawal Modal */}
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
              <option value="">Select Method</option>
              <option value="mpesa">M-Pesa</option>
              <option value="airtel">Airtel Money</option>
            </select>
            <button
              onClick={handleWithdraw}
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

function MetricCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number | undefined;
  color: string;
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md text-center">
      <h3 className="text-lg font-medium text-gray-600">{label}</h3>
      <p className={`text-3xl font-bold text-${color}-600`}>
        {value !== undefined ? value : '--'}
      </p>
    </div>
  );
}
