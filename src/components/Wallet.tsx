'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import {
  FiEye, FiEyeOff, FiArrowDown, FiArrowUp, FiCreditCard,
  FiActivity, FiRepeat, FiLock, FiShield, FiZap, FiTruck,
  FiChevronRight, FiPlus, FiCheck,
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

/* ─── Main Component ─────────────────────────────────────────────────────── */
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

  const hideTimer        = useRef<NodeJS.Timeout | null>(null);
  const lastPaymentRef   = useRef<number | null>(null);
  const userName         = user?.name || 'Welcome';
  const buyerId          = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

  /* totals for stats cards */
  const totalCredit = transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
  const totalDebit  = transactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);

  /* auto-hide balance */
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
      toast.success('Withdrawal initiated');
      setShowPinModal(false); setPin(''); setWithdrawAmount(null);
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
    <div className="max-w-xl mx-auto px-4 pt-24 pb-20 min-h-screen bg-[#f5f5f7]">

      {/* ── Greeting ──────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <p className="text-sm text-gray-500">{getGreeting()},</p>
        <h1 className="text-2xl font-bold text-gray-900">{userName.split(' ')[0]} 👋</h1>
      </motion.div>

      {/* ── Wallet Card ───────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="relative rounded-[28px] overflow-hidden mb-5 p-6 text-white"
        style={{ background: 'linear-gradient(135deg, #0f0c29, #1a1a3e, #24243e)' }}
      >
        {/* decorative blobs */}
        <div className="absolute w-56 h-56 rounded-full bg-orange-500/10 -top-16 -right-16 pointer-events-none" />
        <div className="absolute w-32 h-32 rounded-full bg-purple-500/10 bottom-0 left-10 pointer-events-none" />

        <div className="relative z-10">
          {/* top row */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <p className="text-[10px] tracking-[2px] uppercase text-white/50 mb-0.5">Nova Wallet</p>
              <p className="text-xs text-white/70">Available Balance</p>
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

          {/* balance */}
          <div className="mb-6">
            <motion.p
              key={showBalance ? 'shown' : 'hidden'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-4xl font-bold tracking-tight"
            >
              {showBalance ? balanceNC.toLocaleString() : '••••••'}{' '}
              <span className="text-2xl font-normal opacity-70">{currency}</span>
            </motion.p>
            {currency === 'NC' && (
              <p className="text-xs text-white/50 mt-1">
                ≈ KES {showBalance ? balanceNC.toLocaleString() : '••••••'}
              </p>
            )}
          </div>

          {/* card footer */}
          <div className="flex items-center justify-between">
            <p className="text-sm tracking-[4px] text-white/30 font-mono">•••• •••• 4291</p>
            <div className="flex items-center gap-1 bg-orange-500/20 border border-orange-400/30 px-2.5 py-1 rounded-full">
              <FiShield size={10} className="text-orange-400" />
              <span className="text-[10px] text-orange-300 font-semibold">Protected</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Stats Row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {[
          { label: 'Total Income', value: totalCredit, icon: <FiArrowDown />, bg: 'bg-emerald-50', iconBg: 'bg-emerald-100 text-emerald-600', change: '↑ 12%', changeColor: 'text-emerald-600' },
          { label: 'Total Spent',  value: totalDebit,  icon: <FiArrowUp />,   bg: 'bg-rose-50',    iconBg: 'bg-rose-100 text-rose-600',       change: '↓ 5%',  changeColor: 'text-rose-500' },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className={`${s.bg} rounded-2xl p-4`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm mb-3 ${s.iconBg}`}>
              {s.icon}
            </div>
            <p className="text-xs text-gray-500 mb-0.5">{s.label}</p>
            <p className="text-lg font-bold text-gray-800">KES {s.value.toLocaleString()}</p>
            <p className={`text-[11px] font-medium mt-0.5 ${s.changeColor}`}>{s.change} this month</p>
          </motion.div>
        ))}
      </div>

      {/* ── Quick Actions ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { icon: <FiArrowDown size={18} />, label: 'Deposit',  sub: 'Top up',     iconBg: 'bg-emerald-100 text-emerald-600', onClick: () => { if (canInitiatePayment()) setShowAmountModal(true); } },
          { icon: <FiArrowUp   size={18} />, label: 'Withdraw', sub: 'Cash out',   iconBg: 'bg-rose-100 text-rose-600',
            onClick: async () => {
              if (!user?._id) return;
              try {
                const res  = await fetch(`/api/wallet/check-pin?userId=${user._id}`);
                const data = await res.json();
                data.hasPin ? setShowWithdrawModal(true) : setShowSetPinModal(true);
              } catch { toast.error('Unable to verify wallet PIN'); }
            }
          },
          { icon: <FiCreditCard size={18} />, label: 'Pay',    sub: 'Nova coins',  iconBg: 'bg-orange-100 text-orange-600', onClick: undefined },
        ].map((a, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.96 }}
            onClick={a.onClick}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.05 }}
            className="bg-white rounded-2xl p-4 flex flex-col items-center gap-2 shadow-sm hover:shadow-md transition"
          >
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${a.iconBg}`}>
              {a.icon}
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-800">{a.label}</p>
              <p className="text-[11px] text-gray-400">{a.sub}</p>
            </div>
          </motion.button>
        ))}
      </div>

      {/* ── Promo Banners ─────────────────────────────────────────────────── */}
      <div className="mb-5">
        <p className="text-sm font-bold text-gray-700 mb-3">Offers for you</p>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
          {[
            { bg: 'from-[#0f0c29] to-[#24243e]', badge: 'Flash Sale', title: 'Up to 60% OFF', sub: 'Ends tonight at midnight', icon: <FiZap size={14} className="text-orange-400" /> },
            { bg: 'from-purple-600 to-purple-900',  badge: 'Cashback',   title: '5% on top-ups',  sub: 'On all M-Pesa deposits', icon: <FiArrowDown size={14} className="text-purple-300" /> },
            { bg: 'from-teal-600 to-teal-900',      badge: 'Refer & Earn', title: 'KES 200/referral', sub: 'Invite friends now', icon: <FiTruck size={14} className="text-teal-300" /> },
          ].map((b, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02 }}
              className={`flex-shrink-0 w-56 snap-start rounded-2xl bg-gradient-to-br ${b.bg} p-4 cursor-pointer`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                {b.icon}
                <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider">{b.badge}</span>
              </div>
              <p className="text-white font-bold text-base leading-tight">{b.title}</p>
              <p className="text-white/50 text-[11px] mt-1">{b.sub}</p>
              <div className="flex items-center gap-1 text-white/60 text-xs mt-2 font-semibold">
                Shop now <FiChevronRight size={11} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Weekly Activity ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-5">
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

      {/* ── Payment Methods ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-5">
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

      {/* ── Transactions ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-800">Transactions</h3>
          <button onClick={() => setShowAllTx(true)} className="text-xs text-orange-500 font-semibold hover:text-orange-600">
            View all
          </button>
        </div>

        {/* Filter tabs */}
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
            {filteredTx.map(tx => (
              <TxRow key={tx.id} tx={tx} />
            ))}
          </ul>
        )}
      </div>

      {/* ── All Transactions Modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {showAllTx && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowAllTx(false)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
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

      {/* ── Amount Modal ──────────────────────────────────────────────────── */}
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

      {showPayModal && topUpAmount && (
        <WalletPayModal
          payload={{ amount: topUpAmount, items: [], deliveryFee: 0, county: '', town: '', userId: buyerId!, purpose: 'wallet', refId: buyerId! }}
          onClose={() => setShowPayModal(false)}
          onSuccess={() => { setShowPayModal(false); setTimeout(() => window.location.reload(), 4000); }}
        />
      )}

      {/* ── PIN Modal ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showPinModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
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
    </div>
  );
}

/* ─── Transaction Row ────────────────────────────────────────────────────── */
function TxRow({ tx }: { tx: { id: string; type: string; amount: number; label: string; date: string } }) {
  const isCredit = tx.type === 'credit';
  return (
    <li className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition cursor-pointer">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
        ${isCredit ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
        {isCredit ? <FiArrowDown size={16} /> : <FiArrowUp size={16} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{tx.label}</p>
        <p className="text-xs text-gray-400">{new Date(tx.date).toLocaleString()}</p>
      </div>
      <div className="text-right">
        <p className={`text-sm font-bold ${isCredit ? 'text-emerald-600' : 'text-orange-600'}`}>
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
        <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-2xl">
          <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center text-green-700 text-xs font-bold">M</div>
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