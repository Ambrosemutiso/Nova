'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { initiateCheckoutPayment } from '@/lib/checkoutPayment';
import {
  X, ShieldCheck, Lock, CheckCircle2, AlertCircle,
  Smartphone, ChevronRight, Eye, EyeOff, Globe,
} from 'lucide-react';

type Props = {
  payload: {
    amount: number;
    items: any[];
    deliveryFee: number;
    county: string;
    town: string;
    userId: string;
    purpose:
      | 'order'
      | 'installment-deposit'
      | 'installment-monthly'
      | 'wallet'
      | 'shop-upgrade';
    refId: string;
  };
  onClose: () => void;
  onSuccess: () => void;
};

const PURPOSE_LABELS: Record<string, string> = {
  order:                 'Order Payment',
  'installment-deposit': 'Deposit Payment',
  'installment-monthly': 'Monthly Instalment',
  wallet:                'Wallet Top-up',
  'shop-upgrade':        'Shop Upgrade',
};

export default function WalletPayModal({ payload, onClose, onSuccess }: Props) {
  const [phone, setPhone]           = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [showPhone, setShowPhone]   = useState(false);
  const [step, setStep]             = useState<'select' | 'confirm' | 'processing'>('select');

  const safeAmount   = Math.round(Number(payload.amount));
  const purposeLabel = PURPOSE_LABELS[payload.purpose] ?? 'Payment';
  const deliveryFee  = Number(payload.deliveryFee) || 0;
  const subtotal     = safeAmount - deliveryFee;

  const isValidPhone   = (v: string) => /^(07\d{8}|2547\d{8})$/.test(v);
  const normalizePhone = (v: string) => v.startsWith('0') ? v.replace(/^0/, '254') : v;
  const maskedPhone    = phone.length >= 4
    ? phone.slice(0, 4) + '••••' + phone.slice(-2)
    : phone;

  // lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleTelcoPayment = async () => {
    await initiateCheckoutPayment({
      phone: normalizePhone(phone),
      method: 'mpesa',
      amount: safeAmount,
      items: payload.items,
      deliveryFee: payload.deliveryFee,
      county: payload.county,
      town: payload.town,
      userId: payload.userId,
      purpose: payload.purpose,
      refId: payload.refId,
      onSuccess: () => { setProcessing(false); onClose(); onSuccess(); },
      onFailure: () => { setProcessing(false); setError('Payment failed or cancelled'); setStep('select'); },
    });
  };

  const handlePay = async () => {
    setError(null);
    if (!safeAmount || safeAmount < 1) { setError('Invalid payment amount'); return; }
    if (!isValidPhone(phone)) { setError('Enter a valid Safaricom number (07XX or 2547XX)'); return; }
    setProcessing(true);
    setStep('processing');
    await handleTelcoPayment();
  };

  const handleContinue = () => {
    setError(null);
    if (!isValidPhone(phone)) { setError('Enter a valid Safaricom number (07XX or 2547XX)'); return; }
    if (!safeAmount || safeAmount < 1) { setError('Invalid payment amount'); return; }
    setStep('confirm');
  };

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-end md:items-center md:justify-end"
        style={{ background: 'rgba(5,7,12,0.72)', backdropFilter: 'blur(6px)' }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        {/* ── Drawer / sidebar ─────────────────────────────────────── */}
        <motion.div
          key="drawer"
          initial={{ y: '100%', opacity: 0.8 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 340, damping: 36 }}
          className="
            w-full md:w-[420px] md:h-full
            bg-[#0f1117] text-white
            rounded-t-3xl md:rounded-none
            overflow-hidden flex flex-col
            relative
          "
          style={{ maxHeight: '96vh' }}
        >
          {/* Subtle top glow */}
          <div
            aria-hidden
            className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(ellipse, rgba(249,115,22,0.14) 0%, transparent 70%)', filter: 'blur(20px)' }}
          />

          {/* ── Header ───────────────────────────────────────────────── */}
          <div className="relative flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/[0.07] flex-shrink-0">
            {/* Drag handle — mobile only */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-9 h-1 rounded-full bg-white/20 md:hidden" />

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                <Lock size={14} className="text-orange-400" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none mb-0.5">
                  {purposeLabel}
                </p>
                <p className="text-sm font-bold text-white leading-none">Secure Checkout</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition"
            >
              <X size={15} />
            </button>
          </div>

          {/* ── Scrollable body ──────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto scrollbar-none px-6 py-5 space-y-5">

            {/* Amount card */}
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #1a1d27 0%, #161920 100%)',
                border: '1px solid rgba(249,115,22,0.18)',
              }}
            >
              <div
                aria-hidden
                className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(ellipse, rgba(249,115,22,0.12) 0%, transparent 70%)', filter: 'blur(24px)' }}
              />
              <div className="relative px-5 py-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40 mb-1">Total due</p>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-3xl font-black text-white tracking-tight">
                    Ksh {safeAmount.toLocaleString()}
                  </span>
                </div>
                {deliveryFee > 0 && (
                  <div className="space-y-1 pt-3 border-t border-white/[0.07]">
                    <div className="flex justify-between text-xs text-white/50">
                      <span>Items subtotal</span>
                      <span>Ksh {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs text-white/50">
                      <span>Delivery fee</span>
                      <span className={deliveryFee === 0 ? 'text-emerald-400' : ''}>
                        {deliveryFee === 0 ? 'FREE' : `Ksh ${deliveryFee.toLocaleString()}`}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  className="flex items-center gap-2.5 px-4 py-3 bg-red-500/10 border border-red-500/25 rounded-xl"
                >
                  <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-300 font-medium">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Step: select ─────────────────────────────────────────── */}
            {step === 'select' && (
              <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">

                {/* M-Pesa method tile (single option, shown as selected state) */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40 mb-3">
                    Payment method
                  </p>
                  <div
                    className="w-full flex items-center gap-3 p-4 rounded-2xl border"
                    style={{ borderColor: 'rgba(34,197,94,0.5)', background: 'rgba(34,197,94,0.06)' }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(34,197,94,0.15)' }}>
                      <Smartphone size={18} className="text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white">M-Pesa</p>
                      <p className="text-xs text-white/40 mt-0.5">Safaricom STK push · instant</p>
                    </div>
                    <div className="w-5 h-5 rounded-full border-2 border-green-500 bg-green-500 flex items-center justify-center">
                      <CheckCircle2 size={12} className="text-white" />
                    </div>
                  </div>
                </div>

                {/* Phone input */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40 mb-2">
                    M-Pesa number
                  </p>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 flex items-center gap-1.5">
                      <span className="text-xs text-white/30">🇰🇪</span>
                      <span className="text-xs text-white/30 border-r border-white/10 pr-2">KE</span>
                    </div>
                    <input
                      value={phone}
                      onChange={e => setPhone(e.target.value.trim())}
                      type={showPhone ? 'text' : 'tel'}
                      inputMode="numeric"
                      placeholder="0712 345 678"
                      className="
                        w-full bg-white/5 border border-white/10 rounded-xl
                        pl-16 pr-12 py-3.5 text-sm text-white
                        placeholder:text-white/25
                        focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/15
                        transition-all
                      "
                    />
                    <button
                      type="button"
                      onClick={() => setShowPhone(p => !p)}
                      className="absolute right-3.5 text-white/30 hover:text-white/60 transition"
                    >
                      {showPhone ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  <p className="text-[11px] text-white/25 mt-1.5 pl-0.5">
                    You'll receive an STK push notification to confirm.
                  </p>
                </div>

                {/* Trust signals */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[
                    { icon: ShieldCheck, label: '256-bit SSL',  sub: 'Encrypted'  },
                    { icon: Lock,        label: 'PCI-DSS',      sub: 'Compliant'  },
                    { icon: Globe,       label: 'CBK Licensed', sub: 'Payment'    },
                  ].map(({ icon: Icon, label, sub }, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                    >
                      <Icon size={14} className="text-emerald-400/80" />
                      <p className="text-[10px] font-bold text-white/50 leading-tight text-center">{label}</p>
                      <p className="text-[9px] text-white/25 leading-none">{sub}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Step: confirm ─────────────────────────────────────────── */}
            {step === 'confirm' && (
              <motion.div key="confirm" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] divide-y divide-white/[0.06]">
                  {[
                    { label: 'Method',  value: 'M-Pesa STK Push' },
                    { label: 'Number',  value: maskedPhone, mono: true },
                    { label: 'Amount',  value: `Ksh ${safeAmount.toLocaleString()}`, highlight: true },
                    { label: 'Purpose', value: purposeLabel },
                  ].map(({ label, value, mono, highlight }) => (
                    <div key={label} className="flex justify-between items-center px-4 py-3" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                      <span className="text-xs text-white/40 font-medium">{label}</span>
                      <span className={`text-sm font-bold ${highlight ? 'text-orange-400' : 'text-white'} ${mono ? 'font-mono' : ''}`}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

                <div
                  className="flex items-start gap-2.5 rounded-xl px-4 py-3"
                  style={{ background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.2)' }}
                >
                  <ShieldCheck size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-200/70 leading-relaxed">
                    This transaction is protected by NovaXmax Buyer Protection. Your money is safe until you confirm delivery.
                  </p>
                </div>

                <button
                  onClick={() => setStep('select')}
                  className="text-xs text-white/35 hover:text-white/60 transition flex items-center gap-1"
                >
                  ← Change payment details
                </button>
              </motion.div>
            )}

            {/* ── Step: processing ──────────────────────────────────────── */}
            {step === 'processing' && (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-8 space-y-5"
              >
                {/* Animated security pulse */}
                <div className="relative flex items-center justify-center">
                  {[1, 1.6, 2.2].map((scale, i) => (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, scale], opacity: [0.35, 0] }}
                      transition={{ duration: 1.8, delay: i * 0.5, repeat: Infinity, ease: 'easeOut' }}
                      className="absolute w-14 h-14 rounded-full"
                      style={{ border: '1px solid rgba(249,115,22,0.4)' }}
                    />
                  ))}
                  <div
                    className="relative w-14 h-14 rounded-2xl flex items-center justify-center z-10"
                    style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)' }}
                  >
                    <Lock size={20} className="text-orange-400" />
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-base font-bold text-white mb-1">Check your phone</p>
                  <p className="text-sm text-white/40 leading-relaxed max-w-[240px] text-center">
                    An M-Pesa prompt has been sent to your phone. Enter your PIN to complete.
                  </p>
                </div>

                <div
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <Smartphone size={13} className="text-green-400" />
                  <span className="text-xs text-white/50 font-medium">
                    Sent to <span className="text-white/80 font-mono">{maskedPhone}</span>
                  </span>
                </div>

                <div className="w-full rounded-full h-1 overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #f97316, #fbbf24)' }}
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 30, ease: 'linear' }}
                  />
                </div>
              </motion.div>
            )}
          </div>

          {/* ── Footer CTA ───────────────────────────────────────────── */}
          {step !== 'processing' && (
            <div
              className="flex-shrink-0 px-6 pb-6 pt-3 space-y-2.5"
              style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: '#0f1117' }}
            >
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={step === 'select' ? handleContinue : handlePay}
                disabled={processing}
                className="
                  w-full py-4 rounded-2xl font-bold text-sm text-white
                  flex items-center justify-center gap-2
                  transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
                style={{
                  background: 'linear-gradient(135deg, #f97316, #ea580c)',
                  boxShadow: '0 6px 28px rgba(249,115,22,0.35)',
                }}
              >
                {processing ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                      className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white"
                    />
                    Processing…
                  </>
                ) : step === 'select' ? (
                  <>Continue <ChevronRight size={16} /></>
                ) : (
                  <><Lock size={14} /> Confirm &amp; Pay Ksh {safeAmount.toLocaleString()}</>
                )}
              </motion.button>

              <button
                onClick={onClose}
                className="w-full py-2 text-xs text-white/25 hover:text-white/45 transition font-medium"
              >
                Cancel payment
              </button>

              <div className="flex items-center justify-center gap-1.5 pt-1">
                <Lock size={9} className="text-white/20" />
                <span className="text-[10px] text-white/20">
                  Secured by NovaXmax · 256-bit TLS encryption
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}