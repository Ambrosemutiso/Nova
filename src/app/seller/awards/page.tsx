'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  FaMedal,
  FaTrophy,
  FaCrown,
  FaStar,
  FaGift,
  FaCheckCircle,
} from 'react-icons/fa';
import Confetti from 'react-confetti';
import axios from 'axios';

// ✅ Backend response types
interface Award {
  title: string;
  description: string;
  badge: string;
}

interface SellerStats {
  totalSales: number;
  totalOrders: number;
  deliveredCount: number;
  pendingCount: number;
  cancelledCount: number;
  deliveryRate: string;
  cancelRate: string;
}

interface SellerInfo {
  name: string;
  shopName?: string;
}

interface ApiResponse {
  seller: SellerInfo;
  stats: SellerStats;
  awards: Award[];
}

// ✅ Badge structure for UI
interface Badge {
  name: string;
  icon: JSX.Element;
  date: string;
  desc: string;
  type: 'Monthly' | 'All-Time' | 'Other';
  reward: string;
}

export default function AwardsPage() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [filter, setFilter] = useState<'All' | 'Monthly' | 'All-Time'>('All');
  const [claimedBadge, setClaimedBadge] = useState<Badge | null>(null);
  const [sellerStats, setSellerStats] = useState<SellerStats | null>(null);
  const [sellerInfo, setSellerInfo] = useState<SellerInfo | null>(null);

  // ✅ Fetch seller awards from backend
  useEffect(() => {
    const fetchAwards = async () => {
      try {
        const sellerId = localStorage.getItem('SellerUser'); // Assume sellerId stored on login
        if (!sellerId) return;

        const res = await axios.get<ApiResponse>(
          `/api/seller/awards?sellerId=${sellerId}`
        );

        const data = res.data;
        setSellerInfo(data.seller);
        setSellerStats(data.stats);

        // Convert backend awards into UI badges
        const convertedBadges: Badge[] = data.awards.map((award) => ({
          name: award.title,
          icon: <FaMedal className="text-orange-500" />,
          date: new Date().toLocaleDateString('en-GB', {
            month: 'short',
            year: 'numeric',
          }),
          desc: award.description,
          type: 'All-Time',
          reward: 'Ksh 1000',
        }));

        setBadges(convertedBadges);
        setProgress(Math.min((data.stats.totalSales / 100000) * 100, 100));
      } catch (error) {
        console.error('❌ Error fetching awards:', error);
      }
    };

    fetchAwards();
  }, []);

  // ✅ Filter logic
  const filteredBadges =
    filter === 'All' ? badges : badges.filter((b) => b.type === filter);

  // ✅ Claim reward
  const handleClaimReward = (badge: Badge) => {
    setClaimedBadge(badge);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 4000);
  };

  return (
    <div className="md:ml-64 p-6 text-gray-800 relative pt-10 pb-10">
      {showConfetti && (
        <Confetti
          width={typeof window !== 'undefined' ? window.innerWidth : 0}
          height={typeof window !== 'undefined' ? window.innerHeight : 0}
          recycle={false}
        />
      )}

      <h1 className="text-3xl font-bold text-orange-600 mb-6">
        🏆 Seller Awards & Achievements
      </h1>

      {/* Seller Info & Stats */}
      {sellerStats && (
        <div className="bg-white p-5 rounded-2xl shadow mb-6">
          <h2 className="text-lg font-semibold mb-2">
            {sellerInfo?.shopName || sellerInfo?.name}
          </h2>
          <p className="text-sm text-gray-600">
            Total Sales: <b>Ksh {sellerStats.totalSales.toLocaleString()}</b> |{' '}
            Orders: <b>{sellerStats.totalOrders}</b> | Delivered:{' '}
            <b>{sellerStats.deliveredCount}</b> | Delivery Rate:{' '}
            <b>{sellerStats.deliveryRate}%</b>
          </p>
        </div>
      )}

      {/* Progress Tracker */}
      <div className="bg-white p-5 rounded-2xl shadow mb-6">
        <h2 className="text-lg font-semibold mb-2">Next Award Progress</h2>
        <p className="text-sm text-gray-600 mb-3">
          You're {progress.toFixed(1)}% toward earning the{' '}
          <span className="font-bold text-orange-600">Gold Seller Badge</span>!
        </p>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1 }}
            className="bg-gradient-to-r from-orange-500 to-yellow-400 h-3 rounded-full"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">🎖️ Your Badges</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as 'All' | 'Monthly' | 'All-Time')}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-orange-500"
        >
          <option value="All">All Awards</option>
          <option value="Monthly">Monthly Awards</option>
          <option value="All-Time">All-Time Awards</option>
        </select>
      </div>

      {/* Achieved Badges */}
      <div className="bg-white p-5 rounded-2xl shadow mb-6">
        {filteredBadges.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBadges.map((badge, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-b from-orange-50 to-white border border-orange-100 rounded-xl p-4 shadow-sm hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-3xl">{badge.icon}</div>
                  <div>
                    <h3 className="font-bold text-gray-800">{badge.name}</h3>
                    <p className="text-xs text-gray-500">{badge.date}</p>
                    <p className="text-sm text-gray-600 mt-1">{badge.desc}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-3">
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <FaGift className="text-orange-500" /> Reward:{' '}
                    <b>{badge.reward}</b>
                  </span>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleClaimReward(badge)}
                    className="bg-orange-500 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-orange-600 transition"
                  >
                    Claim Reward
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-10">
            No awards found for this category.
          </p>
        )}
      </div>

      {/* Claim Confirmation Modal */}
      <AnimatePresence>
        {claimedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white p-6 rounded-2xl shadow-xl text-center max-w-sm"
            >
              <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-3" />
              <h3 className="text-xl font-bold mb-2 text-gray-800">
                Reward Claimed!
              </h3>
              <p className="text-gray-600 mb-4">
                You’ve successfully claimed your reward for{' '}
                <b>{claimedBadge.name}</b> — <b>{claimedBadge.reward}</b> 🎉
              </p>
              <button
                onClick={() => setClaimedBadge(null)}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leaderboard */}
      <div className="bg-white p-5 rounded-2xl shadow">
        <h2 className="text-lg font-semibold mb-4">Leaderboard</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-gray-600 border-b">
              <th className="p-2">Rank</th>
              <th className="p-2">Seller</th>
              <th className="p-2">Sales</th>
              <th className="p-2">Badge</th>
            </tr>
          </thead>
          <tbody>
            {[
              { rank: 1, name: 'ElectroTech', sales: 'Ksh 120,000', badge: <FaCrown className="text-yellow-400" /> },
              { rank: 2, name: 'SwiftDeals', sales: 'Ksh 92,500', badge: <FaTrophy className="text-gray-400" /> },
              { rank: 3, name: 'MegaShop', sales: 'Ksh 80,000', badge: <FaMedal className="text-orange-500" /> },
            ].map((row, i) => (
              <motion.tr
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="border-b hover:bg-orange-50"
              >
                <td className="p-2 font-semibold">{row.rank}</td>
                <td className="p-2">{row.name}</td>
                <td className="p-2">{row.sales}</td>
                <td className="p-2 text-xl">{row.badge}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
