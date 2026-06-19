'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import {
  FiEye, FiEyeOff, FiArrowDown, FiArrowUp, FiCreditCard,
  FiActivity, FiRepeat, FiLock, FiShield, FiZap, FiTruck,
  FiChevronRight, FiPlus, FiCheck, FiSend, FiUsers,
  FiTrendingUp, FiGift, FiAward, FiX,
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '@/app/context/AuthContext';
import WalletPayModal from './payments/WalletPayModal';

/* ─── Utils ──────────────────────────────────────────────────────────────── */
type WeeklyStat = { day: string; total: number };

const getLast7Days = (): string[] => {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
};

const formatDayLabel = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

const formatDateGroup = (date: string) => {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return 'Earlier';
};

type Transaction = {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  label: string;
  date: string;
};

type Currency = 'NC' | 'KES';
type SuccessKind = 'deposit' | 'withdraw' | 'transfer';

/* ════════════════════════════════════════════════════════════════
   CONFETTI — CSS only, no deps
════════════════════════════════════════════════════════════════ */
const CONFETTI_COLORS = ['#f97316', '#fb923c', '#fdba74', '#1f2937', '#6b7280', '#fed7aa'];
function Confetti() {
  const pieces = Array.from({ length: 36 }, (_, i) => i);
  return (
    <div className="pointer-events-none fixed inset-0 z-[200] overflow-hidden">
      {pieces.map((i) => (
        <div
          key={i}
          className="absolute top-0 w-2 h-3 rounded-sm opacity-90"
          style={{
            left: `${Math.random() * 100}%`,
            backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            animation: `walletConfetti ${1.5 + Math.random() * 2}s ease-in ${Math.random() * 0.7}s forwards`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
      <style>{`
        @keyframes walletConfetti {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   TRANSACTION SUCCESS MODAL (replaces toast for money events)
════════════════════════════════════════════════════════════════ */
function TransactionSuccessModal({
  kind, amount, recipientName, onClose,
}: {
  kind: SuccessKind;
  amount: number;
  recipientName?: string;
  onClose: () => void;
}) {
  const copy = {
    deposit:  { title: 'Top-up Successful! 🎉',  sub: `Ksh ${amount.toLocaleString()} added to your wallet`, icon: <FiArrowDown className="w-8 h-8 text-orange-500" /> },
    withdraw: { title: 'Withdrawal Sent! 🎉',     sub: `Ksh ${amount.toLocaleString()} is on its way to M-Pesa`, icon: <FiArrowUp className="w-8 h-8 text-orange-500" /> },
    transfer: { title: 'Transfer Complete! 🎉',   sub: `Ksh ${amount.toLocaleString()} sent to ${recipientName || 'recipient'}`, icon: <FiSend className="w-8 h-8 text-orange-500" /> },
  }[kind];

  return (
    <>
      <Confetti />
      <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden text-center"
        >
          <div className="bg-gradient-to-br from-[#1f2937] to-[#111827] px-6 pt-8 pb-6">
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 300 }}
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg"
            >
              {copy.icon}
            </motion.div>
            <h2 className="text-white font-black text-2xl">{copy.title}</h2>
            <p className="text-gray-300 text-sm mt-1">{copy.sub}</p>
          </div>

          <div className="px-6 py-5 space-y-3">
            <div className="flex items-center gap-3 bg-orange-50 border border-orange-100 rounded-xl p-3 text-left">
              <FiShield className="w-5 h-5 text-orange-500 flex-shrink-0" />
              <p className="text-xs text-orange-700 leading-relaxed">
                Your wallet is protected with bank-grade encryption. Every transaction is logged and traceable.
              </p>
            </div>
          </div>

          <div className="px-6 pb-6">
            <button
              onClick={onClose}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-2xl transition active:scale-[0.98] shadow-md shadow-orange-200"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════ */
export default function WalletPage() {
  const { user } = useAuth();

  const [showBalance, setShowBalance]       = useState(true);
  const [currency, setCurrency]             = useState<Currency>('NC');
  const [showAmountModal, setShowAmountModal] = useState(false);
  const [showPayModal, setShowPayModal]     = useState(false);
  const [topUpAmount, setTopUpAmount]       = useState<number | null>(null);
  const [showPinModal, setShowPinModal]     = useState(false);
  const [pin, setPin]                       = useState('');
  const [withdrawPhone, setWithdrawPhone]   = useState('');
  const [showSetPinModal, setShowSetPinModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number | null>(null);
  const [withdrawMethod, setWithdrawMethod] = useState<'mpesa'>('mpesa');
  const [balanceNC, setBalanceNC]           = useState(0);
  const [transactions, setTransactions]     = useState<Transaction[]>([]);
  const [activeFilter, setActiveFilter]     = useState<'Today' | 'Yesterday' | 'Earlier'>('Today');
  const [showAllTx, setShowAllTx]           = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showBenefitsModal, setShowBenefitsModal] = useState(false);

  const [successInfo, setSuccessInfo] = useState<{ kind: SuccessKind; amount: number; recipientName?: string } | null>(null);

  const hideTimer        = useRef<NodeJS.Timeout | null>(null);
  const lastPaymentRef   = useRef<number | null>(null);
  const userName         = user?.name || 'Welcome';
  const buyerId          = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

  const totalCredit = transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
  const totalDebit  = transactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);

  useEffect(() => {
    const reset = () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => setShowBalance(false), 15000);
    };
    window.addEventListener('mousemove', reset);
    window.addEventListener('keydown', reset);
    reset();
    return () => {
      window.removeEventListener('mousemove', reset);
      window.removeEventListener('keydown', reset);
    };
  }, []);

  useEffect(() => {
    if (!user?._id) return;
    fetch(`/api/wallet/balance?userId=${user._id}`)
      .then(r => r.json()).then(d => setBalanceNC(d.balance));
    fetch(`/api/wallet/transactions?userId=${user._id}`)
      .then(r => r.json()).then(setTransactions);
  }, [user]);

  const canInitiatePayment = () => {
    const now = Date.now();
    if (lastPaymentRef.current && now - lastPaymentRef.current < 10000) {
      toast.error('Please wait before initiating another payment.');
      return false;
    }
    lastPaymentRef.current = now;
    return true;
  };

  const confirmWithdraw = async () => {
    if (pin.length !== 4 || !withdrawAmount) { toast.error('Invalid PIN or amount'); return; }
    try {
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user!._id, pin, amount: withdrawAmount, method: withdrawMethod }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message); return; }
      setShowPinModal(false);
      setSuccessInfo({ kind: 'withdraw', amount: withdrawAmount });
      setPin(''); setWithdrawAmount(null);
    } catch { toast.error('Withdrawal failed'); }
  };

  const filteredTx = transactions.filter(tx => formatDateGroup(tx.date) === activeFilter);

  const weeklyActivity: WeeklyStat[] = (() => {
    const last7 = getLast7Days();
    const totals: Record<string, number> = {};
    last7.forEach(d => { totals[d] = 0; });
    transactions.forEach(tx => {
      const k = new Date(tx.date).toISOString().split('T')[0];
      if (totals[k] !== undefined) totals[k] += tx.amount;
    });
    return last7.map(d => ({ day: formatDayLabel(d), total: totals[d] }));
  })();

  const maxWeekly = Math.max(...weeklyActivity.map(d => d.total), 1);

  return (
    <div className="max-w-xl mx-auto px-4 pt-24 pb-20 min-h-screen bg-[#f7f7f6]">

      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <p className="text-sm text-gray-500">{getGreeting()},</p>
        <h1 className="text-2xl font-bold text-gray-900">{userName.split(' ')[0]} 👋</h1>
      </motion.div>

      {/* Wallet Card — unified dark neutral + orange accent */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="relative rounded-[28px] overflow-hidden mb-5 p-6 text-white"
        style={{ background: 'linear-gradient(135deg, #1c1c1e 0%, #111213 100%)' }}
      >
        <div className="absolute w-56 h-56 rounded-full bg-orange-500/10 -top-16 -right-16 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-8">
            <div>
              <p className="text-[10px] tracking-[2px] uppercase text-white/40 mb-0.5">NovaPay Wallet</p>
              <p className="text-xs text-white/60">Available Balance</p>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setCurrency(c => c === 'NC' ? 'KES' : 'NC')}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 transition px-3 py-1.5 rounded-full text-[11px] font-semibold"
              >
                <FiRepeat size={11} /> {currency}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowBalance(b => !b)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center"
              >
                {showBalance ? <FiEyeOff size={14} /> : <FiEye size={14} />}
              </motion.button>
            </div>
          </div>

          <div className="mb-6">
            <motion.p
              key={showBalance ? 'shown' : 'hidden'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-4xl font-bold tracking-tight"
            >
              {showBalance ? balanceNC.toLocaleString() : '••••••'}{' '}
              <span className="text-2xl font-normal opacity-60">{currency}</span>
            </motion.p>
            {currency === 'NC' && (
              <p className="text-xs text-white/40 mt-1">
                ≈ KES {showBalance ? balanceNC.toLocaleString() : '••••••'}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm tracking-[4px] text-white/25 font-mono">•••• •••• 4291</p>
            <div className="flex items-center gap-1 bg-orange-500/15 border border-orange-400/25 px-2.5 py-1 rounded-full">
              <FiShield size={10} className="text-orange-400" />
              <span className="text-[10px] text-orange-300 font-semibold">Protected</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Why NovaPay strip — benefits teaser */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        onClick={() => setShowBenefitsModal(true)}
        className="w-full flex items-center gap-3 bg-orange-50 border border-orange-100 rounded-2xl p-3.5 mb-5 text-left hover:bg-orange-100/60 transition-colors"
      >
        <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center flex-shrink-0">
          <FiAward size={15} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold text-orange-700">Why shop with NovaPay?</p>
          <p className="text-[11px] text-orange-500">Faster checkout, send money to friends, earn rewards</p>
        </div>
        <FiChevronRight size={14} className="text-orange-400 flex-shrink-0" />
      </motion.button>

      {/* Stats Row — neutral + orange only */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {[
          { label: 'Total Income', value: totalCredit, icon: <FiArrowDown />, change: '↑ 12%' },
          { label: 'Total Spent',  value: totalDebit,  icon: <FiArrowUp />,   change: '↓ 5%' },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm"
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm mb-3 bg-orange-50 text-orange-500">
              {s.icon}
            </div>
            <p className="text-xs text-gray-500 mb-0.5">{s.label}</p>
            <p className="text-lg font-bold text-gray-800">KES {s.value.toLocaleString()}</p>
            <p className="text-[11px] font-medium mt-0.5 text-gray-400">{s.change} this month</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions — added Send to Friend */}
      <div className="grid grid-cols-4 gap-2.5 mb-5">
        {[
          { icon: <FiArrowDown size={16} />, label: 'Deposit',  onClick: () => { if (canInitiatePayment()) setShowAmountModal(true); } },
          { icon: <FiArrowUp size={16} />,   label: 'Withdraw', onClick: async () => {
              if (!user?._id) return;
              try {
                const res  = await fetch(`/api/wallet/check-pin?userId=${user._id}`);
                const data = await res.json();
                data.hasPin ? setShowWithdrawModal(true) : setShowSetPinModal(true);
              } catch { toast.error('Unable to verify wallet PIN'); }
            }
          },
          { icon: <FiSend size={16} />,      label: 'Send',     onClick: () => setShowTransferModal(true) },
          { icon: <FiCreditCard size={16} />, label: 'Pay',     onClick: undefined },
        ].map((a, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.96 }}
            onClick={a.onClick}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.05 }}
            className="bg-white rounded-2xl p-3.5 flex flex-col items-center gap-2 shadow-sm hover:shadow-md transition border border-gray-100"
          >
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-orange-50 text-orange-500">
              {a.icon}
            </div>
            <p className="text-[11px] font-semibold text-gray-700">{a.label}</p>
          </motion.button>
        ))}
      </div>

      {/* Promo Banners — single brand palette */}
      <div className="mb-5">
        <p className="text-sm font-bold text-gray-700 mb-3">Offers for you</p>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
          {[
            { badge: 'Flash Sale',   title: 'Up to 60% OFF',     sub: 'Ends tonight at midnight',   icon: <FiZap size={14} /> },
            { badge: 'Cashback',     title: '5% on top-ups',     sub: 'On all M-Pesa deposits',      icon: <FiArrowDown size={14} /> },
            { badge: 'Refer & Earn', title: 'KES 200/referral',  sub: 'Invite friends now',          icon: <FiUsers size={14} /> },
          ].map((b, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02 }}
              className="flex-shrink-0 w-56 snap-start rounded-2xl p-4 cursor-pointer text-white"
              style={{ background: 'linear-gradient(135deg, #1c1c1e, #2a2a2c)' }}
            >
              <div className="flex items-center gap-1.5 mb-1 text-orange-400">
                {b.icon}
                <span className="text-[10px] font-bold text-orange-400/80 uppercase tracking-wider">{b.badge}</span>
              </div>
              <p className="text-white font-bold text-base leading-tight">{b.title}</p>
              <p className="text-white/40 text-[11px] mt-1">{b.sub}</p>
              <div className="flex items-center gap-1 text-white/50 text-xs mt-2 font-semibold">
                Shop now <FiChevronRight size={11} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Weekly Activity */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-5 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <FiActivity size={15} className="text-orange-500" /> Weekly Activity
          </h3>
          <span className="text-[11px] text-gray-400">Last 7 days</span>
        </div>
        <div className="flex items-end gap-2 h-20">
          {weeklyActivity.map((d, i) => {
            const pct = d.total === 0 ? 0 : Math.max((d.total / maxWeekly) * 100, 8);
            const isMax = d.total === Math.max(...weeklyActivity.map(x => x.total));
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full">
                <div className="relative w-full flex-1 bg-gray-100 rounded-lg overflow-hidden">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${pct}%` }}
                    transition={{ delay: i * 0.05, duration: 0.5, ease: 'easeOut' }}
                    className={`absolute bottom-0 w-full rounded-lg ${isMax ? 'bg-orange-500' : 'bg-orange-200'}`}
                  />
                </div>
                <span className="text-[10px] text-gray-400">{d.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-5 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-800">Payment Methods</h3>
          <button className="flex items-center gap-1 text-orange-500 text-xs font-semibold hover:text-orange-600">
            <FiPlus size={13} /> Add new
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[
            { src: '/M-PESA.svg',      alt: 'M-Pesa',     label: 'M-Pesa' },
            { src: '/Airtel.svg',      alt: 'Airtel',      label: 'Airtel' },
            { src: '/visa.png',        alt: 'Visa',        label: 'Visa' },
            { src: '/mastercard.png',  alt: 'Mastercard',  label: 'MC' },
          ].map((m, i) => (
            <motion.div
              key={i}
              whileTap={{ scale: 0.96 }}
              className="border border-gray-100 rounded-xl p-3 flex flex-col items-center gap-2 cursor-pointer hover:border-orange-200 hover:bg-orange-50 transition"
            >
              <Image src={m.src} alt={m.alt} width={40} height={26} className="object-contain" />
              <p className="text-[11px] text-gray-500 font-medium">{m.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-5 border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-800">Transactions</h3>
          <button onClick={() => setShowAllTx(true)} className="text-xs text-orange-500 font-semibold hover:text-orange-600">
            View all
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          {(['Today', 'Yesterday', 'Earlier'] as const).map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition
                ${activeFilter === f ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              {f}
            </button>
          ))}
        </div>

        {filteredTx.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p className="font-medium text-sm">No transactions</p>
            <p className="text-xs mt-1">Your activity will appear here</p>
          </div>
        ) : (
          <ul className="space-y-1">
            {filteredTx.map(tx => <TxRow key={tx.id} tx={tx} />)}
          </ul>
        )}
      </div>

      {/* All Transactions Modal */}
      <AnimatePresence>
        {showAllTx && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowAllTx(false)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-6"
            >
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-bold text-gray-800">All Transactions</h3>
                <button onClick={() => setShowAllTx(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">✕</button>
              </div>
              {transactions.length === 0
                ? <p className="text-center text-gray-400 py-10">No transactions yet</p>
                : <ul className="space-y-1">{transactions.map(tx => <TxRow key={tx.id} tx={tx} />)}</ul>
              }
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Why NovaPay Benefits Modal */}
      <AnimatePresence>
        {showBenefitsModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowBenefitsModal(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-sm overflow-hidden"
            >
              <div className="bg-gradient-to-br from-[#1c1c1e] to-[#111213] px-6 pt-7 pb-6 text-center relative">
                <button onClick={() => setShowBenefitsModal(false)} className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition">
                  <FiX size={14} />
                </button>
                <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center mx-auto mb-3">
                  <FiAward size={22} className="text-white" />
                </div>
                <h3 className="text-white font-black text-lg">Why use NovaPay?</h3>
                <p className="text-gray-400 text-xs mt-1">More than a wallet — it's your fastest way to shop</p>
              </div>

              <div className="px-6 py-5 space-y-4">
                {[
                  { icon: <FiZap size={16} />,     title: 'Instant checkout',  body: 'Skip entering card details — pay in one tap for every order.' },
                  { icon: <FiSend size={16} />,     title: 'Send to friends',   body: 'Transfer funds instantly to any NovaXmax user — perfect for splitting orders or gifting.' },
                  { icon: <FiGift size={16} />,     title: 'Earn rewards',      body: 'Get cashback on top-ups and bonus credit for referrals.' },
                  { icon: <FiShield size={16} />,   title: 'Bank-grade security', body: 'PIN-protected withdrawals and encrypted transactions, always.' },
                ].map((b, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center flex-shrink-0">
                      {b.icon}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{b.title}</p>
                      <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{b.body}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-6 pb-6">
                <button
                  onClick={() => setShowBenefitsModal(false)}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-2xl transition"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Amount Modal */}
      {showAmountModal && (
        <AmountModal
          onClose={() => setShowAmountModal(false)}
          onConfirm={amount => { setTopUpAmount(amount); setShowAmountModal(false); setShowPayModal(true); }}
        />
      )}

      {showSetPinModal && (
        <SetPinModal
          userId={user!._id}
          onClose={() => setShowSetPinModal(false)}
          onSuccess={() => { setShowSetPinModal(false); setShowPinModal(true); }}
        />
      )}

      {showWithdrawModal && (
        <WithdrawModal
          onClose={() => setShowWithdrawModal(false)}
          onConfirm={(amount, method, phone) => {
            setWithdrawAmount(amount); setWithdrawMethod(method); setWithdrawPhone(phone);
            setShowWithdrawModal(false); setShowPinModal(true);
          }}
        />
      )}

      {/* Transfer to NovaXmax User Modal */}
      {showTransferModal && user?._id && (
        <TransferModal
          userId={user._id}
          onClose={() => setShowTransferModal(false)}
          onSuccess={(amount, recipientName) => {
            setShowTransferModal(false);
            setSuccessInfo({ kind: 'transfer', amount, recipientName });
            fetch(`/api/wallet/balance?userId=${user._id}`).then(r => r.json()).then(d => setBalanceNC(d.balance));
            fetch(`/api/wallet/transactions?userId=${user._id}`).then(r => r.json()).then(setTransactions);
          }}
        />
      )}

      {showPayModal && topUpAmount && (
        <WalletPayModal
          payload={{ amount: topUpAmount, items: [], deliveryFee: 0, county: '', town: '', userId: buyerId!, purpose: 'wallet', refId: buyerId! }}
          onClose={() => setShowPayModal(false)}
          onSuccess={() => {
            setShowPayModal(false);
            setSuccessInfo({ kind: 'deposit', amount: topUpAmount });
          }}
        />
      )}

      {/* PIN Modal */}
      <AnimatePresence>
        {showPinModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl w-80 p-6 space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto mb-2">
                <FiLock size={22} className="text-orange-600" />
              </div>
              <h3 className="font-bold text-center text-gray-800">Enter Wallet PIN</h3>
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={e => setPin(e.target.value)}
                placeholder="••••"
                className="w-full border border-gray-200 rounded-2xl p-3 text-center text-2xl tracking-[12px] focus:ring-2 focus:ring-orange-400 outline-none"
              />
              <div className="flex gap-2 pt-1">
                <button onClick={() => setShowPinModal(false)} className="flex-1 border border-gray-200 rounded-2xl py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
                <button onClick={confirmWithdraw} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl py-3 text-sm font-semibold transition">Confirm</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transaction success celebration */}
      <AnimatePresence>
        {successInfo && (
          <TransactionSuccessModal
            kind={successInfo.kind}
            amount={successInfo.amount}
            recipientName={successInfo.recipientName}
            onClose={() => setSuccessInfo(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Transaction Row ────────────────────────────────────────────────────── */
function TxRow({ tx }: { tx: { id: string; type: string; amount: number; label: string; date: string } }) {
  const isCredit = tx.type === 'credit';
  return (
    <li className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition cursor-pointer">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
        ${isCredit ? 'bg-gray-100 text-gray-700' : 'bg-orange-50 text-orange-600'}`}>
        {isCredit ? <FiArrowDown size={16} /> : <FiArrowUp size={16} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{tx.label}</p>
        <p className="text-xs text-gray-400">{new Date(tx.date).toLocaleString()}</p>
      </div>
      <div className="text-right">
        <p className={`text-sm font-bold ${isCredit ? 'text-gray-700' : 'text-orange-600'}`}>
          {isCredit ? '+' : '-'}{tx.amount} NC
        </p>
        <p className="text-[10px] text-gray-400">Completed</p>
      </div>
    </li>
  );
}

/* ─── Amount Modal ───────────────────────────────────────────────────────── */
function AmountModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: (n: number) => void }) {
  const [amount, setAmount] = useState('');
  const presets = [500, 1000, 2000, 5000];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <motion.div
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4"
      >
        <h3 className="font-bold text-gray-800 text-lg">Top up wallet</h3>
        <div className="grid grid-cols-4 gap-2">
          {presets.map(p => (
            <button key={p} onClick={() => setAmount(String(p))}
              className={`py-2 rounded-xl text-sm font-semibold border transition
                ${amount === String(p) ? 'bg-orange-500 text-white border-orange-500' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-orange-300'}`}>
              {p}
            </button>
          ))}
        </div>
        <input
          type="number"
          placeholder="Or enter custom amount"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="w-full border border-gray-200 rounded-2xl p-3 text-sm focus:ring-2 focus:ring-orange-400 outline-none"
        />
        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 border border-gray-200 rounded-2xl py-3 text-sm font-semibold text-gray-600">Cancel</button>
          <button onClick={() => onConfirm(Number(amount))} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl py-3 text-sm font-semibold transition">
            Continue
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Set PIN Modal ───────────────────────────────────────────────────────── */
function SetPinModal({ userId, onClose, onSuccess }: { userId: string; onClose: () => void; onSuccess: () => void }) {
  const [pin, setPin]           = useState('');
  const [confirmPin, setConfirm] = useState('');
  const [loading, setLoading]   = useState(false);

  const submit = async () => {
    if (pin.length !== 4)    { toast.error('PIN must be 4 digits'); return; }
    if (pin !== confirmPin)  { toast.error('PINs do not match'); return; }
    setLoading(true);
    const res = await fetch('/api/wallet/set-pin', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, pin }),
    });
    setLoading(false);
    if (!res.ok) { toast.error('Failed to set PIN'); return; }
    toast.success('PIN set successfully');
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-3xl w-80 p-6 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto">
          <FiLock size={22} className="text-orange-600" />
        </div>
        <h3 className="font-bold text-center text-gray-800">Set Wallet PIN</h3>
        <input type="password" maxLength={4} placeholder="Enter 4-digit PIN" value={pin} onChange={e => setPin(e.target.value)}
          className="w-full border border-gray-200 rounded-2xl p-3 text-center text-xl tracking-[8px] focus:ring-2 focus:ring-orange-400 outline-none" />
        <input type="password" maxLength={4} placeholder="Confirm PIN" value={confirmPin} onChange={e => setConfirm(e.target.value)}
          className="w-full border border-gray-200 rounded-2xl p-3 text-center text-xl tracking-[8px] focus:ring-2 focus:ring-orange-400 outline-none" />
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 border border-gray-200 rounded-2xl py-3 text-sm font-semibold text-gray-600">Cancel</button>
          <button disabled={loading} onClick={submit} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl py-3 text-sm font-semibold transition">
            {loading ? 'Saving…' : 'Save PIN'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Withdraw Modal ─────────────────────────────────────────────────────── */
function WithdrawModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: (amount: number, method: 'mpesa', phone: string) => void }) {
  const [amount, setAmount] = useState('');
  const [phone,  setPhone]  = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4">
        <h3 className="font-bold text-gray-800 text-lg">Withdraw funds</h3>
        <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-2xl">
          <div className="w-9 h-9 rounded-xl bg-gray-200 flex items-center justify-center text-gray-700 text-xs font-bold">M</div>
          <div>
            <p className="text-sm font-semibold text-gray-800">M-Pesa</p>
            <p className="text-xs text-gray-400">Instant transfer</p>
          </div>
        </div>
        <input type="text" placeholder="Phone number (2547XXXXXXXX)" value={phone} onChange={e => setPhone(e.target.value)}
          className="w-full border border-gray-200 rounded-2xl p-3 text-sm focus:ring-2 focus:ring-orange-400 outline-none" />
        <input type="number" placeholder="Amount (KES)" value={amount} onChange={e => setAmount(e.target.value)}
          className="w-full border border-gray-200 rounded-2xl p-3 text-sm focus:ring-2 focus:ring-orange-400 outline-none" />
        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 border border-gray-200 rounded-2xl py-3 text-sm font-semibold text-gray-600">Cancel</button>
          <button onClick={() => onConfirm(Number(amount), 'mpesa', phone)} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl py-3 text-sm font-semibold transition">
            Continue
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Transfer to NovaXmax User Modal ────────────────────────────────────── */
function TransferModal({ userId, onClose, onSuccess }: {
  userId: string;
  onClose: () => void;
  onSuccess: (amount: number, recipientName: string) => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [identifier, setIdentifier] = useState('');
  const [recipient, setRecipient] = useState<{ name: string; id: string } | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [checking, setChecking] = useState(false);
  const [sending, setSending] = useState(false);

  const lookupRecipient = async () => {
    if (!identifier.trim()) { toast.error('Enter a phone number or email'); return; }
    setChecking(true);
    try {
      const res = await fetch(`/api/wallet/lookup-user?identifier=${encodeURIComponent(identifier)}`);
      const data = await res.json();
      if (!res.ok || !data.user) { toast.error('No NovaXmax user found with that phone/email'); return; }
      setRecipient({ name: data.user.name, id: data.user._id });
      setStep(2);
    } catch {
      toast.error('Failed to look up user');
    } finally {
      setChecking(false);
    }
  };

  const sendTransfer = async () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) { toast.error('Enter a valid amount'); return; }
    if (!recipient) return;
    setSending(true);
    try {
      const res = await fetch('/api/wallet/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromUserId: userId, toUserId: recipient.id, amount: amt, note }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message || 'Transfer failed'); return; }
      onSuccess(amt, recipient.name);
    } catch {
      toast.error('Transfer failed. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
            <FiSend size={15} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-base leading-none">Send to a friend</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Instant transfer to any NovaXmax user</p>
          </div>
        </div>

        {step === 1 ? (
          <>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1.5">Recipient phone or email</label>
              <input
                type="text"
                placeholder="0712345678 or name@email.com"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                className="w-full border border-gray-200 rounded-2xl p-3 text-sm focus:ring-2 focus:ring-orange-400 outline-none"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={onClose} className="flex-1 border border-gray-200 rounded-2xl py-3 text-sm font-semibold text-gray-600">Cancel</button>
              <button
                disabled={checking}
                onClick={lookupRecipient}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-2xl py-3 text-sm font-semibold transition"
              >
                {checking ? 'Checking…' : 'Find user'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 bg-orange-50 border border-orange-100 rounded-2xl p-3">
              <div className="w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                {recipient?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{recipient?.name}</p>
                <p className="text-[11px] text-gray-400">Confirmed NovaXmax user</p>
              </div>
              <button onClick={() => setStep(1)} className="text-[11px] text-orange-500 font-semibold hover:underline flex-shrink-0">Change</button>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1.5">Amount (KES)</label>
              <input
                type="number"
                placeholder="e.g. 500"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full border border-gray-200 rounded-2xl p-3 text-sm focus:ring-2 focus:ring-orange-400 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1.5">Note <span className="text-gray-400 font-normal">(optional)</span></label>
              <input
                type="text"
                placeholder="e.g. For the order split"
                value={note}
                onChange={e => setNote(e.target.value)}
                className="w-full border border-gray-200 rounded-2xl p-3 text-sm focus:ring-2 focus:ring-orange-400 outline-none"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button onClick={() => setStep(1)} className="flex-1 border border-gray-200 rounded-2xl py-3 text-sm font-semibold text-gray-600">Back</button>
              <button
                disabled={sending}
                onClick={sendTransfer}
                className="flex-1 flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-2xl py-3 text-sm font-semibold transition"
              >
                {sending ? 'Sending…' : <><FiSend size={13} /> Send</>}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}