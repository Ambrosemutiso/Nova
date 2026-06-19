'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import {
  FiEye, FiEyeOff, FiArrowDown, FiArrowUp, FiCreditCard,
  FiActivity, FiRepeat, FiLock, FiShield, FiZap,
  FiChevronRight, FiPlus, FiCpu,
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '@/app/context/AuthContext';
import WalletPayModal from './payments/WalletPayModal';

/* ─── Design tokens ──────────────────────────────────────────────────────────
   Palette is deliberately narrow: ink (near-black), paper (white), warm grays,
   brand orange for identity + positive/income signals, and red reserved
   exclusively for money-out (debit / withdraw / spend) — nowhere else.
   ──────────────────────────────────────────────────────────────────────────── */
const T = {
  ink:      '#111110',
  canvas:   '#F7F5F1',
  paper:    '#FFFFFF',
  line:     '#EAE6DD',
  muted:    '#8C8780',
  orange:   '#F97316',
  orangeDk: '#C2410C',
  red:      '#DC2626',
  redBg:    '#FDEEEE',
};

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
    <div className="max-w-xl mx-auto px-4 pt-24 pb-20 min-h-screen" style={{ background: T.canvas }}>

      {/* ── Greeting ──────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <p className="text-[11px] font-semibold tracking-[0.14em] uppercase" style={{ color: T.muted }}>
          {getGreeting()}
        </p>
        <h1 className="text-2xl font-bold mt-0.5" style={{ color: T.ink, fontFamily: "'Outfit', sans-serif" }}>
          {userName.split(' ')[0]}
        </h1>
      </motion.div>

      {/* ── Wallet Card (signature element) ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="relative rounded-[28px] overflow-hidden mb-4 p-6"
        style={{
          background: `linear-gradient(155deg, ${T.ink} 0%, #1A1917 55%, #14130F 100%)`,
          boxShadow: '0 20px 50px -18px rgba(0,0,0,0.55)',
        }}
      >
        {/* brushed-metal texture */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(115deg, #fff 0px, #fff 1px, transparent 1px, transparent 7px)',
          }}
        />
        {/* single restrained accent glow */}
        <div
          aria-hidden
          className="absolute w-72 h-72 rounded-full pointer-events-none"
          style={{
            top: -120, right: -90,
            background: `radial-gradient(circle, ${T.orange}33 0%, transparent 70%)`,
          }}
        />

        <div className="relative z-10">
          {/* top row */}
          <div className="flex items-start justify-between mb-7">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${T.orange}, ${T.orangeDk})`,
                  boxShadow: `0 0 14px ${T.orange}55`,
                }}
              >
                <FiCpu size={13} color="#fff" />
              </div>
              <div>
                <p className="text-[10px] tracking-[0.18em] uppercase text-white/45">Nova Wallet</p>
                <p className="text-[11px] text-white/65 -mt-0.5">Available balance</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => setCurrency(c => c === 'NC' ? 'KES' : 'NC')}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/[0.16] transition px-3 py-1.5 rounded-full text-[11px] font-semibold text-white"
              >
                <FiRepeat size={11} /> {currency}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => setShowBalance(b => !b)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/[0.16] transition flex items-center justify-center text-white"
              >
                {showBalance ? <FiEyeOff size={14} /> : <FiEye size={14} />}
              </motion.button>
            </div>
          </div>

          {/* balance */}
          <div className="mb-7">
            <motion.p
              key={showBalance ? 'shown' : 'hidden'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[40px] leading-none font-bold tracking-tight text-white tabular-nums"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              {showBalance ? balanceNC.toLocaleString() : '••••••'}{' '}
              <span className="text-xl font-medium text-white/55">{currency}</span>
            </motion.p>
            {currency === 'NC' && (
              <p className="text-xs text-white/40 mt-1.5">
                ≈ KES {showBalance ? balanceNC.toLocaleString() : '••••••'}
              </p>
            )}
          </div>

          {/* card footer */}
          <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-[13px] tracking-[3px] text-white/30 font-mono">•••• •••• 4291</p>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: `${T.orange}1F`, border: `1px solid ${T.orange}4D` }}>
              <FiShield size={10} style={{ color: T.orange }} />
              <span className="text-[10px] font-semibold" style={{ color: T.orange }}>Protected</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Trust strip ───────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="grid grid-cols-3 gap-2 mb-5 rounded-2xl p-3"
        style={{ background: T.paper, border: `1px solid ${T.line}` }}
      >
        {[
          { icon: <FiLock size={13} />,   label: 'Bank-grade\nencryption' },
          { icon: <FiZap size={13} />,    label: 'Instant\nM-Pesa payouts' },
          { icon: <FiShield size={13} />, label: 'Buyer\nprotection' },
        ].map((t, i) => (
          <div key={i} className="flex flex-col items-center text-center gap-1.5 px-1">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: `${T.orange}14`, color: T.orange }}
            >
              {t.icon}
            </div>
            <p className="text-[10px] leading-tight font-medium whitespace-pre-line" style={{ color: T.muted }}>
              {t.label}
            </p>
          </div>
        ))}
      </motion.div>

      {/* ── Stats Row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {[
          { label: 'Total Income', value: totalCredit, icon: <FiArrowDown />, iconBg: T.orange, iconFg: '#fff', valueColor: T.ink, change: '↑ 12% this month' },
          { label: 'Total Spent',  value: totalDebit,  icon: <FiArrowUp />,   iconBg: T.redBg,  iconFg: T.red,  valueColor: T.red, change: '↓ 5% this month' },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="rounded-2xl p-4"
            style={{ background: T.paper, border: `1px solid ${T.line}` }}
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-sm mb-3"
              style={{ background: s.iconBg, color: s.iconFg }}
            >
              {s.icon}
            </div>
            <p className="text-xs mb-0.5" style={{ color: T.muted }}>{s.label}</p>
            <p className="text-lg font-bold tabular-nums" style={{ color: s.valueColor, fontFamily: "'Outfit', sans-serif" }}>
              KES {s.value.toLocaleString()}
            </p>
            <p className="text-[11px] font-medium mt-0.5" style={{ color: T.muted }}>{s.change}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Quick Actions ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          {
            icon: <FiArrowDown size={18} />, label: 'Deposit', sub: 'Top up', primary: true,
            onClick: () => { if (canInitiatePayment()) setShowAmountModal(true); },
          },
          {
            icon: <FiArrowUp size={18} />, label: 'Withdraw', sub: 'Cash out', primary: false,
            onClick: async () => {
              if (!user?._id) return;
              try {
                const res  = await fetch(`/api/wallet/check-pin?userId=${user._id}`);
                const data = await res.json();
                data.hasPin ? setShowWithdrawModal(true) : setShowSetPinModal(true);
              } catch { toast.error('Unable to verify wallet PIN'); }
            },
          },
          { icon: <FiCreditCard size={18} />, label: 'Pay', sub: 'Coming soon', primary: false, disabled: true, onClick: undefined },
        ].map((a, i) => (
          <motion.button
            key={i}
            whileTap={a.disabled ? undefined : { scale: 0.96 }}
            onClick={a.onClick}
            disabled={a.disabled}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.05 }}
            className="rounded-2xl p-4 flex flex-col items-center gap-2 transition"
            style={{
              background: a.primary ? T.orange : T.paper,
              border: a.primary ? `1px solid ${T.orange}` : `1px solid ${T.line}`,
              opacity: a.disabled ? 0.55 : 1,
              cursor: a.disabled ? 'default' : 'pointer',
              boxShadow: a.primary ? `0 10px 24px -10px ${T.orange}80` : 'none',
            }}
          >
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{
                background: a.primary ? 'rgba(255,255,255,0.18)' : `${T.ink}0D`,
                color: a.primary ? '#fff' : T.ink,
              }}
            >
              {a.icon}
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold" style={{ color: a.primary ? '#fff' : T.ink }}>{a.label}</p>
              <p className="text-[11px]" style={{ color: a.primary ? 'rgba(255,255,255,0.7)' : T.muted }}>{a.sub}</p>
            </div>
          </motion.button>
        ))}
      </div>

      {/* ── Promo Banners ─────────────────────────────────────────────────── */}
      <div className="mb-5">
        <p className="text-sm font-bold mb-3" style={{ color: T.ink }}>Offers for you</p>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
          {[
            { base: '#111110', accent: 'radial-gradient(circle at 100% 0%, rgba(249,115,22,0.30), transparent 60%)', badge: 'Flash Sale', title: 'Up to 60% OFF', sub: 'Ends tonight at midnight', icon: <FiZap size={13} /> },
            { base: '#1C1B19', accent: 'radial-gradient(circle at 0% 100%, rgba(249,115,22,0.24), transparent 60%)', badge: 'Cashback', title: '5% on top-ups', sub: 'On all M-Pesa deposits', icon: <FiArrowDown size={13} /> },
            { base: '#171614', accent: 'repeating-linear-gradient(135deg, rgba(249,115,22,0.10) 0 2px, transparent 2px 10px)', badge: 'Refer & Earn', title: 'KES 200/referral', sub: 'Invite friends now', icon: <FiPlus size={13} /> },
          ].map((b, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02 }}
              className="relative flex-shrink-0 w-56 snap-start rounded-2xl p-4 cursor-pointer overflow-hidden"
              style={{ background: b.base }}
            >
              <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: b.accent }} />
              <div className="relative z-10">
                <div className="flex items-center gap-1.5 mb-1.5" style={{ color: T.orange }}>
                  {b.icon}
                  <span className="text-[10px] font-bold uppercase tracking-wider">{b.badge}</span>
                </div>
                <p className="text-white font-bold text-base leading-tight">{b.title}</p>
                <p className="text-white/45 text-[11px] mt-1">{b.sub}</p>
                <div className="flex items-center gap-1 text-white/55 text-xs mt-2.5 font-semibold">
                  Shop now <FiChevronRight size={11} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Weekly Activity ───────────────────────────────────────────────── */}
      <div className="rounded-2xl p-5 mb-5" style={{ background: T.paper, border: `1px solid ${T.line}` }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: T.ink }}>
            <FiActivity size={15} style={{ color: T.orange }} /> Weekly Activity
          </h3>
          <span className="text-[11px]" style={{ color: T.muted }}>Last 7 days</span>
        </div>
        <div className="flex items-end gap-2 h-20">
          {weeklyActivity.map((d, i) => {
            const pct = d.total === 0 ? 0 : Math.max((d.total / maxWeekly) * 100, 8);
            const isMax = d.total === Math.max(...weeklyActivity.map(x => x.total));
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full">
                <div className="relative w-full flex-1 rounded-lg overflow-hidden" style={{ background: T.canvas }}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${pct}%` }}
                    transition={{ delay: i * 0.05, duration: 0.5, ease: 'easeOut' }}
                    className="absolute bottom-0 w-full rounded-lg"
                    style={{ background: isMax ? T.orange : `${T.orange}55` }}
                  />
                </div>
                <span className="text-[10px]" style={{ color: T.muted }}>{d.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Payment Methods ───────────────────────────────────────────────── */}
      <div className="rounded-2xl p-5 mb-5" style={{ background: T.paper, border: `1px solid ${T.line}` }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold" style={{ color: T.ink }}>Payment Methods</h3>
          <button className="flex items-center gap-1 text-xs font-semibold transition" style={{ color: T.orange }}>
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
              className="rounded-xl p-3 flex flex-col items-center gap-2 cursor-pointer transition"
              style={{ border: `1px solid ${T.line}` }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${T.orange}55`; (e.currentTarget as HTMLDivElement).style.background = `${T.orange}0A`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = T.line; (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
            >
              <Image src={m.src} alt={m.alt} width={40} height={26} className="object-contain" />
              <p className="text-[11px] font-medium" style={{ color: T.muted }}>{m.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Transactions ──────────────────────────────────────────────────── */}
      <div className="rounded-2xl p-5 mb-5" style={{ background: T.paper, border: `1px solid ${T.line}` }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold" style={{ color: T.ink }}>Transactions</h3>
          <button onClick={() => setShowAllTx(true)} className="text-xs font-semibold transition" style={{ color: T.orange }}>
            View all
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4">
          {(['Today', 'Yesterday', 'Earlier'] as const).map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition"
              style={
                activeFilter === f
                  ? { background: T.ink, color: '#fff' }
                  : { background: T.canvas, color: T.muted }
              }
            >
              {f}
            </button>
          ))}
        </div>

        {filteredTx.length === 0 ? (
          <div className="text-center py-10" style={{ color: T.muted }}>
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
              className="rounded-3xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-6"
              style={{ background: T.paper }}
            >
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-bold" style={{ color: T.ink }}>All Transactions</h3>
                <button
                  onClick={() => setShowAllTx(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition"
                  style={{ background: T.canvas, color: T.muted }}
                >
                  ✕
                </button>
              </div>
              {transactions.length === 0
                ? <p className="text-center py-10" style={{ color: T.muted }}>No transactions yet</p>
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
              className="rounded-3xl w-80 p-6 space-y-4"
              style={{ background: T.paper }}
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-2" style={{ background: `${T.orange}1A` }}>
                <FiLock size={22} style={{ color: T.orange }} />
              </div>
              <h3 className="font-bold text-center" style={{ color: T.ink }}>Enter Wallet PIN</h3>
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={e => setPin(e.target.value)}
                placeholder="••••"
                className="w-full rounded-2xl p-3 text-center text-2xl tracking-[12px] outline-none focus:ring-2"
                style={{ border: `1px solid ${T.line}`, color: T.ink, ['--tw-ring-color' as any]: `${T.orange}55` }}
              />
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setShowPinModal(false)}
                  className="flex-1 rounded-2xl py-3 text-sm font-semibold transition"
                  style={{ border: `1px solid ${T.line}`, color: T.muted }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmWithdraw}
                  className="flex-1 rounded-2xl py-3 text-sm font-semibold text-white transition"
                  style={{ background: T.orange }}
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800&display=swap');
      `}</style>
    </div>
  );
}

