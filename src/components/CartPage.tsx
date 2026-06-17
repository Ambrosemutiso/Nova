'use client';

import { useState, useEffect, useRef } from 'react';
import { useCart } from '@/app/context/CartContext';
import { CldImage } from 'next-cloudinary';
import RecentlyViewed from '@/components/RecentlyViewed';
import SponsoredProducts from '@/components/SponsoredProducts';
import TopPicksForYou from '@/components/TopPicksForYou';
import SuggestedForYou from '@/components/SuggestedForYou';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { Player } from '@lottiefiles/react-lottie-player';
import GlobalPayModal from '@/components/payments/GlobalPayModal';
import UsedRefurbishedProducts from '@/components/RefurbishedProducts';
import {
  ChevronRight, RotateCcw, Truck, ShieldCheck, Headphones,
  Trash2, MapPin, Package, CreditCard, Smartphone, Lock,
  Info, ChevronDown, X,
} from 'lucide-react';

type CartProps = {
  onOpenBuyerLogin?: () => void;
  onOpenSellerLogin?: () => void;
};

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

/* ── tiny helpers ── */
function SectionHeading({ title, sub, cta }: { title: string; sub?: string; cta?: string }) {
  return (
    <div className="flex items-end justify-between mb-4">
      <div>
        <h2 className="text-lg font-black text-gray-900 leading-tight">{title}</h2>
        {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
      </div>
      {cta && (
        <button className="text-xs text-orange-600 font-semibold flex items-center gap-1 hover:underline shrink-0">
          {cta} <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={`transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} ${className}`}>
      {children}
    </div>
  );
}

function BottomTrustStrip() {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg,#1c1c1e 0%,#2d2d30 100%)' }}>
      <div className="px-6 py-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
        {[
          { icon: <ShieldCheck className="w-8 h-8 text-orange-400" />, title: '100% Buyer Protection', body: "Full refund if item doesn't arrive or isn't as described." },
          { icon: <Truck className="w-8 h-8 text-orange-400" />, title: 'Nationwide Delivery', body: 'Same-day Nairobi. 1–3 days to all 47 counties.' },
          { icon: <RotateCcw className="w-8 h-8 text-orange-400" />, title: 'Easy 7-Day Returns', body: 'Not happy? Return it within 7 days, no questions asked.' },
        ].map((item, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            {item.icon}
            <p className="text-white font-bold text-sm">{item.title}</p>
            <p className="text-gray-400 text-xs leading-relaxed">{item.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── styled select wrapper ── */
function SelectField({
  value, onChange, placeholder, children, icon,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          {icon}
        </div>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl
          py-3 pr-10 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400
          focus:border-transparent transition ${icon ? 'pl-9' : 'pl-4'}`}
      >
        <option value="">{placeholder}</option>
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN CART PAGE
══════════════════════════════════════════════════════════════════ */
export default function CartPage({ onOpenBuyerLogin }: CartProps) {
  const { cartItems, removeFromCart, increaseQuantity, decreaseQuantity, clearCart } = useCart();
  const router = useRouter();

  const [county, setCounty] = useState('');
  const [town, setTown] = useState('');
  const [towns, setTowns] = useState<string[]>([]);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);
  const [showGlobalPay, setShowGlobalPay] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null); // for exit animation

  useEffect(() => {
    setUserId(localStorage.getItem('userId'));
  }, []);

  const totalWeight = cartItems.reduce((sum, item) => sum + (item.weight || 1) * item.quantity, 0);

  const calculateDeliveryFee = (weight: number) => {
    const base = 200, baseWeight = 5, extraPerKg = 30;
    return weight <= baseWeight ? base : base + Math.ceil(weight - baseWeight) * extraPerKg;
  };

  useEffect(() => {
    setDeliveryFee(calculateDeliveryFee(totalWeight));
  }, [totalWeight]);

  useEffect(() => {
    if (county && countyTownMap[county]) {
      setTowns(countyTownMap[county]);
      setTown('');
    } else {
      setTowns([]);
    }
  }, [county]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.calculatedPrice * item.quantity, 0);
  const total = subtotal + deliveryFee;

  const handleCheckout = () => {
    if (!county || !town) { toast.warn('Please select your delivery location'); return; }
    setShowGlobalPay(true);
  };

  const confirmRemove = (id: string) => {
    setRemovingId(id);
    setTimeout(() => {
      removeFromCart(id);
      setItemToRemove(null);
      setRemovingId(null);
    }, 300);
  };

  const getPublicId = (url?: string) => {
    if (!url) return '';
    const m = url.match(/\/upload\/(?:v\d+\/)?([^.]+)/);
    return m ? m[1] : url;
  };

  /* ── Empty state ── */
  if (cartItems.length === 0)
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-112px)] pt-20 bg-gradient-to-b from-orange-50 to-white">
        <Player autoplay loop src="https://assets5.lottiefiles.com/packages/lf20_qh5z2fdq.json"
          style={{ height: '260px', width: '260px' }} />
        <h2 className="mt-4 text-xl font-bold text-gray-800">Your cart is empty</h2>
        <p className="text-sm text-gray-500 mt-1 mb-6">Looks like you haven't added anything yet.</p>
        <button
          onClick={() => router.push('/')}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-full
            transition shadow-lg shadow-orange-200 active:scale-95"
        >
          Start Shopping
        </button>
      </div>
    );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 pt-28 pb-16">

        {/* ── Page header ── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900">My Cart</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} ·{' '}
              <span className="text-orange-600 font-semibold">Ksh {subtotal.toLocaleString()}</span>
            </p>
          </div>
          <button
            onClick={() => { if (window.confirm('Clear all items?')) clearCart(); }}
            className="text-xs text-red-400 hover:text-red-600 font-medium flex items-center gap-1 transition"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* ══ LEFT — cart items ══ */}
          <div className="lg:col-span-2 space-y-3">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden
                  transition-all duration-300"
                style={{
                  opacity:    removingId === item.id ? 0 : 1,
                  transform:  removingId === item.id ? 'translateX(20px)' : 'translateX(0)',
                }}
              >
                <div className="flex gap-4 p-4">
                  {/* image */}
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                    <CldImage
                      src={getPublicId(item.images[0])}
                      alt={item.name}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 flex-1">
                        {item.name}
                      </h3>
                      {/* remove */}
                      <button
                        onClick={() => setItemToRemove(item.id)}
                        className="p-1.5 rounded-full hover:bg-red-50 text-gray-300 hover:text-red-500
                          transition-colors shrink-0"
                        aria-label="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* shipped from */}
                    <div className="flex items-center gap-1 mt-1 text-[11px] text-gray-400">
                      <MapPin className="w-3 h-3" />
                      <span>Shipped from {item.county}</span>
                    </div>

                    {/* price + qty row */}
                    <div className="flex items-center justify-between mt-3">
                      {/* quantity stepper */}
                      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-1 py-1">
                        <button
                          onClick={() => decreaseQuantity(item.id)}
                          className="w-7 h-7 rounded-lg bg-white border border-gray-200 text-gray-600
                            hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600
                            transition-all text-base font-bold flex items-center justify-center shadow-sm"
                        >
                          −
                        </button>
                        <span className="text-sm font-bold text-gray-900 w-5 text-center tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => increaseQuantity(item.id)}
                          className="w-7 h-7 rounded-lg bg-orange-500 text-white
                            hover:bg-orange-600 active:scale-95
                            transition-all text-base font-bold flex items-center justify-center shadow-sm"
                        >
                          +
                        </button>
                      </div>

                      {/* line total */}
                      <div className="text-right">
                        <p className="text-base font-black text-orange-600">
                          Ksh {(item.calculatedPrice * item.quantity).toLocaleString()}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-[10px] text-gray-400">
                            Ksh {item.calculatedPrice.toLocaleString()} each
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ══ RIGHT — order summary (sticky) ══ */}
          <div className="lg:sticky lg:top-28 space-y-4">

            {/* delivery location */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-500" />
                Delivery Location
              </h3>
              <div className="space-y-3">
                <SelectField
                  value={county}
                  onChange={setCounty}
                  placeholder="Select County"
                  icon={<MapPin className="w-3.5 h-3.5" />}
                >
                  {Object.keys(countyTownMap).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </SelectField>

                {towns.length > 0 && (
                  <SelectField
                    value={town}
                    onChange={setTown}
                    placeholder="Select Town / Area"
                    icon={<MapPin className="w-3.5 h-3.5" />}
                  >
                    {towns.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </SelectField>
                )}

                {/* delivery estimate */}
                {county && (
                  <div className="flex items-start gap-2 bg-orange-50 rounded-xl p-3">
                    <Truck className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-orange-800">
                        {county === 'Nairobi' ? 'Same-day delivery available' : '1–3 business days'}
                      </p>
                      <p className="text-[10px] text-orange-600 mt-0.5">
                        {county === 'Nairobi'
                          ? 'Order before 12PM for same-day in Nairobi'
                          : `Delivering to ${county} and surrounding areas`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* order summary */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Order Summary</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span className="font-semibold text-gray-900">Ksh {subtotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span className="flex items-center gap-1">
                    Delivery fee
                    <button className="text-gray-400 hover:text-gray-600 transition" title="Based on total weight">
                      <Info className="w-3 h-3" />
                    </button>
                  </span>
                  <span className="font-semibold text-gray-900">
                    {county && town
                      ? `Ksh ${deliveryFee.toLocaleString()}`
                      : <span className="text-gray-400 text-xs">Select location</span>}
                  </span>
                </div>

                {/* weight note */}
                <div className="flex justify-between text-[11px] text-gray-400 border-t border-dashed border-gray-100 pt-2">
                  <span className="flex items-center gap-1">
                    <Package className="w-3 h-3" /> Total weight
                  </span>
                  <span>{totalWeight.toFixed(2)} kg</span>
                </div>

                <div className="flex justify-between font-black text-base border-t border-gray-100 pt-3 mt-1">
                  <span className="text-gray-900">Total</span>
                  <span className="text-orange-600">Ksh {total.toLocaleString()}</span>
                </div>
              </div>

              {/* payment methods */}
              <div className="mt-4 flex flex-wrap gap-2">
                <div className="flex items-center gap-1 bg-green-50 border border-green-100 text-green-700
                  text-[10px] font-bold px-2.5 py-1.5 rounded-lg">
                  <Smartphone className="w-3 h-3" /> M-Pesa
                </div>
                <div className="flex items-center gap-1 bg-blue-50 border border-blue-100 text-blue-700
                  text-[10px] font-bold px-2.5 py-1.5 rounded-lg">
                  <CreditCard className="w-3 h-3" /> Visa
                </div>
                <div className="flex items-center gap-1 bg-orange-50 border border-orange-100 text-orange-700
                  text-[10px] font-bold px-2.5 py-1.5 rounded-lg">
                  <CreditCard className="w-3 h-3" /> Mastercard
                </div>
              </div>

              {/* checkout CTA */}
              {!userId ? (
                <button
                  onClick={() => {
                    toast.info('Please log in to checkout');
                    onOpenBuyerLogin?.();
                  }}
                  className="mt-4 w-full flex items-center justify-center gap-2 bg-gray-200
                    text-gray-700 font-bold py-3.5 rounded-2xl hover:bg-gray-300 transition text-sm"
                >
                  Login to Checkout
                </button>
              ) : (
                <button
                  onClick={handleCheckout}
                  disabled={!county || !town}
                  className="mt-4 w-full flex items-center justify-center gap-2 bg-orange-500
                    text-white font-bold py-3.5 rounded-2xl hover:bg-orange-600 active:scale-[0.98]
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-200 shadow-lg shadow-orange-200 text-sm"
                >
                  <Lock className="w-4 h-4" />
                  Checkout & Pay Securely
                </button>
              )}

              {/* security note */}
              <div className="flex items-center justify-center gap-1.5 mt-3">
                <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                <span className="text-[10px] text-gray-400">256-bit SSL encrypted · Safe & secure</span>
              </div>
            </div>

            {/* return policy reminder */}
            <div className="flex items-start gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <RotateCcw className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-gray-800">Free 7-day returns</p>
                <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">
                  Not satisfied? Return any item within 7 days of delivery, no questions asked.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Recommendations ── */}
        <div className="mt-10 space-y-5">
          <RecentlyViewed />

          <Section>
              <SponsoredProducts />
          </Section>

          <Section>
              <SuggestedForYou />
          </Section>
                  {/* 2 · Trust badges — appear immediately below hero */}
                  <Section>
                    <TrustBadges />
                  </Section>

          <Section>
              <TopPicksForYou />
          </Section>

          <Section>
              <UsedRefurbishedProducts />
          </Section>

          <Section>
            <BottomTrustStrip />
          </Section>
        </div>
      </div>

      {/* ── Remove confirmation modal ── */}
      {itemToRemove && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="px-6 pt-6 pb-4 text-center">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <h2 className="text-base font-bold text-gray-900">Remove this item?</h2>
              <p className="text-sm text-gray-500 mt-1">This item will be removed from your cart.</p>
            </div>
            <div className="flex border-t border-gray-100">
              <button
                onClick={() => setItemToRemove(null)}
                className="flex-1 py-3.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <div className="w-px bg-gray-100" />
              <button
                onClick={() => confirmRemove(itemToRemove)}
                className="flex-1 py-3.5 text-sm font-bold text-red-600 hover:bg-red-50 transition"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Payment modal ── */}
      {showGlobalPay && userId && (
        <GlobalPayModal
          payload={{
            amount: total,
            items: cartItems.map((item) => ({
              name: item.name, quantity: item.quantity, price: item.calculatedPrice,
              images: item.images, productId: item.productId || item.id,
              sellerId: item.sellerId, fulfillmentMode: item.fulfillmentMode,
            })),
            deliveryFee, county, town, userId,
            purpose: 'order', refId: 'cart',
          }}
          onClose={() => setShowGlobalPay(false)}
          onSuccess={() => { clearCart(); router.push('/orders'); }}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TRUST BADGES
═══════════════════════════════════════════════════════════════ */
const trustItems = [
  { icon: <ShieldCheck className="w-5 h-5 text-orange-500" />, title: 'Secure Payment',    sub: 'M-Pesa · Visa · Mastercard' },
  { icon: <Truck       className="w-5 h-5 text-orange-500" />, title: 'Fast Delivery',     sub: 'Same-day in Nairobi'        },
  { icon: <RotateCcw   className="w-5 h-5 text-orange-500" />, title: '7-Day Returns',     sub: 'Hassle-free policy'         },
  { icon: <Headphones  className="w-5 h-5 text-orange-500" />, title: '24/7 Support',      sub: 'Always here for you'        },
];

function TrustBadges() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100">
        {trustItems.map((item, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-4 hover:bg-orange-50/40 transition-colors">
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
              {item.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 leading-tight">{item.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}