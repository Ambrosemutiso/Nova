'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  X, ShieldCheck, Zap, CheckCircle2, Calendar, Wallet,
  TrendingDown, Lock, Sparkles, ArrowRight, Loader2,
  AlertCircle, PartyPopper,
} from 'lucide-react';

/* ══════════════════════════════════════════════════════════════
   CONFETTI (CSS-only)
══════════════════════════════════════════════════════════════ */
const CONFETTI_COLORS = ['#f97316', '#facc15', '#34d399', '#60a5fa', '#f472b6', '#a78bfa'];
function Confetti() {
  const pieces = Array.from({ length: 40 }, (_, i) => i);
  return (
    <div className="pointer-events-none fixed inset-0 z-[10000] overflow-hidden">
      {pieces.map((i) => (
        <div
          key={i}
          className="absolute top-0 w-2 h-3 rounded-sm opacity-90"
          style={{
            left: `${Math.random() * 100}%`,
            backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            animation: `confettiFall ${1.5 + Math.random() * 2}s ease-in ${Math.random() * 0.6}s forwards`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TRUST ROW
══════════════════════════════════════════════════════════════ */
function TrustItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-xl px-2.5 py-2">
      <span className="text-orange-500">{icon}</span>
      <span className="text-[10.5px] font-semibold text-gray-600 leading-tight">{label}</span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN MODAL
══════════════════════════════════════════════════════════════ */
export default function InstallmentModal({ product, onClose, user }: any) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [buyerId, setBuyerId] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (user?._id) {
      setBuyerId(user._id);
    } else {
      const stored = localStorage.getItem('userId');
      if (stored) setBuyerId(stored);
    }
  }, [user]);

  const months        = product.installmentMonths || 6;
  const totalAmount    = product.calculatedPrice ?? 0;
  const depositPercent = product.installmentDepositPercent ?? 20;
  const deposit         = product.depositAmount ?? Math.ceil(totalAmount * (depositPercent / 100));
  const remaining        = totalAmount - deposit;
  const monthlyAmount    = Math.round(remaining / months);
  const isSuccess        = result?.success;

  const handleCreateInstallment = async () => {
    if (!buyerId) {
      setResult({ error: 'Please log in to continue.' });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/installments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyerId, productId: product._id }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setResult({ error: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
          initial={{ y: 40, scale: 0.97, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          exit={{ y: 20, scale: 0.97, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
        >

          {/* ══════════ SUCCESS STATE ══════════ */}
          {isSuccess ? (
            <>
              <Confetti />
              <div className="relative">
                {/* close */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30
                    flex items-center justify-center text-white transition-colors"
                >
                  <X size={16} />
                </button>

                {/* top gradient */}
                <div className="bg-gradient-to-br from-orange-400 to-pink-500 px-6 pt-10 pb-8 text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <PartyPopper className="w-8 h-8 text-orange-500" />
                  </div>
                  <h2 className="text-white font-black text-2xl">You're Approved! 🎉</h2>
                  <p className="text-orange-100 text-sm mt-1">Your installment plan is now active</p>
                </div>
              </div>

              <div className="px-6 py-5 space-y-4 overflow-y-auto">
                {/* plan summary card */}
                <div className="bg-gray-50 rounded-2xl p-4 space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Product</span>
                    <span className="font-semibold text-gray-900 text-right line-clamp-1 max-w-[60%]">{product.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Deposit paid today</span>
                    <span className="font-bold text-orange-600">Ksh {deposit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Monthly payment</span>
                    <span className="font-bold text-gray-900">Ksh {monthlyAmount.toLocaleString()} × {months}</span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {[
                    { icon: <CheckCircle2 className="w-4 h-4 text-orange-500" />, text: 'Your product will be reserved and prepared for delivery' },
                    { icon: <Calendar className="w-4 h-4 text-orange-500" />, text: `First payment reminder ${months > 0 ? 'in 30 days' : 'soon'}` },
                    { icon: <ShieldCheck className="w-4 h-4 text-orange-500" />, text: 'Track your plan anytime from My Installments' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                        {item.icon}
                      </div>
                      <p className="text-sm text-gray-700">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                <button
                  onClick={onClose}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5
                    rounded-2xl transition active:scale-[0.98] shadow-md shadow-orange-200"
                >
                  Done
                </button>
              </div>
            </>

          ) : (
            /* ══════════ DEFAULT / FORM STATE ══════════ */
            <>
              {/* header */}
              <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                    <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">Lipa Mdogo Mdogo</span>
                  </div>
                  <h2 className="text-base font-black text-gray-900 leading-snug line-clamp-2">{product.name}</h2>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors shrink-0"
                >
                  <X size={16} className="text-gray-600" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

                {/* price breakdown — visual */}
                <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-5 text-white">
                  <p className="text-[10px] font-semibold text-orange-100 uppercase tracking-wider mb-3">Payment Plan</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Total Price', value: `Ksh ${totalAmount.toLocaleString()}` },
                      { label: 'Deposit Today', value: `Ksh ${deposit.toLocaleString()}` },
                      { label: 'Per Month', value: `Ksh ${monthlyAmount.toLocaleString()}` },
                    ].map((item) => (
                      <div key={item.label} className="bg-white/15 rounded-xl px-2.5 py-2.5 text-center">
                        <p className="text-[9px] text-orange-100 font-medium leading-tight">{item.label}</p>
                        <p className="text-sm font-black mt-1 leading-tight">{item.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5 mt-3 justify-center">
                    <Calendar className="w-3.5 h-3.5 text-orange-100" />
                    <p className="text-xs text-orange-100">
                      Pay over <strong className="text-white">{months} months</strong>
                    </p>
                  </div>
                </div>

                {/* visual payment timeline */}
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">How it works</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center shrink-0">1</div>
                      <p className="text-sm text-gray-700">
                        Pay <strong className="text-gray-900">Ksh {deposit.toLocaleString()}</strong> deposit today
                      </p>
                    </div>
                    <div className="ml-3.5 border-l-2 border-dashed border-gray-200 h-3" />
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center shrink-0">2</div>
                      <p className="text-sm text-gray-700">
                        Product is reserved & shipped to you
                      </p>
                    </div>
                    <div className="ml-3.5 border-l-2 border-dashed border-gray-200 h-3" />
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center shrink-0">3</div>
                      <p className="text-sm text-gray-700">
                        Pay <strong className="text-gray-900">Ksh {monthlyAmount.toLocaleString()}/mo</strong> for {months} months
                      </p>
                    </div>
                  </div>
                </div>

                {/* trust grid */}
                <div className="grid grid-cols-2 gap-2">
                  <TrustItem icon={<ShieldCheck className="w-3.5 h-3.5" />} label="No hidden fees" />
                  <TrustItem icon={<Lock className="w-3.5 h-3.5" />} label="Secure & encrypted" />
                  <TrustItem icon={<Zap className="w-3.5 h-3.5" />} label="Instant approval" />
                  <TrustItem icon={<TrendingDown className="w-3.5 h-3.5" />} label="Flexible terms" />
                </div>

                {/* policy note if available */}
                {product.installmentPolicy && (
                  <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl p-3">
                    <AlertCircle className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-blue-700 leading-relaxed">{product.installmentPolicy}</p>
                  </div>
                )}

                {/* agreement checkbox */}
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400"
                  />
                  <span className="text-xs text-gray-500 leading-relaxed">
                    I understand and agree to pay the deposit today and the remaining balance in {months} monthly installments.
                  </span>
                </label>

                {/* error */}
                {result?.error && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl p-3">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <p className="text-xs text-red-600">{result.error}</p>
                  </div>
                )}
              </div>

              {/* footer CTA */}
              <div className="px-6 pb-6 pt-3 border-t border-gray-100">
                <button
                  onClick={handleCreateInstallment}
                  disabled={loading || !agreed}
                  className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600
                    disabled:opacity-40 disabled:cursor-not-allowed
                    text-white font-bold py-3.5 rounded-2xl transition active:scale-[0.98]
                    shadow-md shadow-orange-200 text-sm"
                >
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                    : <>Accept & Activate Plan <ArrowRight className="w-4 h-4" /></>
                  }
                </button>
                <p className="text-center text-[10px] text-gray-400 mt-2.5 flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3" /> Your payment information is encrypted and secure
                </p>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}