/* ─── Transaction Row ────────────────────────────────────────────────────── */
function TxRow({ tx }: { tx: { id: string; type: string; amount: number; label: string; date: string } }) {
  const isCredit = tx.type === 'credit';
  return (
    <li
      className="flex items-center gap-3 p-3 rounded-xl transition cursor-pointer"
      onMouseEnter={e => { (e.currentTarget as HTMLLIElement).style.background = T.canvas; }}
      onMouseLeave={e => { (e.currentTarget as HTMLLIElement).style.background = 'transparent'; }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={isCredit ? { background: `${T.orange}14`, color: T.orange } : { background: T.redBg, color: T.red }}
      >
        {isCredit ? <FiArrowDown size={16} /> : <FiArrowUp size={16} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: T.ink }}>{tx.label}</p>
        <p className="text-xs" style={{ color: T.muted }}>{new Date(tx.date).toLocaleString()}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold tabular-nums" style={{ color: isCredit ? T.ink : T.red }}>
          {isCredit ? '+' : '-'}{tx.amount} NC
        </p>
        <p className="text-[10px]" style={{ color: T.muted }}>Completed</p>
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
        className="rounded-3xl w-full max-w-sm p-6 space-y-4"
        style={{ background: T.paper }}
      >
        <h3 className="font-bold text-lg" style={{ color: T.ink }}>Top up wallet</h3>
        <div className="grid grid-cols-4 gap-2">
          {presets.map(p => (
            <button
              key={p}
              onClick={() => setAmount(String(p))}
              className="py-2 rounded-xl text-sm font-semibold transition"
              style={
                amount === String(p)
                  ? { background: T.orange, color: '#fff', border: `1px solid ${T.orange}` }
                  : { background: T.canvas, color: T.ink, border: `1px solid ${T.line}` }
              }
            >
              {p}
            </button>
          ))}
        </div>
        <input
          type="number"
          placeholder="Or enter custom amount"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="w-full rounded-2xl p-3 text-sm outline-none focus:ring-2"
          style={{ border: `1px solid ${T.line}`, color: T.ink, ['--tw-ring-color' as any]: `${T.orange}55` }}
        />
        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 rounded-2xl py-3 text-sm font-semibold" style={{ border: `1px solid ${T.line}`, color: T.muted }}>
            Cancel
          </button>
          <button
            onClick={() => onConfirm(Number(amount))}
            className="flex-1 rounded-2xl py-3 text-sm font-semibold text-white transition"
            style={{ background: T.orange }}
          >
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
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="rounded-3xl w-80 p-6 space-y-4" style={{ background: T.paper }}>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto" style={{ background: `${T.orange}1A` }}>
          <FiLock size={22} style={{ color: T.orange }} />
        </div>
        <h3 className="font-bold text-center" style={{ color: T.ink }}>Set Wallet PIN</h3>
        <input
          type="password" maxLength={4} placeholder="Enter 4-digit PIN" value={pin} onChange={e => setPin(e.target.value)}
          className="w-full rounded-2xl p-3 text-center text-xl tracking-[8px] outline-none focus:ring-2"
          style={{ border: `1px solid ${T.line}`, color: T.ink, ['--tw-ring-color' as any]: `${T.orange}55` }}
        />
        <input
          type="password" maxLength={4} placeholder="Confirm PIN" value={confirmPin} onChange={e => setConfirm(e.target.value)}
          className="w-full rounded-2xl p-3 text-center text-xl tracking-[8px] outline-none focus:ring-2"
          style={{ border: `1px solid ${T.line}`, color: T.ink, ['--tw-ring-color' as any]: `${T.orange}55` }}
        />
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-2xl py-3 text-sm font-semibold" style={{ border: `1px solid ${T.line}`, color: T.muted }}>
            Cancel
          </button>
          <button
            disabled={loading}
            onClick={submit}
            className="flex-1 rounded-2xl py-3 text-sm font-semibold text-white transition disabled:opacity-60"
            style={{ background: T.orange }}
          >
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
      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="rounded-3xl w-full max-w-sm p-6 space-y-4" style={{ background: T.paper }}>
        <h3 className="font-bold text-lg" style={{ color: T.ink }}>Withdraw funds</h3>
        <div className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: T.canvas, border: `1px solid ${T.line}` }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold" style={{ background: `${T.ink}0D`, color: T.ink }}>M</div>
          <div>
            <p className="text-sm font-semibold" style={{ color: T.ink }}>M-Pesa</p>
            <p className="text-xs" style={{ color: T.muted }}>Instant transfer</p>
          </div>
        </div>
        <input
          type="text" placeholder="Phone number (2547XXXXXXXX)" value={phone} onChange={e => setPhone(e.target.value)}
          className="w-full rounded-2xl p-3 text-sm outline-none focus:ring-2"
          style={{ border: `1px solid ${T.line}`, color: T.ink, ['--tw-ring-color' as any]: `${T.orange}55` }}
        />
        <input
          type="number" placeholder="Amount (KES)" value={amount} onChange={e => setAmount(e.target.value)}
          className="w-full rounded-2xl p-3 text-sm outline-none focus:ring-2"
          style={{ border: `1px solid ${T.line}`, color: T.ink, ['--tw-ring-color' as any]: `${T.orange}55` }}
        />
        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 rounded-2xl py-3 text-sm font-semibold" style={{ border: `1px solid ${T.line}`, color: T.muted }}>
            Cancel
          </button>
          <button
            onClick={() => onConfirm(Number(amount), 'mpesa', phone)}
            className="flex-1 rounded-2xl py-3 text-sm font-semibold text-white transition"
            style={{ background: T.orange }}
          >
            Continue
          </button>
        </div>
      </motion.div>
    </div>
  );
}