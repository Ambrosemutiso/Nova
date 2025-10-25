'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { toast } from 'react-toastify';
import { FaGift, FaCrown, FaTags, FaShoppingBag } from 'react-icons/fa';

interface Voucher {
  _id: string;
  code: string;
  discount: number;
  expiry: string;
  status: string;
}

export default function MyVouchersPage() {
  const [data, setData] = useState<{
    ordersCount: number;
    percentage: number;
    isTopCustomer: boolean;
    vouchers: Voucher[];
  } | null>(null);

  // 🌈 Mouse tracking for subtle parallax icons
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX / innerWidth - 0.5) * 2;
    const y = (e.clientY / innerHeight - 0.5) * 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  const giftX = useTransform(mouseX, (v) => v * 20);
  const giftY = useTransform(mouseY, (v) => v * 20);
  const tagsX = useTransform(mouseX, (v) => v * -25);
  const tagsY = useTransform(mouseY, (v) => v * 25);
  const bagX = useTransform(mouseX, (v) => v * 15);
  const bagY = useTransform(mouseY, (v) => v * -15);
  const crownX = useTransform(mouseX, (v) => v * -20);
  const crownY = useTransform(mouseY, (v) => v * -20);

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        toast.error('You must be logged in to view vouchers');
        return;
      }

      const res = await fetch(`/api/user/vouchers?userId=${userId}`);
      if (!res.ok) throw new Error('Failed to fetch vouchers');
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load vouchers');
    }
  };

  if (!data)
    return (
      <div className="flex justify-center items-center min-h-[70vh] text-gray-500">
        Loading your vouchers...
      </div>
    );

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-100 overflow-hidden pt-28 pb-20"
    >
      {/* ✨ Animated Gradient Backgrounds */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4, y: [0, 20, 0] }}
        transition={{ repeat: Infinity, duration: 8 }}
        className="absolute -top-24 left-0 w-full h-64 bg-gradient-to-r from-orange-200 to-orange-400 rounded-full blur-3xl opacity-40"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4, y: [0, -20, 0] }}
        transition={{ repeat: Infinity, duration: 10 }}
        className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-l from-orange-300 to-orange-100 rounded-full blur-3xl opacity-30"
      />

      {/* 🎈 Floating Parallax Icons */}
      <motion.div
        style={{ x: giftX, y: giftY }}
        animate={{ y: [0, -15, 0] }}
        transition={{ repeat: Infinity, duration: 5 }}
        className="absolute top-36 left-10 text-orange-400 opacity-30 text-6xl"
      >
        <FaGift />
      </motion.div>
      <motion.div
        style={{ x: tagsX, y: tagsY }}
        animate={{ y: [0, 20, 0] }}
        transition={{ repeat: Infinity, duration: 6 }}
        className="absolute top-60 right-12 text-orange-300 opacity-40 text-6xl"
      >
        <FaTags />
      </motion.div>
      <motion.div
        style={{ x: bagX, y: bagY }}
        animate={{ y: [0, -20, 0] }}
        transition={{ repeat: Infinity, duration: 7 }}
        className="absolute bottom-28 left-20 text-orange-300 opacity-40 text-6xl"
      >
        <FaShoppingBag />
      </motion.div>
      <motion.div
        style={{ x: crownX, y: crownY }}
        animate={{ y: [0, 15, 0] }}
        transition={{ repeat: Infinity, duration: 6 }}
        className="absolute bottom-40 right-24 text-orange-300 opacity-40 text-6xl"
      >
        <FaCrown />
      </motion.div>

      {/* 🧭 Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12 relative z-10"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-orange-600 mb-4">
          🎁 My Vouchers
        </h1>
        <p className="text-gray-700 text-lg max-w-2xl mx-auto">
          Your loyalty deserves rewards. Explore your earned discounts and keep
          shopping to unlock more!
        </p>
      </motion.div>

      {/* 💳 Main Content */}
      <div className="max-w-5xl mx-auto px-6 space-y-8 relative z-10">
        {/* Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-orange-100"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            🛒 Your Shopping Progress
          </h2>
          <p className="text-sm text-gray-600 mb-2">
            You’ve made{' '}
            <span className="font-semibold">{data.ordersCount}</span> orders so
            far.
          </p>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${data.percentage}%` }}
              className="bg-gradient-to-r from-orange-500 to-yellow-500 h-3 rounded-full"
            />
          </div>
          <p className="text-sm mt-2 text-yellow-700 font-medium">
            {data.percentage}% of all customer orders completed
          </p>
        </motion.div>

        {/* Top Customer Banner */}
        {data.isTopCustomer && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-yellow-200 via-yellow-100 to-yellow-50 border-l-8 border-yellow-400 rounded-2xl p-5 shadow-md text-center"
          >
            <p className="text-yellow-800 font-semibold text-lg">
              🏆 You’re among our <b>Top Customers!</b> Keep shining and enjoy
              exclusive rewards.
            </p>
          </motion.div>
        )}

        {/* Vouchers List */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-orange-100"
        >
          <h2 className="text-xl font-semibold text-orange-600 mb-5 flex items-center gap-2">
            🎫 Your Active Vouchers
          </h2>
          {data.vouchers.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {data.vouchers.map((voucher) => (
                <motion.div
                  key={voucher._id}
                  whileHover={{ scale: 1.03 }}
                  className="p-5 rounded-xl bg-gradient-to-br from-blue-50 to-white border border-blue-100 shadow hover:shadow-lg transition"
                >
                  <h3 className="font-semibold text-blue-700 text-lg">
                    Code: {voucher.code}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Discount:{' '}
                    <span className="text-green-600 font-semibold">
                      {voucher.discount}%
                    </span>{' '}
                    off
                  </p>
                  <p className="text-sm text-gray-500 mb-3">
                    Expires on:{' '}
                    {new Date(voucher.expiry).toLocaleDateString()}
                  </p>
                  <div className="flex justify-between items-center">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        voucher.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {voucher.status === 'active' ? 'Active ✅' : 'Expired ❌'}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(voucher.code);
                        toast.success('Voucher code copied 🎉');
                      }}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 text-sm rounded-md"
                    >
                      Copy
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center">
              No active vouchers yet. Keep shopping to earn some 🎉
            </p>
          )}
        </motion.div>

        {/* How to Use Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-orange-100"
        >
          <h2 className="text-xl font-semibold text-orange-600 mb-3">
            💡 How to Use Your Voucher
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-sm text-gray-700">
            <li>Copy your voucher code.</li>
            <li>Go to the checkout page during your next purchase.</li>
            <li>Enter it in the “Promo/Voucher Code” field.</li>
            <li>Enjoy your discount instantly 🎉</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
