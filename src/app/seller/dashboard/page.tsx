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
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { ShieldCheck, Store, CheckCircle, XCircle , Crown, Gem } from 'lucide-react';
import { Edit2 } from 'react-feather';
import SystemStatus from '@/components/SystemStatus';
import { MetricCard } from '@/components/MetricCards';

const COLORS = ['#f97316', '#16a34a', '#dc2626', '#eab308', '#3b82f6'];

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
  followers: {
    userId: string;
    followedAt?: Date;
  }[];
  shop: {
    isActive: boolean;
    activatedAt?: Date;
    expiresAt?: Date;
    amountPaid?: number;
    transactionId?: string;
    plan?: 'free' | 'basic' | 'premium';
  };
  createdAt: Date;
}

interface ChartPoint {
  month: string;
  revenue: number;
  activeProducts: number;
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [editShopName, setEditShopName] = useState(seller?.name || '');
  const [editImage, setEditImage] = useState(seller?.image || '');
  const [editBanner, setEditBanner] = useState(seller?.banner || '');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"basic" | "premium" | null>(null);
  const [paymentPhone, setPaymentPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "airtel" | "">("");


  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

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

const openPaymentModal = (plan: "basic" | "premium") => {
  setSelectedPlan(plan);
  setPaymentMethod("");
  setPaymentPhone("");
  setShowPaymentModal(true);
};

const handleConfirmPayment = async () => {
  if (!selectedPlan || !paymentMethod || !paymentPhone) {
    toast.error("Please fill all details");
    return;
  }

  try {
    setActivatingShop(true);

    let amount = selectedPlan === "basic" ? 1300 : 3000;
    if (selectedPlan === "premium" && seller?.shop?.plan === "basic") {
      const alreadyPaid = seller.shop?.amountPaid || 0;
      amount = 3000 - alreadyPaid;
    }

    const res = await fetch("/api/seller/payment/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sellerId: seller?._id,
        plan: selectedPlan,
        method: paymentMethod,
        phone: paymentPhone,
        amount,
      }),
    });

