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
import { ShieldCheck, Store } from 'lucide-react';
import { Edit2 } from 'react-feather';

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
    packageType?: 'basic' | 'premium';
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

  /**
   * Upgrade / Activate shop logic
   * - If seller is Basic and selects Premium, top-up (3000 - 1300)
   */
  const upgradeShop = async (packageType: 'basic' | 'premium') => {
    if (!seller) return;
    setActivatingShop(true);

    try {
      let amount = packageType === 'basic' ? 1300 : 3000;

      // If upgrading from Basic → Premium, only pay the difference
      if (packageType === 'premium' && seller.shop?.packageType === 'basic') {
        const alreadyPaid = seller.shop.amountPaid || 0;
        amount = 3000 - alreadyPaid;
      }

      const res = await fetch('/api/seller/shop-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerId: seller._id, packageType, amount }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Shop upgraded to ${packageType} package!`);
        const updated: Seller = {
          ...seller,
          shop: {
            isActive: true,
            expiresAt: data.shopExpiry,
            activatedAt: new Date(),
            amountPaid: seller.shop?.amountPaid
              ? seller.shop.amountPaid + amount
              : amount,
            transactionId: data.transactionId || 'TEST-ID',
            packageType,
          },
        };
        setSeller(updated);
        localStorage.setItem('sellerUser', JSON.stringify(updated));
        setShowUpgradeModal(false);
      } else {
        toast.error(data.error || 'Failed to upgrade shop');
      }
    } catch (error) {
      toast.error('Upgrade failed');
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
    <div className="p-4 md:p-6 max-w-6xl mx-auto pt-28 pb-10">
      <h1 className="text-3xl font-bold text-orange-600 mb-4">
        Welcome, {seller?.name || 'Loading...'}
      </h1>

      {/* Shop Info Section */}
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
                {seller?.shop?.packageType?.toUpperCase() || 'Unspecified'}
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
          {/* Badge + Upgrade button logic */}
          {seller?.shop?.packageType === 'premium' && isShopActive ? (
            <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white font-semibold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
              🌟 Premium Seller
            </span>
          ) : seller?.shop?.packageType === 'basic' && isShopActive ? (
            <>
              <span className="bg-blue-100 text-blue-700 font-medium px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                🛍️ Basic Seller
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
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-md relative">
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-2 right-4 text-gray-500 text-2xl font-bold"
            >
              ×
            </button>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Upgrade Shop
            </h2>

            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold text-orange-600">
                  Basic Package
                </h3>
                <p className="text-gray-600 text-sm">Ksh 1300 / year</p>
                <button
                  onClick={() => upgradeShop('basic')}
                  disabled={activatingShop}
                  className="mt-2 w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded"
                >
                  {activatingShop ? 'Processing...' : 'Choose Basic'}
                </button>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-600">
                  Premium Package
                </h3>
                <p className="text-gray-600 text-sm">
                  {seller?.shop?.packageType === 'basic'
                    ? 'Top-up Ksh 1700 to upgrade'
                    : 'Ksh 3000 / year'}
                </p>
                <button
                  onClick={() => upgradeShop('premium')}
                  disabled={activatingShop}
                  className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
                >
                  {activatingShop ? 'Processing...' : 'Choose Premium'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Year Selector */}
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

      {/* Spinner or Metrics */}
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
        {/* Line Chart */}
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

        {/* Pie Chart */}
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

      {/* Withdraw Modal */}
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

