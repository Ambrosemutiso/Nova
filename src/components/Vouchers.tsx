'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Confetti from 'react-confetti';
import { ChevronLeft, Info, ChevronRight, ChevronUp, ChevronDown, Copy, Check } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Voucher {
  _id: string;
  code: string;
  discount: number;
  expiry: string;
  status: string;
}

interface PageData {
  ordersCount: number;
  percentage: number;
  isTopCustomer: boolean;
  vouchers: Voucher[];
}

// ─── FAQ data ─────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: 'What are NovaPoints?',
    a: 'NovaPoints is our official loyalty program open to all registered users. Every order you place earns you 1 NovaPoint. Points can be redeemed for cash-equivalent vouchers at checkout.',
  },
  {
    q: 'How do I earn NovaPoints?',
    a: 'You earn 1 NovaPoint for every completed order. The more you shop, the more points you accumulate. Points are credited automatically after an order is delivered.',
  },
  {
    q: 'When do my vouchers expire?',
    a: 'Each voucher has an individual expiry date shown on the voucher card. Expired vouchers cannot be redeemed. Make sure to use them before they expire!',
  },
  {
    q: 'How do I use a voucher at checkout?',
    a: 'Copy your voucher code from this page, then paste it into the "Promo / Voucher Code" field on the checkout page. The discount is applied instantly.',
  },
];

// ─── Referral milestones ──────────────────────────────────────────────────────

