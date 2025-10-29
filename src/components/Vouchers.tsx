'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { toast } from 'react-toastify';
import Confetti from 'react-confetti';
import { FaGift, FaCrown, FaTags, FaShoppingBag, FaCoins, FaMoneyBillWave } from 'react-icons/fa';

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

  const [redeeming, setRedeeming] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // 🌈 Mouse tracking for parallax icons
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

  // 🎉 Handle NovaPoints redemption
  const handleRedeem = () => {
    if (!data || data.ordersCount === 0) return toast.error('You have no NovaPoints to redeem.');

    setRedeeming(true);
    setShowConfetti(true);

    setTimeout(() => {
      setRedeeming(false);
      setShowModal(true);
      setShowConfetti(false);
    }, 3000);
  };

  if (!data)
    return (
      <div className="flex justify-center items-center min-h-[70vh] text-gray-500">
        Loading your vouchers...
      </div>
    );

  const novaPoints = data.ordersCount; // 1 order = 1 NovaPoint
  const cashEquivalent = novaPoints * 50;

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-100 overflow-hidden pt-28 pb-20"
    >
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}

      {/* ✨ Floating Parallax Icons */}
      <motion.div style={{ x: giftX, y: giftY }} animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 5 }} className="absolute top-36 left-10 text-orange-400 opacity-30 text-6xl">
        <FaGift />
      </motion.div>
      <motion.div style={{ x: tagsX, y: tagsY }} animate={{ y: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 6 }} className="absolute top-60 right-12 text-orange-300 opacity-40 text-6xl">
        <FaTags />
      </motion.div>
      <motion.div style={{ x: bagX, y: bagY }} animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 7 }} className="absolute bottom-28 left-20 text-orange-300 opacity-40 text-6xl">
        <FaShoppingBag />
      </motion.div>
      <motion.div style={{ x: crownX, y: crownY }} animate={{ y: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 6 }} className="absolute bottom-40 right-24 text-orange-300 opacity-40 text-6xl">
        <FaCrown />
      </motion.div>

      {/* 🧭 Header */}
      <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-12 relative z-10">
        <h1 className="text-4xl md:text-5xl font-bold text-orange-600 mb-4">🎁 My Vouchers</h1>
        <p className="text-gray-700 text-lg max-w-2xl mx-auto">Your loyalty deserves rewards. Explore your earned discounts and keep shopping to unlock more!</p>
      </motion.div>

      <div className="max-w-5xl mx-auto px-6 space-y-8 relative z-10">
        {/* 🪙 NovaPoints Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-orange-100 via-yellow-50 to-white p-6 rounded-2xl shadow-lg border border-orange-200"
        >
          <div className="flex items-center gap-4 mb-4">
            <FaCoins className="text-yellow-500 text-4xl" />
            <h2 className="text-2xl font-bold text-orange-700">NovaPoints Balance</h2>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="text-center sm:text-left">
              <p className="text-lg text-gray-700">
                You’ve earned <span className="font-bold text-orange-600">{novaPoints}</span> NovaPoints
              </p>
              <p className="text-sm text-gray-600">Each NovaPoint = KSh 50</p>
              <p className="text-xl font-semibold text-green-700 mt-1">Total Value: KSh {cashEquivalent.toLocaleString()}</p>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleRedeem}
              disabled={redeeming || novaPoints === 0}
              className={`mt-6 sm:mt-0 px-6 py-3 rounded-lg text-white font-semibold shadow-md transition ${
                redeeming || novaPoints === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600'
              }`}
            >
              {redeeming ? 'Redeeming...' : '🎉 Redeem NovaPoints'}
            </motion.button>
          </div>

          <div className="mt-4 flex justify-center gap-6 text-yellow-500 text-3xl">
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
              <FaCoins />
            </motion.div>
            <motion.div animate={{ y: [-5, 5, -5] }} transition={{ repeat: Infinity, duration: 2.5 }}>
              <FaMoneyBillWave />
            </motion.div>
            <motion.div animate={{ y: [5, -5, 5] }} transition={{ repeat: Infinity, duration: 3 }}>
              <FaCoins />
            </motion.div>
          </div>
        </motion.div>

        {/* Existing sections remain unchanged below */}
        {/* ... Shopping progress, vouchers list, top customer banner ... */}
      </div>

      {/* 💬 Redeem Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-8 max-w-sm text-center"
          >
            <h2 className="text-2xl font-bold text-orange-600 mb-3">🎊 Congratulations!</h2>
            <p className="text-gray-700 mb-5">
              You’ve successfully redeemed your <span className="font-semibold text-orange-500">{novaPoints}</span> NovaPoints worth{' '}
              <span className="font-semibold text-green-600">KSh {cashEquivalent.toLocaleString()}</span>.
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
