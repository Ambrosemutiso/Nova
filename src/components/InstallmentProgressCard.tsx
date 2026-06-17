'use client';

import { useEffect, useMemo, useState } from 'react';
import { CldImage } from 'next-cloudinary';
import { motion, AnimatePresence } from 'framer-motion';
import GlobalPayModal from '@/components/payments/GlobalPayModal';
import {
  CheckCircle2, TrendingUp, ShieldCheck, Calendar,
  MapPin, X, PackageCheck, Truck, ChevronRight, Lock,
  Flame, Trophy
} from 'lucide-react';

export const countyTownMap: Record<string, string[]> = {
  Nairobi: ['Westlands', 'Kasarani', 'Embakasi', 'Langata', 'Dagoretti', 'Starehe', 'Makadara', 'Kibra'],
  Mombasa: ['Nyali', 'Likoni', 'Kisauni', 'Changamwe', 'Mvita', 'Jomvu'],
  Kisumu: ['Kisumu Central', 'Kisumu East', 'Kisumu West', 'Muhoroni', 'Nyando', 'Seme'],
  Nakuru: ['Nakuru Town East', 'Nakuru Town West', 'Naivasha', 'Gilgil', 'Subukia', 'Molo', 'Bahati'],
  Kiambu: ['Thika', 'Ruiru', 'Juja', 'Limuru', 'Kikuyu', 'Githunguri', 'Kabete'],
  Machakos: ['Machakos Town', 'Kangundo', 'Mwala', 'Kathiani', 'Mavoko', 'Yatta'],
  "Murang'a": ["Murang'a Town", 'Kandara', 'Kangema', 'Maragua', 'Kiharu', 'Mathioya'],
  Nyeri: ['Nyeri Town', 'Othaya', 'Tetu', 'Mathira', 'Mukurweini', 'Kieni'],
  Kirinyaga: ['Kerugoya', 'Kutus', 'Sagana', 'Baricho', 'Mwea'],
  Meru: ['Meru Town', 'Maua', 'Nkubu', 'Timau', 'Tigania', 'Igembe'],
  Embu: ['Embu Town', 'Runyenjes', 'Manyatta', 'Siakago'],
  TharakaNithi: ['Chuka', 'Chogoria', 'Marimanti', 'Kanyanga'],
  Kitui: ['Kitui Town', 'Mutomo', 'Mwingi', 'Kabati', 'Kwa Vonza'],
  Makueni: ['Wote', 'Mukuyuni', 'Makindu', 'Kibwezi', 'Mtito Andei', 'Emali', 'Sultan Hamud'],
  Nyandarua: ['Ol Kalou', 'Engineer', 'Njabini', 'Ndemi', 'Kinangop'],
  Laikipia: ['Nanyuki', 'Rumuruti', 'Nyahururu', 'Kinamba', 'Doldol'],
  Turkana: ['Lodwar', 'Kakuma', 'Lokichogio', 'Lorugum'],
  WestPokot: ['Kapenguria', 'Makutano', 'Chepareria', 'Sigor'],
  Samburu: ['Maralal', 'Baragoi', 'Wamba'],
  TransNzoia: ['Kitale', 'Endebess', 'Kiminini', 'Cherangany'],
  UasinGishu: ['Eldoret', 'Turbo', 'Ziwa', 'Moiben', 'Kesses'],
  ElgeyoMarakwet: ['Iten', 'Tambach', 'Chebiemit', 'Kapsowar'],
  Nandi: ['Kapsabet', 'Nandi Hills', 'Mosoriot', 'Kobujoi'],
  Baringo: ['Kabarnet', 'Eldama Ravine', 'Marigat', 'Mogotio'],
  Kericho: ['Kericho Town', 'Litein', 'Londiani', 'Kipkelion'],
  Bomet: ['Bomet Town', 'Sotik', 'Longisa', 'Chepalungu'],
  Kakamega: ['Kakamega Town', 'Mumias', 'Lugari', 'Malava', 'Matungu'],
  Bungoma: ['Bungoma Town', 'Webuye', 'Kimilili', 'Chwele', 'Sirisia'],
  Busia: ['Busia Town', 'Nambale', 'Malaba', 'Butula', 'Funyula'],
  Siaya: ['Siaya Town', 'Bondo', 'Ugunja', 'Gem', 'Alego Usonga'],
  HomaBay: ['Homa Bay Town', 'Rongo', 'Mbita', 'Ndhiwa', 'Kabondo'],
  Migori: ['Migori Town', 'Awendo', 'Rongo', 'Kehancha', 'Isebania'],
  Kisii: ['Kisii Town', 'Ogembo', 'Nyamache', 'Keroka'],
  Nyamira: ['Nyamira Town', 'Keroka', 'Ekerenyo', 'Nyansiongo'],
  Narok: ['Narok Town', 'Kilgoris', "Ololulung'a", 'Suswa'],
  Kajiado: ['Kajiado Town', 'Ngong', 'Kitengela', 'Ongata Rongai', 'Loitokitok'],
  Kwale: ['Ukunda', 'Msambweni', 'Lunga Lunga', 'Kinango'],
  Kilifi: ['Kilifi Town', 'Malindi', 'Kaloleni', 'Rabai', 'Mariakani'],
  TaitaTaveta: ['Voi', 'Taveta', 'Wundanyi', 'Mwatate'],
  Garissa: ['Garissa Town', 'Modogashe', 'Balambala', 'Dadaab'],
  Wajir: ['Wajir Town', 'Griftu', 'Habaswein', 'Eldas', 'Buna'],
  Mandera: ['Mandera Town', 'Elwak', 'Rhamu', 'Lafey'],
  Marsabit: ['Marsabit Town', 'Moyale', 'Laisamis', 'North Horr'],
  Isiolo: ['Isiolo Town', 'Kinna', 'Garbatulla', 'Merti'],
  TanaRiver: ['Hola', 'Garsen', 'Bura', 'Wenje'],
  Lamu: ['Lamu Town', 'Mpeketoni', 'Hindi', 'Faza'],
  Vihiga: ['Mbale', 'Luanda', 'Chavakali', 'Hamisi'],
};

