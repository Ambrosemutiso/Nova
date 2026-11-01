
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
  ChevronRight,
  RotateCcw,
  Truck,
  ShieldCheck,
  Headphones,
  Trash2,
  MapPin,
  Package,
  Lock,
  Info,
  ChevronDown,
} from 'lucide-react';
import Image from 'next/image';

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

/* ── Lazy section animation ── */
function Section({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.05 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-500 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      } ${className}`}
    >
      {children}
    </div>
  );
}

/* ── Select field ── */
function SelectField({
  value,
  onChange,
  placeholder,
  children,
  icon,
}: {
  value: string;
  onChange: (value: string) => void;
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
        className={`w-full appearance-none bg-white border border-gray-200 rounded-xl
          py-3 pr-10 text-sm text-gray-800
          focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent
          transition ${icon ? 'pl-9' : 'pl-4'}`}
      >
        <option value="">{placeholder}</option>
        {children}
      </select>

      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  );
}

/* ── Trust strip ── */
function BottomTrustStrip() {
  const items = [
    {
      icon: <ShieldCheck className="w-8 h-8 text-orange-400" />,
      title: 'Buyer Protection',
      body: "Full refund if an item doesn't arrive or isn't as described.",
    },
    {
      icon: <Truck className="w-8 h-8 text-orange-400" />,
      title: 'Nationwide Delivery',
      body: 'Delivery available across all 47 counties.',
    },
    {
      icon: <RotateCcw className="w-8 h-8 text-orange-400" />,
      title: 'Easy 7-Day Returns',
      body: 'Return eligible items within 7 days of delivery.',
    },
  ];

  return (
    <div className="rounded-2xl overflow-hidden bg-[#202023]">
      <div className="px-6 py-8 grid grid-cols-1 sm:grid-cols-3 gap-7 text-center">
        {items.map((item, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            {item.icon}
            <p className="text-white font-bold text-sm">{item.title}</p>
            <p className="text-gray-400 text-xs leading-relaxed max-w-xs">
              {item.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN CART PAGE
══════════════════════════════════════════════════════════════════ */
export default function CartPage({ onOpenBuyerLogin }: CartProps) {
  const {
    cartItems,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
  } = useCart();

  const router = useRouter();

  const [county, setCounty] = useState('');
  const [town, setTown] = useState('');
  const [towns, setTowns] = useState<string[]>([]);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);
  const [showGlobalPay, setShowGlobalPay] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    setUserId(localStorage.getItem('userId'));
  }, []);

  /* ── Cart calculations ── */
  const totalWeight = cartItems.reduce(
    (sum, item) => sum + (item.weight || 1) * item.quantity,
    0
  );

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.calculatedPrice * item.quantity,
    0
  );

  const totalQuantity = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const calculateDeliveryFee = (weight: number) => {
    const base = 200;
    const baseWeight = 5;
    const extraPerKg = 30;

    return weight <= baseWeight
      ? base
      : base + Math.ceil(weight - baseWeight) * extraPerKg;
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
      setTown('');
    }
  }, [county]);

  const deliveryLocationSelected = Boolean(county && town);

  // Do not include delivery in the payable total until the buyer
  // has selected both their county and town.
  const payableDeliveryFee = deliveryLocationSelected ? deliveryFee : 0;

  const total = subtotal + payableDeliveryFee;

  /* ── Helpers ── */
  const getPublicId = (url?: string) => {
    if (!url) return '';

    const match = url.match(/\/upload\/(?:v\d+\/)?([^.]+)/);
    return match ? match[1] : url;
  };

  const handleCheckout = () => {
    if (!county || !town) {
      toast.warn('Please select your delivery location');
      return;
    }

    if (!userId) {
      toast.info('Please log in to checkout');
      onOpenBuyerLogin?.();
      return;
    }

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

  /* ── Empty cart ── */
  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-112px)] pt-28 px-4 bg-white">
        <Player
          autoplay
          loop
          src="https://assets5.lottiefiles.com/packages/lf20_qh5z2fdq.json"
          style={{ height: '260px', width: '260px' }}
        />

        <h2 className="mt-4 text-xl font-bold text-gray-800">
          Your cart is empty
        </h2>

        <p className="text-sm text-gray-500 mt-1 mb-6 text-center">
          Looks like you haven't added anything yet.
        </p>

        <button
          onClick={() => router.push('/')}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold
            px-8 py-3 rounded-full transition shadow-lg shadow-orange-200
            active:scale-95"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50/60 min-h-screen">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 pt-28 pb-16">

        {/* ── Page heading ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
              <button
                onClick={() => router.push('/')}
                className="hover:text-orange-600 transition"
              >
                Home
              </button>
              <ChevronRight className="w-3 h-3" />
              <span className="text-gray-600">Shopping Cart</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              My Shopping Cart
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              {totalQuantity} item{totalQuantity !== 1 ? 's' : ''} in your cart
              <span className="mx-2 text-gray-300">·</span>
              <span className="text-orange-600 font-bold">
                Ksh {subtotal.toLocaleString()}
              </span>
            </p>
          </div>

          <button
            onClick={() => {
              if (window.confirm('Clear all items from your cart?')) {
                clearCart();
              }
            }}
            className="self-start sm:self-auto inline-flex items-center justify-center gap-2
              px-4 py-2.5 rounded-xl border border-red-100 bg-white
              text-xs text-red-500 hover:bg-red-50 hover:border-red-200
              font-semibold transition"
          >
            <Trash2 className="w-4 h-4" />
            Clear cart
          </button>
        </div>

        {/* ── Main layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_420px] gap-6 xl:gap-8 items-start">

          {/* ══ LEFT: PRODUCTS ══ */}
          <section className="min-w-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900">
                Cart Items
                <span className="ml-2 text-xs font-medium text-gray-400">
                  ({cartItems.length})
                </span>
              </h2>

              <span className="text-xs text-gray-400">
                Prices in KES
              </span>
            </div>

            <div className="space-y-4">
              {cartItems.map((item) => (
                <article
                  key={item.id}
                  className="bg-white rounded-2xl border border-gray-200/80
                    shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                  style={{
                    opacity: removingId === item.id ? 0 : 1,
                    transform:
                      removingId === item.id
                        ? 'translateX(20px)'
                        : 'translateX(0)',
                  }}
                >
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 p-4 sm:p-5 lg:p-6">

                    {/* Product image */}
                    <div className="relative w-full sm:w-28 sm:h-28 lg:w-32 lg:h-32
                      aspect-square sm:aspect-auto rounded-xl overflow-hidden
                      bg-gray-50 shrink-0"
                    >
                      <CldImage
                        src={getPublicId(item.images?.[0])}
                        alt={item.name}
                        width={320}
                        height={320}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">

                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-sm sm:text-base font-bold text-gray-900
                            leading-snug line-clamp-2"
                          >
                            {item.name}
                          </h3>

                          <button
                            onClick={() => setItemToRemove(item.id)}
                            className="p-2 -mt-1 -mr-1 rounded-full
                              text-gray-400 hover:text-red-500 hover:bg-red-50
                              transition shrink-0"
                            aria-label={`Remove ${item.name}`}
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400">
                          <MapPin className="w-3.5 h-3.5 text-orange-500" />
                          <span>Ships from {item.county}</span>
                        </div>
                      </div>

                      {/* Quantity and price */}
                      <div className="flex flex-wrap items-end justify-between gap-4 mt-5">

                        <div>
                          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-2">
                            Quantity
                          </p>

                          <div className="inline-flex items-center gap-2
                            bg-gray-50 border border-gray-200 rounded-xl p-1"
                          >
                            <button
                              onClick={() => decreaseQuantity(item.id)}
                              className="w-8 h-8 rounded-lg bg-white border border-gray-200
                                text-gray-600 hover:bg-orange-50 hover:border-orange-300
                                hover:text-orange-600 transition flex items-center
                                justify-center font-bold"
                              aria-label="Decrease quantity"
                            >
                              −
                            </button>

                            <span className="text-sm font-bold text-gray-900
                              w-6 text-center tabular-nums"
                            >
                              {item.quantity}
                            </span>

                            <button
                              onClick={() => increaseQuantity(item.id)}
                              className="w-8 h-8 rounded-lg bg-orange-500 text-white
                                hover:bg-orange-600 active:scale-95 transition
                                flex items-center justify-center font-bold"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-[10px] text-gray-400 font-semibold
                            uppercase tracking-wider mb-1"
                          >
                            Item total
                          </p>

                          <p className="text-lg sm:text-xl font-black text-orange-600 tabular-nums">
                            Ksh {(item.calculatedPrice * item.quantity).toLocaleString()}
                          </p>

                          {item.quantity > 1 && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              Ksh {item.calculatedPrice.toLocaleString()} each
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Continue shopping */}
            <button
              onClick={() => router.push('/')}
              className="mt-5 inline-flex items-center gap-2 text-sm
                font-semibold text-orange-600 hover:text-orange-700 transition"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Continue shopping
            </button>
          </section>

          {/* ══ RIGHT: CHECKOUT SIDEBAR ══ */}
          <aside className="min-w-0 lg:sticky lg:top-28 space-y-4">

            {/* Delivery location */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-orange-50
                  flex items-center justify-center shrink-0"
                >
                  <MapPin className="w-5 h-5 text-orange-600" />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Delivery Location
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Where should we deliver your order?
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <SelectField
                  value={county}
                  onChange={setCounty}
                  placeholder="Select County"
                  icon={<MapPin className="w-3.5 h-3.5" />}
                >
                  {Object.keys(countyTownMap).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
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
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </SelectField>
                )}

                {county && (
                  <div className="flex items-start gap-2.5 bg-orange-50
                    rounded-xl p-3.5"
                  >
                    <Truck className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />

                    <div>
                      <p className="text-xs font-bold text-orange-900">
                        {county === 'Nairobi'
                          ? 'Same-day delivery available'
                          : 'Estimated delivery: 1–3 business days'}
                      </p>

                      <p className="text-[11px] text-orange-700 mt-1 leading-relaxed">
                        {county === 'Nairobi'
                          ? 'Order before 12PM for same-day delivery in Nairobi.'
                          : `Delivery to ${county} and surrounding areas.`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order summary */}
            <div className="bg-white rounded-2xl border border-gray-200/80
              shadow-sm p-5 sm:p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-black text-gray-900">
                  Order Summary
                </h3>

                <span className="text-[10px] font-bold uppercase tracking-wider
                  text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full"
                >
                  {totalQuantity} items
                </span>
              </div>

              <div className="space-y-4 text-sm">

                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-500">
                    Subtotal ({totalQuantity} items)
                  </span>

                  <span className="font-semibold text-gray-900 tabular-nums">
                    Ksh {subtotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5 text-gray-500">
                    Delivery fee

                    <span title="Calculated using the total cart weight">
                      <Info className="w-3.5 h-3.5 text-gray-400" />
                    </span>
                  </span>

                  <span className="font-semibold text-gray-900 tabular-nums">
                    {deliveryLocationSelected ? (
                      `Ksh ${payableDeliveryFee.toLocaleString()}`
                    ) : (
                      <span className="text-xs text-gray-400 font-medium">
                        Select location
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs
                  text-gray-400 border-t border-dashed border-gray-200 pt-3"
                >
                  <span className="flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5" />
                    Total weight
                  </span>

                  <span className="tabular-nums">
                    {totalWeight.toFixed(2)} kg
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-4 mt-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-base font-black text-gray-900">
                      Total
                    </span>

                    <span className="text-xl font-black text-orange-600 tabular-nums">
                      Ksh {total.toLocaleString()}
                    </span>
                  </div>

                  {!deliveryLocationSelected && (
                    <p className="text-[11px] text-gray-400 mt-2">
                      Delivery fee will be included after you select your location.
                    </p>
                  )}
                </div>
              </div>

              {/* Payment methods */}
              <div className="border-t border-gray-100 mt-5 pt-4">
                <p className="text-[10px] text-gray-400 font-bold
                  uppercase tracking-wider mb-3"
                >
                  Accepted payment methods
                </p>

                <div className="flex items-center gap-3 flex-wrap">
                  <div className="h-9 min-w-[58px] flex items-center justify-center
                    border border-gray-100 rounded-lg px-2 bg-white"
                  >
                    <Image
                      src="/visa.png"
                      alt="Visa"
                      width={42}
                      height={24}
                      className="object-contain"
                    />
                  </div>

                  <div className="h-9 min-w-[58px] flex items-center justify-center
                    border border-gray-100 rounded-lg px-2 bg-white"
                  >
                    <Image
                      src="/M-PESA.svg"
                      alt="M-Pesa"
                      width={42}
                      height={24}
                      className="object-contain"
                    />
                  </div>

                  <div className="h-9 min-w-[58px] flex items-center justify-center
                    border border-gray-100 rounded-lg px-2 bg-white"
                  >
                    <Image
                      src="/mastercard.png"
                      alt="Mastercard"
                      width={42}
                      height={24}
                      className="object-contain"
                    />
                  </div>

                  <div className="h-9 min-w-[58px] flex items-center justify-center
                    border border-gray-100 rounded-lg px-2 bg-white"
                  >
                    <Image
                      src="/Airtel.svg"
                      alt="Airtel Money"
                      width={30}
                      height={22}
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>

              {/* Checkout button */}
              {!userId ? (
                <button
                  onClick={() => {
                    toast.info('Please log in to checkout');
                    onOpenBuyerLogin?.();
                  }}
                  className="mt-5 w-full flex items-center justify-center gap-2
                    bg-gray-900 text-white font-bold py-4 rounded-xl
                    hover:bg-gray-800 transition text-sm"
                >
                  Login to Checkout
                </button>
              ) : (
                <button
                  onClick={handleCheckout}
                  disabled={!deliveryLocationSelected}
                  className="mt-5 w-full flex items-center justify-center gap-2
                    bg-orange-500 text-white font-bold py-4 rounded-xl
                    hover:bg-orange-600 active:scale-[0.98]
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-200 shadow-lg shadow-orange-200/70
                    text-sm"
                >
                  <Lock className="w-4 h-4" />
                  Checkout & Pay Securely
                </button>
              )}

              <div className="flex items-center justify-center gap-1.5 mt-4">
                <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                <span className="text-[10px] text-gray-400">
                  Secure payment processing
                </span>
              </div>
            </div>

            {/* Returns reminder */}
            <div className="flex items-start gap-3 bg-white rounded-2xl
              border border-gray-200/80 p-4"
            >
              <div className="w-9 h-9 rounded-xl bg-orange-50
                flex items-center justify-center shrink-0"
              >
                <RotateCcw className="w-4 h-4 text-orange-600" />
              </div>

              <div>
                <p className="text-xs font-bold text-gray-900">
                  Easy 7-day returns
                </p>

                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                  Eligible items can be returned within 7 days of delivery,
                  subject to the applicable return policy.
                </p>
              </div>
            </div>
          </aside>
        </div>

        {/* ── Recommendations ── */}
        <div className="mt-12 space-y-8">
          <RecentlyViewed />

          <Section>
            <SponsoredProducts />
          </Section>

          <Section>
            <SuggestedForYou />
          </Section>

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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]
          flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl w-full max-w-sm
            shadow-2xl overflow-hidden"
          >
            <div className="px-6 pt-6 pb-5 text-center">
              <div className="w-12 h-12 rounded-full bg-red-50
                flex items-center justify-center mx-auto mb-3"
              >
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>

              <h2 className="text-base font-bold text-gray-900">
                Remove this item?
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                This item will be removed from your cart.
              </p>
            </div>

            <div className="flex border-t border-gray-100">
              <button
                onClick={() => setItemToRemove(null)}
                className="flex-1 py-4 text-sm font-semibold text-gray-600
                  hover:bg-gray-50 transition"
              >
                Cancel
              </button>

              <div className="w-px bg-gray-100" />

              <button
                onClick={() => confirmRemove(itemToRemove)}
                className="flex-1 py-4 text-sm font-bold text-red-600
                  hover:bg-red-50 transition"
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
              name: item.name,
              quantity: item.quantity,
              price: item.calculatedPrice,
              images: item.images,
              productId: item.productId || item.id,
              sellerId: item.sellerId,
              fulfillmentMode: item.fulfillmentMode,
            })),
            deliveryFee: payableDeliveryFee,
            county,
            town,
            userId,
            purpose: 'order',
            refId: 'cart',
          }}
          onClose={() => setShowGlobalPay(false)}
          onSuccess={() => {
            clearCart();
            router.push('/orders');
          }}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TRUST BADGES
═══════════════════════════════════════════════════════════════ */

const trustItems = [
  {
    icon: <ShieldCheck className="w-5 h-5 text-orange-500" />,
    title: 'Secure Payment',
    sub: 'M-Pesa · Visa · Mastercard',
  },
  {
    icon: <Truck className="w-5 h-5 text-orange-500" />,
    title: 'Fast Delivery',
    sub: 'Delivery across Kenya',
  },
  {
    icon: <RotateCcw className="w-5 h-5 text-orange-500" />,
    title: '7-Day Returns',
    sub: 'Subject to return policy',
  },
  {
    icon: <Headphones className="w-5 h-5 text-orange-500" />,
    title: 'Customer Support',
    sub: 'Here to help you',
  },
];

function TrustBadges() {
  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl
      overflow-hidden shadow-sm"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y
        md:divide-y-0 divide-gray-100"
      >
        {trustItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-3 px-4 py-5
              hover:bg-orange-50/40 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-orange-50
              flex items-center justify-center shrink-0"
            >
              {item.icon}
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 leading-tight">
                {item.title}
              </p>

              <p className="text-xs text-gray-500 mt-1">
                {item.sub}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