const MILESTONES = [
  { xp: '1,000 XP', reward: 'KSh 600',   emoji: '💰' },
  { xp: '5,000 XP', reward: 'KSh 3,600', emoji: '💰' },
  { xp: '30,000 XP',reward: 'KSh 24,000',emoji: '💰' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function MyVouchersPage() {
  const [data, setData]               = useState<PageData | null>(null);
  const [redeeming, setRedeeming]     = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showModal, setShowModal]     = useState(false);
  const [openFaq, setOpenFaq]         = useState<number | null>(null);
  const [copied, setCopied]           = useState<string | null>(null);

  useEffect(() => { fetchVouchers(); }, []);

  const fetchVouchers = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) { toast.error('You must be logged in to view vouchers'); return; }
      const res = await fetch(`/api/user/vouchers?userId=${userId}`);
      if (!res.ok) throw new Error('Failed to fetch vouchers');
      setData(await res.json());
    } catch (err) {
      console.error(err);
      toast.error('Failed to load vouchers');
    }
  };

  const handleRedeem = () => {
    if (!data || data.ordersCount === 0) return toast.error('You have no NovaPoints to redeem.');
    setRedeeming(true);
    setShowConfetti(true);
    setTimeout(() => { setRedeeming(false); setShowModal(true); setShowConfetti(false); }, 3000);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    toast.success('Voucher code copied 🎉');
    setTimeout(() => setCopied(null), 2000);
  };

  if (!data) return (
    <div className="flex items-center justify-center min-h-screen bg-[#FFF0E8]">
      <div className="w-12 h-12 border-4 border-orange-500 border-dashed rounded-full animate-spin" />
    </div>
  );

  const novaPoints     = data.ordersCount;
  const cashEquivalent = novaPoints * 120;

  return (
    <div className="min-h-screen bg-[#FDE8D8] font-sans">
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}

      {/* ── Top nav bar ── */}
      <div className="sticky top-0 z-30 bg-[#FDE8D8] flex items-center justify-between px-4 py-4 pt-12">
        <button className="flex items-center gap-1 text-gray-800 font-semibold text-base">
          <ChevronLeft size={22} strokeWidth={2.5} />
          <span>My Vouchers & Points</span>
        </button>
        <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-400">
          <Info size={16} className="text-gray-600" />
        </button>
      </div>

      {/* ── Hero section ── */}
      <div className="px-5 pt-2 pb-6 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">
            Earn <span className="text-orange-500">KSh {cashEquivalent > 0 ? cashEquivalent.toLocaleString() + '+' : '3,000+'}</span>
          </h1>
          <h1 className="text-3xl font-bold text-gray-900">in rewards</h1>
        </div>
        {/* Illustration — 3D person with tags */}
        <div className="relative w-28 h-24 flex-shrink-0">
          <div className="absolute right-0 bottom-0 w-24 h-24 bg-orange-400 rounded-full opacity-20" />
          <div className="absolute right-2 bottom-0 text-6xl select-none">🧑‍🎁</div>
          <div className="absolute right-0 top-1 text-2xl select-none rotate-12">🏷️</div>
          <div className="absolute right-10 top-0 text-xl select-none -rotate-12">🎫</div>
        </div>
      </div>

      <div className="px-4 space-y-4 pb-12">

        {/* ── Earn rewards card (dashed border top — ticket stub look) ── */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
          {/* Ticket top notch row */}
          <div className="px-6 pt-6 pb-4 text-center">
            <p className="text-lg font-bold text-gray-900">Earn rewards for</p>
            <p className="text-lg font-bold text-gray-900">each order you place</p>
            <div className="mt-3 space-y-1">
              <p className="text-sm text-gray-700">
                <span className="text-orange-500 font-bold">1 NovaPoint</span> per order completed
              </p>
              <p className="text-sm text-gray-700">
                <span className="text-orange-500 font-bold">KSh 120</span> value per NovaPoint redeemed
              </p>
            </div>
          </div>
          {/* Dashed divider — ticket perforation */}
          <div className="relative flex items-center px-0">
            <div className="w-5 h-5 bg-[#FDE8D8] rounded-full -ml-2.5 flex-shrink-0" />
            <div className="flex-1 border-t-2 border-dashed border-gray-200 mx-1" />
            <div className="w-5 h-5 bg-[#FDE8D8] rounded-full -mr-2.5 flex-shrink-0" />
          </div>
          {/* CTA */}
          <div className="px-6 py-5">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleRedeem}
              disabled={redeeming || novaPoints === 0}
              className={`w-full py-4 rounded-full text-white font-bold text-base shadow-md transition ${
                redeeming || novaPoints === 0
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-orange-500 hover:bg-orange-600 active:bg-orange-700'
              }`}
            >
              {redeeming ? 'Redeeming...' : '🎉 Redeem NovaPoints'}
            </motion.button>
            <p className="text-center mt-3 text-sm text-gray-400">
              You have{' '}
              <span className="font-semibold text-orange-500 underline underline-offset-2 cursor-pointer">
                {novaPoints} NovaPoint{novaPoints !== 1 ? 's' : ''}
              </span>{' '}
              available
            </p>
          </div>
        </div>

        {/* ── Progress card ── */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-bold text-gray-900 text-base">🛒 Shopping Progress</h2>
            <span className="text-xs text-orange-500 font-semibold">{data.percentage}%</span>
          </div>
          <p className="text-sm text-gray-500 mb-3">
            You've completed <span className="font-semibold text-gray-700">{data.ordersCount}</span> orders so far.
          </p>
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${data.percentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-2.5 rounded-full bg-gradient-to-r from-orange-500 to-yellow-400"
            />
          </div>
          {data.isTopCustomer && (
            <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
              <span className="text-lg">🏆</span>
              <p className="text-sm text-yellow-800 font-medium">You're among our Top Customers!</p>
            </div>
          )}
        </div>

        {/* ── "More ways to earn" label ── */}
        <p className="text-center font-bold text-gray-900 text-base pt-1">More ways to earn rewards</p>

        {/* ── Monthly Challenge card ── */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-base font-bold text-gray-900">Monthly Challenge:</p>
              <p className="text-lg font-extrabold text-orange-500 leading-tight">
                KSh {(novaPoints * 120 + 1000).toLocaleString()}+ up for grabs
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Place the most orders this month and win exclusive bonuses
              </p>
              <div className="flex items-center gap-2 mt-3">
                <div className="flex -space-x-2">
                  {['🧑', '👩', '🧔', '👱'].map((emoji, i) => (
                    <div key={i} className="w-7 h-7 rounded-full bg-orange-100 border-2 border-white flex items-center justify-center text-sm">
                      {emoji}
                    </div>
                  ))}
                </div>
                <span className="text-orange-500 text-sm font-medium">Join 20,000+ others now 🤙</span>
              </div>
            </div>
            <button className="ml-3 mt-1 flex-shrink-0">
              <ChevronRight size={22} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* ── Referral Bonus card ── */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-base font-bold text-gray-900">NovaPoints Bonus:</p>
              <p className="text-lg font-extrabold text-orange-500 leading-tight">KSh 24,000+ up for grabs</p>
              <p className="text-sm text-gray-500 mt-1">Keep ordering to climb milestones and earn cash bundles</p>
            </div>
            <button className="ml-3 mt-1 flex-shrink-0">
              <ChevronRight size={22} className="text-gray-400" />
            </button>
          </div>
          {/* Milestones row */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {MILESTONES.map((m, i) => (
              <div key={i} className="text-center">
                <p className="text-sm font-bold text-gray-800">{m.emoji} {m.reward}</p>
              </div>
            ))}
          </div>
          {/* XP progress track */}
          <div className="relative">
            <div className="w-full h-2 bg-gray-100 rounded-full" />
            <div
              className="absolute top-0 left-0 h-2 rounded-full bg-gradient-to-r from-orange-500 to-yellow-400 transition-all"
              style={{ width: `${Math.min((novaPoints / 300) * 100, 100)}%` }}
            />
            {/* Milestone dots */}
            {[0, 50, 100].map((pct, i) => (
              <div
                key={i}
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white bg-orange-200"
                style={{ left: `${pct === 0 ? 0 : pct === 50 ? 49 : 97}%` }}
              />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {MILESTONES.map((m, i) => (
              <div key={i} className="text-center">
                <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full font-medium">{m.xp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Active Vouchers ── */}
        {data.vouchers.length > 0 && (
          <div className="space-y-3">
            <p className="font-bold text-gray-900 text-base px-1">🎫 Your Active Vouchers</p>
            {data.vouchers.map((voucher) => (
              <motion.div
                key={voucher._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl overflow-hidden shadow-sm"
              >
                {/* Ticket body */}
                <div className="px-5 pt-5 pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        voucher.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {voucher.status === 'active' ? 'Active' : 'Expired'}
                      </span>
                      <p className="text-2xl font-extrabold text-orange-500 mt-2">{voucher.discount}% OFF</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Expires {new Date(voucher.expiry).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-4xl select-none mt-1">🎟️</div>
                  </div>
                </div>
                {/* Dashed divider */}
                <div className="relative flex items-center">
                  <div className="w-4 h-4 bg-[#FDE8D8] rounded-full -ml-2 flex-shrink-0" />
                  <div className="flex-1 border-t-2 border-dashed border-gray-100 mx-1" />
                  <div className="w-4 h-4 bg-[#FDE8D8] rounded-full -mr-2 flex-shrink-0" />
                </div>
                {/* Code + copy */}
                <div className="px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Voucher Code</p>
                    <p className="font-mono font-bold text-gray-800 text-base tracking-widest">{voucher.code}</p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.93 }}
                    onClick={() => copyCode(voucher.code)}
                    className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-semibold transition"
                  >
                    {copied === voucher.code
                      ? <><Check size={14} /> Copied</>
                      : <><Copy size={14} /> Copy</>
                    }
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {data.vouchers.length === 0 && (
          <div className="bg-white rounded-3xl p-8 text-center shadow-sm">
            <p className="text-4xl mb-3">🎫</p>
            <p className="font-semibold text-gray-700">No vouchers yet</p>
            <p className="text-sm text-gray-400 mt-1">Keep shopping to earn NovaPoints and unlock vouchers!</p>
          </div>
        )}

        {/* ── FAQ section ── */}
        <div className="pt-2">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Frequently asked questions</h2>
          <div className="space-y-0 bg-white rounded-3xl overflow-hidden shadow-sm divide-y divide-gray-100">
            {FAQS.map((faq, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="font-semibold text-gray-900 text-sm pr-4">{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp size={18} className="text-gray-400 flex-shrink-0" />
                    : <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />
                  }
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-4 text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Redeem Success Modal ── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex justify-center items-end z-[999999999] pb-0"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="bg-white w-full rounded-t-3xl p-8 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
              <p className="text-5xl mb-4">🎊</p>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Congratulations!</h2>
              <p className="text-gray-500 text-sm mb-2">
                You've redeemed <span className="font-semibold text-orange-500">{novaPoints} NovaPoints</span>
              </p>
              <p className="text-3xl font-extrabold text-green-600 mb-6">
                KSh {cashEquivalent.toLocaleString()} value unlocked
              </p>
              <p className="text-xs text-gray-400 mb-6">
                Your voucher has been added to your account. Use it at checkout on your next purchase.
              </p>
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-bold text-base transition"
              >
                Awesome, got it!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}