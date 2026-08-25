'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  FaMedal,
  FaTrophy,
  FaCrown,
  FaGift,
  FaCheckCircle,
  FaFire,
} from 'react-icons/fa';
import Confetti from 'react-confetti';
import axios from 'axios';

/* ─── Design tokens ──────────────────────────────────────────────────────────
   Same system as the wallet & finance pages: ink + paper + warm gray + brand
   orange, with red reserved for the one genuinely negative number on this
   page (cancellation rate). Leaderboard rank tiers use orange/ink/gray
   instead of literal gold/silver/bronze, to stay inside the palette.
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
  leaderboard: LeaderboardEntry[];
}

// ✅ Badge structure for UI
interface Badge {
  name: string;
  icon: React.ReactNode;
  date: string;
  desc: string;
  type: 'Monthly' | 'All-Time' | 'Other';
  reward: string;
}

interface LeaderboardEntry {
  sellerId: string;
  name?: string;
  shopName?: string;
  sales: number;
}

const GOLD_TARGET = 100000;

export default function AwardsPage() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [filter, setFilter] = useState<'All' | 'Monthly' | 'All-Time'>('All');
  const [claimedBadge, setClaimedBadge] = useState<Badge | null>(null);
  const [sellerStats, setSellerStats] = useState<SellerStats | null>(null);
  const [sellerInfo, setSellerInfo] = useState<SellerInfo | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const fetchAwards = async () => {
      const sellerId = localStorage.getItem("SellerUser");
      if (!sellerId) return;

      const res = await axios.get<ApiResponse>(
        `/api/seller/awards?sellerId=${sellerId}`
      );

      setSellerInfo(res.data.seller);
      setSellerStats(res.data.stats);
      setLeaderboard(res.data.leaderboard);

      const convertedBadges: Badge[] = res.data.awards.map((award) => ({
        name: award.title,
        icon: <FaMedal />,
        date: new Date().toLocaleDateString("en-GB", {
          month: "short",
          year: "numeric",
        }),
        desc: award.description,
        type: "All-Time", // ✅ now locked
        reward: "Ksh 1,000",
      }));

      setBadges(convertedBadges);
      setProgress(Math.min((res.data.stats.totalSales / GOLD_TARGET) * 100, 100));
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

  const remainingToGold = sellerStats ? Math.max(GOLD_TARGET - sellerStats.totalSales, 0) : 0;
  const isCurrentSeller = (row: LeaderboardEntry) =>
    !!sellerInfo && (row.shopName === sellerInfo.shopName || row.name === sellerInfo.name);

  return (
    <div className="min-h-screen" style={{ background: T.canvas }}>
      <div className="max-w-6xl mx-auto px-4 pt-28 pb-10">
        {showConfetti && (
          <Confetti
            width={typeof window !== 'undefined' ? window.innerWidth : 0}
            height={typeof window !== 'undefined' ? window.innerHeight : 0}
            recycle={false}
            colors={[T.orange, T.orangeDk, T.ink, '#FFFFFF']}
          />
        )}

        {/* ── Header ────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <p className="text-[11px] font-semibold tracking-[0.14em] uppercase" style={{ color: T.muted }}>
            Performance
          </p>
          <div className="flex items-center gap-2.5 mt-0.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: T.ink, color: T.orange }}
            >
              <FaTrophy size={16} />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: T.ink, fontFamily: "'Outfit', sans-serif" }}>
              Seller Awards &amp; Achievements
            </h1>
          </div>
          <p className="text-sm mt-2" style={{ color: T.muted }}>
            Every sale moves you closer to your next badge — keep going.
          </p>
        </motion.div>

        {/* ── Seller snapshot ──────────────────────────────────────────── */}
        {sellerStats && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-5 mb-5"
            style={{ background: T.paper, border: `1px solid ${T.line}` }}
          >
            <h2 className="text-sm font-bold mb-3" style={{ color: T.ink }}>
              {sellerInfo?.shopName || sellerInfo?.name}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <StatChip label="Total Sales" value={`Ksh ${sellerStats.totalSales.toLocaleString()}`} />
              <StatChip label="Orders" value={String(sellerStats.totalOrders)} />
              <StatChip label="Delivered" value={String(sellerStats.deliveredCount)} />
              <StatChip label="Delivery Rate" value={`${sellerStats.deliveryRate}%`} />
              <StatChip label="Cancel Rate" value={`${sellerStats.cancelRate}%`} tone="red" />
            </div>
          </motion.div>
        )}

        {/* ── Progress Tracker ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="relative rounded-2xl p-5 mb-6 overflow-hidden"
          style={{ background: T.ink }}
        >
          <div
            aria-hidden
            className="absolute w-64 h-64 rounded-full pointer-events-none"
            style={{ top: -110, right: -80, background: `radial-gradient(circle, ${T.orange}33 0%, transparent 70%)` }}
          />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-1.5">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <FaFire size={13} style={{ color: T.orange }} /> Next Award Progress
              </h2>
              <span className="text-sm font-bold tabular-nums" style={{ color: T.orange, fontFamily: "'Outfit', sans-serif" }}>
                {progress.toFixed(0)}%
              </span>
            </div>
            <p className="text-xs text-white/55 mb-4">
              {progress >= 100
                ? <>You’ve unlocked the <span className="font-semibold text-white">Gold Seller Badge</span> 🎉</>
                : <>
                    <span className="font-semibold text-white">Ksh {remainingToGold.toLocaleString()}</span> more in
                    sales unlocks the <span className="font-semibold text-white">Gold Seller Badge</span>
                  </>
              }
            </p>
            <div className="w-full rounded-full h-2.5" style={{ background: 'rgba(255,255,255,0.12)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1 }}
                className="h-2.5 rounded-full"
                style={{ background: `linear-gradient(90deg, ${T.orangeDk}, ${T.orange})` }}
              />
            </div>
          </div>
        </motion.div>

        {/* ── Filters ───────────────────────────────────────────────────── */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: T.ink }}>
            <FaMedal size={14} style={{ color: T.orange }} /> Your Badges
          </h2>
          <div className="flex gap-1.5">
            {(['All', 'Monthly', 'All-Time'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition"
                style={
                  filter === f
                    ? { background: T.ink, color: '#fff' }
                    : { background: T.paper, color: T.muted, border: `1px solid ${T.line}` }
                }
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* ── Achieved Badges ──────────────────────────────────────────── */}
        <div className="rounded-2xl p-5 mb-6" style={{ background: T.paper, border: `1px solid ${T.line}` }}>
          {filteredBadges.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBadges.map((badge, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 16, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  whileHover={{ y: -3 }}
                  transition={{ delay: index * 0.08 }}
                  className="rounded-2xl p-4 transition-shadow"
                  style={{ background: T.canvas, border: `1px solid ${T.line}` }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
                      style={{ background: T.orange, color: '#fff' }}
                    >
                      {badge.icon}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm truncate" style={{ color: T.ink }}>{badge.name}</h3>
                      <p className="text-[11px]" style={{ color: T.muted }}>{badge.date}</p>
                    </div>
                  </div>
                  <p className="text-sm mb-3" style={{ color: T.muted }}>{badge.desc}</p>

                  <div className="flex justify-between items-center pt-3" style={{ borderTop: `1px solid ${T.line}` }}>
                    <span className="text-xs flex items-center gap-1.5" style={{ color: T.muted }}>
                      <FaGift size={12} style={{ color: T.orange }} />
                      Reward: <b style={{ color: T.ink }}>{badge.reward}</b>
                    </span>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleClaimReward(badge)}
                      className="text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                      style={{ background: T.orange }}
                    >
                      Claim Reward
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FaMedal size={28} className="mx-auto mb-3" style={{ color: T.line }} />
              <p className="text-sm font-medium" style={{ color: T.ink }}>No awards in this category yet</p>
              <p className="text-xs mt-1" style={{ color: T.muted }}>Keep selling — your next badge is already in motion.</p>
            </div>
          )}
        </div>

        {/* ── Claim Confirmation Modal ──────────────────────────────────── */}
        <AnimatePresence>
          {claimedBadge && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                className="rounded-2xl p-6 text-center max-w-sm"
                style={{ background: T.paper }}
              >
                <FaCheckCircle size={46} className="mx-auto mb-3" style={{ color: T.orange }} />
                <h3 className="text-lg font-bold mb-2" style={{ color: T.ink }}>
                  Reward Claimed!
                </h3>
                <p className="text-sm mb-5" style={{ color: T.muted }}>
                  You've successfully claimed your reward for{' '}
                  <b style={{ color: T.ink }}>{claimedBadge.name}</b> — <b style={{ color: T.ink }}>{claimedBadge.reward}</b>
                </p>
                <button
                  onClick={() => setClaimedBadge(null)}
                  className="text-white px-5 py-2.5 rounded-xl font-medium transition"
                  style={{ background: T.orange }}
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Leaderboard ───────────────────────────────────────────────── */}
        <div className="rounded-2xl p-5" style={{ background: T.paper, border: `1px solid ${T.line}` }}>
          <h2 className="text-sm font-bold mb-4" style={{ color: T.ink }}>Leaderboard</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs" style={{ color: T.muted, borderBottom: `1px solid ${T.line}` }}>
                <th className="p-2 font-semibold">Rank</th>
                <th className="p-2 font-semibold">Seller</th>
                <th className="p-2 font-semibold">Sales</th>
                <th className="p-2 font-semibold">Badge</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((row, i) => {
                const mine = isCurrentSeller(row);
                const tier = i === 0 ? T.orange : i === 1 ? T.ink : '#C9C4B8';
                const RankIcon = i === 0 ? FaCrown : i === 1 ? FaTrophy : FaMedal;
                return (
                  <motion.tr
                    key={row.sellerId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    style={{
                      borderBottom: `1px solid ${T.line}`,
                      background: mine ? `${T.orange}0D` : 'transparent',
                      borderLeft: mine ? `3px solid ${T.orange}` : '3px solid transparent',
                    }}
                  >
                    <td className="p-2 font-semibold text-sm" style={{ color: T.ink }}>{i + 1}</td>
                    <td className="p-2 text-sm" style={{ color: T.ink }}>
                      {row.shopName || row.name} {mine && <span className="text-[10px] font-semibold ml-1" style={{ color: T.orange }}>YOU</span>}
                    </td>
                    <td className="p-2 text-sm tabular-nums" style={{ color: T.muted }}>Ksh {row.sales.toLocaleString()}</td>
                    <td className="p-2">
                      <span
                        className="w-7 h-7 rounded-full inline-flex items-center justify-center text-xs"
                        style={{ background: i < 3 ? `${tier}1F` : T.canvas, color: i < 3 ? tier : T.muted }}
                      >
                        <RankIcon size={i < 3 ? 13 : 11} />
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800&display=swap');
      `}</style>
    </div>
  );
}

/* ─── Small stat chip used in the seller snapshot ────────────────────────── */
function StatChip({ label, value, tone }: { label: string; value: string; tone?: 'red' }) {
  return (
    <div className="rounded-xl p-3" style={{ background: T.canvas }}>
      <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: T.muted }}>{label}</p>
      <p className="text-sm font-bold tabular-nums" style={{ color: tone === 'red' ? T.red : T.ink }}>{value}</p>
    </div>
  );
}