    const data = await res.json();
    if (data.success) {
      toast.success("Payment request sent! Please complete on your phone.");
      setShowPaymentModal(false);
    } else {
      toast.error(data.error || "Payment initiation failed");
    }
  } catch (err) {
    console.error(err);
    toast.error("Error initiating payment");
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

  const isShopActive =
    seller?.shop?.isActive &&
    seller.shop.expiresAt &&
    new Date(seller.shop.expiresAt) > new Date();

  return (
    <div className="md:ml-64 p-4 md:p-6 max-w-6xl mx-auto pt-28 pb-10">
      <h1 className="text-3xl font-bold text-orange-600 mb-4">
        Welcome, {seller?.name || 'Loading...'}
      </h1>
      <SystemStatus/>

      <div className="mb-6 p-4 rounded-lg border bg-white shadow flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-700">
            <Store className="w-5 h-5 text-orange-500" /> Seller Shop
          </h2>

          {isShopActive ? (
            <p className="text-green-600 text-sm mt-1">
              Your shop is active until{' '}
              <strong>{new Date(seller!.shop.expiresAt!).toLocaleDateString()}</strong>{' '}
              (
              <span className="font-bold">
                {seller?.shop?.plan?.toUpperCase() || 'Unspecified'}
              </span>{' '}
              Package)
            </p>
          ) : (
            <p className="text-red-600 text-sm mt-1">
              You don&apos;t have an active shop.
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">

{seller?.shop?.plan === 'premium' && isShopActive ? (
  <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white font-semibold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
    <Crown size={16} className="text-white" />
    Premium
  </span>
) : seller?.shop?.plan === 'basic' && isShopActive ? (
  <>
    <span className="bg-blue-100 text-blue-700 font-medium px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
      <Gem size={16} className="text-blue-600" />
      Basic
    </span>
    <button
      onClick={() => setShowUpgradeModal(true)}
      className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded"
    >
      Upgrade Shop
    </button>
  </>
) : (
  <button
    onClick={() => setShowUpgradeModal(true)}
    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded"
  >
    Activate Shop
  </button>
)}

{(seller?.shop?.plan === 'basic' || seller?.shop?.plan === 'premium') && (
  <button
    onClick={() => {
      setEditShopName(seller?.shopName || '');
      setEditImage(seller?.image || '');
      setEditBanner(seller?.banner || '');
      setShowEditModal(true);
    }}
    className="text-sm text-orange-600 hover:underline flex items-center gap-1"
  >
    <Edit2 size={16} /> Edit Shop
  </button>
)}
  </div>
</div>

{showUpgradeModal && (
  <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center px-4">
    <div className="bg-white p-6 rounded-2xl w-full max-w-3xl relative shadow-xl">
      <button
        onClick={() => setShowUpgradeModal(false)}
        className="absolute top-2 right-4 text-gray-500 text-2xl font-bold"
      >
        ×
      </button>

      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Upgrade Your Shop Plan
      </h2>

      {/* Status Dots */}
      <div className="flex justify-center gap-6 mb-6">
        <div
          className={`h-4 w-4 rounded-full ${
            seller?.shop?.plan === "free"
              ? "bg-gray-500 animate-ping"
              : "bg-gray-300"
          }`}
        />
        <div
          className={`h-4 w-4 rounded-full ${
            seller?.shop?.plan === "basic"
              ? "bg-orange-500 animate-ping"
              : "bg-orange-300"
          }`}
        />
        <div
          className={`h-4 w-4 rounded-full ${
            seller?.shop?.plan === "premium"
              ? "bg-yellow-500 animate-ping"
              : "bg-yellow-300"
          }`}
        />
      </div>

      {/* Plans with Horizontal Scroll on Mobile */}
      <div className="flex md:grid md:grid-cols-3 gap-6 overflow-x-auto snap-x snap-mandatory px-2 pb-2 scrollbar-hide">
        {/* Free Plan */}
        <div className="min-w-[85%] md:min-w-0 snap-center border rounded-xl p-6 bg-gray-50 hover:shadow-md transition relative">
          {seller?.shop?.plan === "free" && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-400 text-white px-3 py-1 rounded-full text-xs font-bold shadow">
              Current Plan
            </span>
          )}
          <h3 className="text-xl font-semibold text-gray-700">Free Plan</h3>
          <p className="text-gray-600 mb-2">Ksh 0 / year</p>
          <ul className="space-y-2 text-sm text-gray-700 mb-4">
            <li className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-500" /> Add up to 5 Products
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-500" /> Receive max 5 Orders
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-500" /> Limited Analytics
            </li>
            <li className="flex items-center gap-2">
              <XCircle size={16} className="text-red-500" /> No Product Ads Boost
            </li>
            <li className="flex items-center gap-2">
              <XCircle size={16} className="text-red-500" /> No Front Shop
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-500" /> Withdrawals capped at Ksh 1000
            </li>
          </ul>
          <button
            disabled
            className="w-full bg-gray-400 text-white py-2 rounded cursor-not-allowed"
          >
            Free
          </button>
        </div>

        {/* Basic Plan */}
        <div className="min-w-[85%] md:min-w-0 snap-center border rounded-xl p-6 hover:shadow-md transition relative">
          {seller?.shop?.plan === "basic" && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow">
              Current Plan
            </span>
          )}
          <h3 className="text-xl font-semibold text-orange-600">Basic Plan</h3>
          <p className="text-gray-600 mb-2">Ksh 1300 / year</p>
          <ul className="space-y-2 text-sm text-gray-700 mb-4">
            <li className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-500" /> Add up to 100 Products
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-500" /> Receive up to 100 Orders
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-500" /> Standard Visibility
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-500" /> Access to Orders
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-500" /> Shop Visibility
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-500" /> Product Ads Boost
            </li>
          </ul>
          <button
            onClick={() => openPaymentModal("basic")}
            disabled={activatingShop}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded"
          >
            {activatingShop ? "Processing..." : "Choose Basic"}
          </button>
        </div>

        {/* Premium Plan */}
        <div className="min-w-[85%] md:min-w-0 snap-center border-2 border-yellow-400 rounded-xl p-6 bg-yellow-50 hover:shadow-lg transition relative">
          {seller?.shop?.plan === "premium" && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-white px-3 py-1 rounded-full text-xs font-bold shadow">
              Current Plan
            </span>
          )}
          <span className="absolute -top-3 left-1/4 bg-yellow-400 text-white px-3 py-1 rounded-full text-xs font-bold shadow">
            Recommended
          </span>
          <h3 className="text-xl font-semibold text-blue-600">Premium Plan</h3>
          <p className="text-gray-600 mb-2">
            {seller?.shop?.plan === "basic"
              ? "Top-up Ksh 1700 to upgrade"
              : "Ksh 3000 / year"}
          </p>
          <ul className="space-y-2 text-sm text-gray-700 mb-4">
            <li className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-500" /> All Basic Features
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-500" /> Premium Badge
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-500" /> Higher Visibility
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-500" /> Unlimited Withdrawals
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-500" /> Unlimited Orders
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-500" /> Unlimited Products
            </li>
          </ul>
          <button
            onClick={() => openPaymentModal("premium")}
            disabled={activatingShop}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
          >
            {activatingShop ? "Processing..." : "Choose Premium"}
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{showPaymentModal && (
  <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
    <div className="bg-white p-6 rounded-xl w-full max-w-md relative">
      <button
        onClick={() => setShowPaymentModal(false)}
        className="absolute top-2 right-4 text-gray-500 text-2xl font-bold"
      >
        ×
      </button>

      <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
        {selectedPlan === "basic" ? "Basic Plan" : "Premium Plan"}
      </h2>

      <p className="text-center text-lg font-semibold text-orange-600 mb-4">
        Amount: {selectedPlan === "basic" ? "Ksh 1300" : "Ksh 3000"}
      </p>

      <label className="block mb-2 text-sm text-orange-600">Phone Number</label>
      <input
        type="text"
        value={paymentPhone}
        onChange={(e) => setPaymentPhone(e.target.value)}
        className="w-full border px-3 py-2 rounded mb-4"
        placeholder="Enter Mpesa/Airtel number"
      />

      <label className="block mb-2 text-sm text-orange-600">Payment Method</label>
      <div className="flex items-center gap-4 mb-4">

        <button
          onClick={() => setPaymentMethod("mpesa")}
          className={`flex-1 flex items-center gap-2 border px-3 py-2 rounded-lg transition ${
            paymentMethod === "mpesa"
              ? "border-green-500 bg-green-50"
              : "hover:border-green-400"
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
          onClick={() => setPaymentMethod("airtel")}
          className={`flex-1 flex items-center gap-2 border px-3 py-2 rounded-lg transition ${
            paymentMethod === "airtel"
              ? "border-red-500 bg-red-50"
              : "hover:border-red-400"
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

      <button
        onClick={handleConfirmPayment}
        disabled={activatingShop}
        className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded"
      >
        {activatingShop ? "Processing..." : "Confirm & Pay"}
      </button>
    </div>
  </div>
)}

      <div className="mb-4">
        <label className="text-sm font-medium text-gray-700 mr-2">Select Year:</label>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="border rounded px-3 py-1"
        >
          {[2020, 2021, 2022, 2023, 2024, 2025, 2026].map((yr) => (
            <option key={yr} value={yr}>
              {yr}
            </option>
          ))}
        </select>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            Revenue Overview ({year})
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics?.chartData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={3} name="Revenue" />
              <Line type="monotone" dataKey="activeProducts" stroke="#3b82f6" strokeWidth={3} name="Active Products" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            Active Products per Month
            </h2>
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={metrics?.chartData || []}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="activeProducts" fill="#3b82f6" name="Active Products" />
    </BarChart>
  </ResponsiveContainer>
</div>

<div className="bg-white p-6 rounded-xl shadow-md">
  <h2 className="text-lg font-semibold mb-4 text-gray-700">
    Active Products Distribution ({year})
  </h2>
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={(metrics?.chartData || []).map(item => ({
          name: item.month,
          value: item.activeProducts,
        }))}
        dataKey="value"
        cx="50%"
        cy="50%"
        outerRadius={100}
        label
      >
        {(metrics?.chartData || []).map((_, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  </ResponsiveContainer>
</div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            Order Status
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[{
              name: 'Orders',
              Delivered: metrics?.deliveredOrders || 0,
              Cancelled: metrics?.cancelledOrders || 0,
              Pending: metrics?.pendingOrders || 0,
              Paid: metrics?.paidOrders || 0,
            }]}> 
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Delivered" fill="#16a34a" />
              <Bar dataKey="Cancelled" fill="#dc2626" />
              <Bar dataKey="Pending" fill="#eab308" />
              <Bar dataKey="Paid" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            Orders Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                dataKey="value"
                data={[
                  { name: 'Delivered', value: metrics?.deliveredOrders || 0 },
                  { name: 'Cancelled', value: metrics?.cancelledOrders || 0 },
                  { name: 'Pending', value: metrics?.pendingOrders || 0 },
                  { name: 'Paid', value: metrics?.paidOrders || 0 }
                ]}
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
        </>
      )}

    {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-xl w-full max-w-md relative">
        <button onClick={() => setShowEditModal(false)} className="absolute top-2 right-4 text-gray-500 text-2xl font-bold">×</button>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Edit Shop Info</h2>
      <label className="block mb-1 text-sm font-medium text-gray-600">Shop Name</label>
      <input
        type="text"
        value={editShopName}
        onChange={(e) => setEditShopName(e.target.value)}
        className="w-full border px-3 py-2 rounded mb-4"
      />
      <label className="block mb-1 text-sm font-medium text-gray-600">Profile Image URL</label>
      <input
        type="text"
        value={editImage}
        onChange={(e) => setEditImage(e.target.value)}
        className="w-full border px-3 py-2 rounded mb-4"
      />
      <label className="block mb-1 text-sm font-medium text-gray-600">Banner Image URL</label>
      <input
        type="text"
        value={editBanner}
        onChange={(e) => setEditBanner(e.target.value)}
        className="w-full border px-3 py-2 rounded mb-4"
      />

      <button
        onClick={() => {
          const updated = {
            ...seller,
            shopName: editShopName,
            image: editImage,
            bannerImage: editBanner,
          };
          setSeller(updated as Seller);
          localStorage.setItem('sellerUser', JSON.stringify(updated));
          setShowEditModal(false);
          toast.success('Shop info updated locally!');
        }}
        className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded"
        >
        Save Changes
      </button>
    </div>
  </div>
)}

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
    </div>
  );
}