type InstallmentPlan = {
  _id: string;
  status: 'active' | 'completed';
  orderId?: string;
  totalAmount: number;
  paidAmount: number;
  monthlyAmount: number;
  product?: {
    _id: string;
    name: string;
    images: string[];
    price: number;
    weight?: number;
  } | null;
};

interface Props {
  plan: InstallmentPlan;
}

const CONFETTI_COLORS = ['#f97316', '#facc15', '#34d399', '#60a5fa', '#f472b6', '#a78bfa'];
function Confetti() {
  const pieces = Array.from({ length: 40 }, (_, i) => i);
  return (
    <div className="pointer-events-none fixed inset-0 z-[200] overflow-hidden">
      {pieces.map((i) => (
        <div
          key={i}
          className="absolute top-0 w-2 h-3 rounded-sm opacity-90"
          style={{
            left: `${Math.random() * 100}%`,
            backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            animation: `installmentConfetti ${1.6 + Math.random() * 2}s ease-in ${Math.random() * 0.7}s forwards`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
      <style>{`
        @keyframes installmentConfetti {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function PaymentSuccessModal({
  amountPaid, newProgress, balance, isFullyPaid, onClose,
}: {
  amountPaid: number;
  newProgress: number;
  balance: number;
  isFullyPaid: boolean;
  onClose: () => void;
}) {
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
          <div className={`px-6 pt-8 pb-6 ${isFullyPaid ? 'bg-gradient-to-br from-emerald-400 to-teal-500' : 'bg-gradient-to-br from-orange-400 to-amber-500'}`}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 300 }}
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg"
            >
              {isFullyPaid ? <Trophy className="w-8 h-8 text-emerald-500" /> : <CheckCircle2 className="w-8 h-8 text-orange-500" />}
            </motion.div>
            <h2 className="text-white font-black text-2xl">
              {isFullyPaid ? "Fully Paid! 🎉" : 'Payment Successful! 🎉'}
            </h2>
            <p className={`text-sm mt-1 ${isFullyPaid ? 'text-emerald-50' : 'text-orange-50'}`}>
              {isFullyPaid ? "You own this — ready to ship" : `Ksh ${amountPaid.toLocaleString()} added to your plan`}
            </p>
          </div>

          <div className="px-6 py-5 space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1.5">
                <span>Your progress</span>
                <span className={isFullyPaid ? 'text-emerald-600' : 'text-orange-600'}>{Math.round(newProgress)}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${newProgress}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                  className={`h-full rounded-full ${isFullyPaid ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-orange-400 to-amber-500'}`}
                />
              </div>
            </div>

            {isFullyPaid ? (
              <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-left">
                <PackageCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <p className="text-xs text-emerald-700 leading-relaxed">This item is now 100% yours. Place your delivery order whenever you're ready.</p>
              </div>
            ) : (
              <div className="flex items-center gap-3 bg-orange-50 border border-orange-100 rounded-xl p-3 text-left">
                <Flame className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <p className="text-xs text-orange-700 leading-relaxed">
                  Only <strong>Ksh {balance.toLocaleString()}</strong> left. Keep the streak going — you're closer than ever.
                </p>
              </div>
            )}
          </div>

          <div className="px-6 pb-6">
            <button
              onClick={onClose}
              className={`w-full font-bold py-3.5 rounded-2xl transition active:scale-[0.98] shadow-md text-white
                ${isFullyPaid ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200' : 'bg-orange-500 hover:bg-orange-600 shadow-orange-200'}`}
            >
              {isFullyPaid ? 'Continue to Order' : 'Continue'}
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
}

export default function InstallmentProgressCard({ plan }: Props) {
  const [showPay, setShowPay] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastPaymentAmount, setLastPaymentAmount] = useState(0);

  const [county, setCounty] = useState('');
  const [town, setTown] = useState('');
  const [deliveryFee, setDeliveryFee] = useState(0);

  const product = plan.product;

  const totalAmount = Number(plan.totalAmount ?? 0);
  const paidAmount = Number(plan.paidAmount ?? 0);
  const monthlyAmount = Number(plan.monthlyAmount ?? 0);
  const balance = Math.max(totalAmount - paidAmount, 0);

  const progress = useMemo(() => {
    if (totalAmount === 0) return 0;
    return Math.min((paidAmount / totalAmount) * 100, 100);
  }, [paidAmount, totalAmount]);

  const fullyPaid = plan.status === 'completed';
  const hasOrder = Boolean(plan.orderId);
  const monthsLeft = monthlyAmount > 0 ? Math.ceil(balance / monthlyAmount) : 0;

  const buyerId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

  const productWeight = product?.weight ?? 1;

  const calculateDeliveryFee = (weight: number) => {
    const baseWeight = 5;
    const basePrice = 200;
    const extraPerKg = 30;
    if (weight <= baseWeight) return basePrice;
    const extraKg = Math.ceil(weight - baseWeight);
    return basePrice + extraKg * extraPerKg;
  };

  useEffect(() => {
    if (!county) { setDeliveryFee(0); return; }
    setDeliveryFee(calculateDeliveryFee(productWeight));
  }, [county, productWeight]);

  const getPublicId = (url?: string) => {
    if (!url) return '';
    const match = url.match(/\/upload\/(?:v\d+\/)?([^.]+)/);
    return match ? match[1] : url;
  };

  const paymentAmount = Math.min(monthlyAmount, balance);
  const projectedNewPaid = paidAmount + paymentAmount;
  const projectedProgress = totalAmount > 0 ? Math.min((projectedNewPaid / totalAmount) * 100, 100) : 0;
  const projectedFullyPaid = projectedNewPaid >= totalAmount;
  const projectedBalance = Math.max(totalAmount - projectedNewPaid, 0);

  const handlePaySuccess = () => {
    setLastPaymentAmount(paymentAmount);
    setShowPay(false);
    setShowSuccess(true);
  };

  const milestoneLabel =
    progress >= 90 ? "Almost there — final stretch!" :
    progress >= 75 ? "You're 3/4 of the way there" :
    progress >= 50 ? "Halfway there — keep going!" :
    progress >= 25 ? "Great start — building momentum" :
    "Your ownership journey begins";

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        <div className={`flex items-center justify-between px-5 py-3 border-b ${fullyPaid ? 'bg-emerald-50 border-emerald-100' : 'bg-orange-50 border-orange-100'}`}>
          <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${fullyPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
            {fullyPaid ? <CheckCircle2 size={11} /> : <TrendingUp size={11} />}
            {fullyPaid ? 'Fully Paid' : 'Active Plan'}
          </span>
          {!fullyPaid && monthsLeft > 0 && (
            <span className="text-[11px] text-gray-500 font-medium flex items-center gap-1">
              <Calendar size={10} /> ~{monthsLeft} payment{monthsLeft !== 1 ? 's' : ''} left
            </span>
          )}
        </div>

        <div className="p-5 space-y-4">
          <div className="flex gap-4">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
              {product?.images?.[0] ? (
                <CldImage src={getPublicId(product.images[0])} width="120" height="120" crop="fill" alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300"><PackageCheck size={20} /></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-800 text-sm leading-snug line-clamp-2 mb-1.5">{product?.name ?? 'Product'}</h3>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500">
                <span>Total <strong className="text-gray-700">Ksh {totalAmount.toLocaleString()}</strong></span>
                <span>Paid <strong className="text-emerald-600">Ksh {paidAmount.toLocaleString()}</strong></span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-baseline mb-1.5">
              <p className={`text-xs font-bold ${fullyPaid ? 'text-emerald-600' : 'text-orange-600'}`}>{milestoneLabel}</p>
              <span className="text-sm font-black text-gray-800">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`h-full rounded-full ${fullyPaid ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-orange-400 to-amber-500'}`}
              />
              {[25, 50, 75].map(mark => (
                <div key={mark} className="absolute top-0 bottom-0 w-px bg-white/60" style={{ left: `${mark}%` }} />
              ))}
            </div>
          </div>

          {!fullyPaid && (
            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
              <div>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Remaining balance</p>
                <p className="text-lg font-black text-gray-800">Ksh {balance.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Next payment</p>
                <p className="text-sm font-bold text-orange-600">Ksh {Math.min(monthlyAmount, balance).toLocaleString()}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 text-[11px] text-gray-400">
            <ShieldCheck size={12} className="text-emerald-400 flex-shrink-0" />
            <span>Your payments are protected. Item ships only when fully paid.</span>
          </div>

          {fullyPaid ? (
            hasOrder ? (
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                <Truck size={16} className="text-blue-500 flex-shrink-0" />
                <p className="text-sm font-semibold text-blue-700">Order placed — awaiting delivery</p>
              </div>
            ) : (
              <button
                onClick={() => setShowOrderModal(true)}
                className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-2xl transition shadow-md shadow-emerald-200"
              >
                <PackageCheck size={16} /> Place Order Now
              </button>
            )
          ) : (
            <button
              onClick={() => setShowPay(true)}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-3 rounded-2xl transition shadow-md shadow-orange-200"
            >
              <Lock size={14} /> Pay Ksh {Math.min(monthlyAmount, balance).toLocaleString()} Now
            </button>
          )}

          {!fullyPaid && progress > 0 && (
            <p className="text-[11px] text-center text-gray-400 leading-relaxed">
              You've already invested <strong className="text-gray-600">Ksh {paidAmount.toLocaleString()}</strong> toward this item.
              Missing payments may affect your installment eligibility for future purchases.
            </p>
          )}
        </div>
      </div>

      {showPay && buyerId && (
        <GlobalPayModal
          payload={{
            amount: paymentAmount,
            items: [],
            deliveryFee: 0,
            county: '',
            town: '',
            userId: buyerId,
            purpose: 'installment-monthly',
            refId: plan._id,
          }}
          onClose={() => setShowPay(false)}
          onSuccess={handlePaySuccess}
        />
      )}

      <AnimatePresence>
        {showSuccess && (
          <PaymentSuccessModal
            amountPaid={lastPaymentAmount}
            newProgress={projectedProgress}
            balance={projectedBalance}
            isFullyPaid={projectedFullyPaid}
            onClose={() => { setShowSuccess(false); window.location.reload(); }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showOrderModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(5,7,12,0.55)', backdropFilter: 'blur(6px)' }}
            onClick={() => setShowOrderModal(false)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 12 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.94, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden"
            >
              <div className="bg-gradient-to-br from-emerald-500 to-teal-500 px-6 py-5 text-center relative">
                <button onClick={() => setShowOrderModal(false)} className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition">
                  <X size={14} />
                </button>
                <Trophy className="w-8 h-8 text-white mx-auto mb-2" />
                <h3 className="text-white font-black text-lg">This Item is Yours!</h3>
                <p className="text-emerald-50 text-xs mt-0.5">Choose where to deliver it</p>
              </div>

              <div className="p-6 space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">County</label>
                  <select
                    value={county}
                    onChange={(e) => setCounty(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition"
                  >
                    <option value="">Select County</option>
                    {Object.keys(countyTownMap).map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {county && (
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1.5">Town</label>
                    <select
                      value={town}
                      onChange={(e) => setTown(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition"
                    >
                      <option value="">Select Town</option>
                      {countyTownMap[county].map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                )}

                {county && (
                  <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                    <span className="text-xs text-gray-500 flex items-center gap-1.5"><MapPin size={11} /> Delivery fee</span>
                    <span className="text-sm font-black text-gray-800">Ksh {deliveryFee.toLocaleString()}</span>
                  </div>
                )}

                <button
                  disabled={!county || !town}
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/orders/from-installments', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ installmentId: plan._id, county, town, deliveryFee, userId: buyerId }),
                      });
                      const data = await res.json();
                      if (!res.ok) { alert(data.error || 'Failed to place order'); return; }
                      setShowOrderModal(false);
                      window.location.reload();
                    } catch {
                      alert('Something went wrong. Please try again.');
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-2xl transition shadow-md shadow-emerald-200"
                >
                  <ChevronRight size={15} /> Confirm Delivery
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}