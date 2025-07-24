'use client';

import { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
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
  shop?: {
    isActive: boolean;
    activatedAt?: string;
    expiresAt?: string;
    amountPaid?: number;
    transactionId?: string;
  };
}

export default function SellerDashboard() {
  const [seller, setSeller] = useState<Seller | null>(null);
  const [activatingShop, setActivatingShop] = useState(false);
  const [metrics, setMetrics] = useState<any[]>([]);

  useEffect(() => {
    const storedSeller = localStorage.getItem('sellerUser');
    if (storedSeller) {
      setSeller(JSON.parse(storedSeller));
    }
  }, []);

  useEffect(() => {
    if (seller?.shop?.isActive && seller.shop.amountPaid === 3000) {
      fetchMetrics();
    }
  }, [seller]);

  const fetchMetrics = async () => {
    try {
      const res = await fetch(`/api/seller/metrics?sellerId=${seller?._id}`);
      const data = await res.json();
      setMetrics(data.metrics);
    } catch (error) {
      toast.error('Failed to load metrics');
    }
  };

  const activateShop = async (amount: number) => {
    if (!seller) return;
    setActivatingShop(true);

    try {
      const res = await fetch('/api/seller/shop-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerId: seller._id, amount }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Shop activated!');
        const updated: Seller = {
          ...seller,
          shop: {
            isActive: true,
            activatedAt: new Date().toISOString(),
            expiresAt: data.shopExpiry,
            amountPaid: amount,
            transactionId: data.transactionId || 'TEST-ID',
          },
        };
        setSeller(updated);
        localStorage.setItem('sellerUser', JSON.stringify(updated));
      } else {
        toast.error(data.error || 'Activation failed');
      }
    } catch (err) {
      toast.error('Activation failed');
    } finally {
      setActivatingShop(false);
    }
  };

  return (
    <div className="p-6">
      <ToastContainer />
      <h1 className="text-2xl font-semibold mb-4 flex items-center gap-2">
        <Store className="w-6 h-6" /> Welcome, {seller?.name || 'Seller'}
      </h1>

      {seller?.shop?.isActive ? (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded mb-4">
          <p>Your shop is active</p>
          <p>Expires on: <strong>{new Date(seller.shop.expiresAt!).toLocaleDateString()}</strong></p>
          <p className="mt-1">
            Subscription:{' '}
            <span className={`font-semibold ${seller.shop.amountPaid === 3000 ? 'text-purple-600' : 'text-orange-600'}`}>
              {seller.shop.amountPaid === 3000 ? 'Premium Seller' : 'Basic Seller'}
            </span>
          </p>
        </div>
      ) : (
        <div className="mb-6">
          <p className="mb-2 text-gray-700">Activate your shop to start selling:</p>
          <div className="flex gap-4">
            <button
              onClick={() => activateShop(1300)}
              disabled={activatingShop}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded"
            >
              {activatingShop ? 'Activating...' : 'Activate Basic (Ksh 1300)'}
            </button>
            <button
              onClick={() => activateShop(3000)}
              disabled={activatingShop}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
            >
              {activatingShop ? 'Activating...' : 'Activate Premium (Ksh 3000)'}
            </button>
          </div>
        </div>
      )}

      {seller?.shop?.isActive && seller.shop.amountPaid === 3000 ? (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" /> Analytics
          </h2>
          <div className="w-full h-64 bg-white shadow rounded p-4">
            {metrics.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500">No sales data available</p>
            )}
          </div>
        </div>
      ) : (
        seller?.shop?.isActive && (
          <div className="bg-yellow-100 border-l-4 border-yellow-400 p-4 rounded shadow-sm text-gray-700 mb-6">
            Upgrade to <strong>Premium (Ksh 3000)</strong> to access revenue analytics and insights.
          </div>
        )
      )}
    </div>
  );
}
