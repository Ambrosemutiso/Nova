'use client';

import { useEffect, useState, useRef } from 'react';
import Hero from '@/components/Hero';
import Menu from '@/components/Menu';
import ProductsList from '@/components/ProductsList';
import TopPicksForYou from '@/components/TopPicksForYou';
import SuggestedForYou from '@/components/SuggestedForYou';
import SponsoredProducts from '@/components/SponsoredProducts';
import FlashSales from '@/components/FlashSales';
import InstallmentProducts from '@/components/InstallmentProducts';
import UsedRefurbishedProducts from '@/components/RefurbishedProducts';
import Loader from '@/components/Loader';
import {
  ShieldCheck, Truck, RotateCcw, Headphones, Zap, ChevronRight,
  Smartphone, Shirt, Home, Dumbbell, Baby, Laptop, Watch, Utensils,
  Car, Flower2, X,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════
   ANNOUNCEMENT BAR
═══════════════════════════════════════════════════════════════════ */
const messages = [
  '🎉 Free delivery on orders over Ksh 2,000 in Nairobi',
  '🔒 100% Secure Payments — M-Pesa, Visa & Mastercard accepted',
  '↩️ 7-day hassle-free returns on all orders',
  '⚡ Flash Sale ends tonight — up to 60% OFF selected items',
];

function AnnouncementBar() {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % messages.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  return (
    <div className="bg-gray-900 text-white text-xs py-2 px-4 flex items-center justify-between relative overflow-hidden">
      {/* sliding text */}
      <div className="flex-1 text-center font-medium tracking-wide overflow-hidden h-4 relative">
        {messages.map((msg, i) => (
          <span
            key={i}
            className="absolute inset-0 flex items-center justify-center transition-all duration-500"
            style={{
              opacity: i === current ? 1 : 0,
              transform: i === current ? 'translateY(0)' : 'translateY(6px)',
            }}
          >
            {msg}
          </span>
        ))}
      </div>
      <button
        onClick={() => setVisible(false)}
        className="ml-3 text-gray-400 hover:text-white transition shrink-0"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TRUST BADGES STRIP
═══════════════════════════════════════════════════════════════════ */
const trustItems = [
  {
    icon: <ShieldCheck className="w-5 h-5 text-orange-500" />,
    title: 'Secure Payment',
    sub: 'M-Pesa · Visa · Mastercard',
  },
  {
    icon: <Truck className="w-5 h-5 text-orange-500" />,
    title: 'Fast Delivery',
    sub: 'Same-day in Nairobi',
  },
  {
    icon: <RotateCcw className="w-5 h-5 text-orange-500" />,
    title: '7-Day Returns',
    sub: 'Hassle-free policy',
  },
  {
    icon: <Headphones className="w-5 h-5 text-orange-500" />,
    title: '24/7 Support',
    sub: 'Always here for you',
  },
];

function TrustBadges() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100">
        {trustItems.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-4 py-4 hover:bg-orange-50/40 transition-colors duration-200"
          >
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

/* ═══════════════════════════════════════════════════════════════════
   CATEGORY SHORTCUTS
═══════════════════════════════════════════════════════════════════ */
const categories = [
  { icon: <Smartphone className="w-6 h-6" />, label: 'Phones', color: 'bg-blue-50 text-blue-600' },
  { icon: <Laptop className="w-6 h-6" />, label: 'Electronics', color: 'bg-indigo-50 text-indigo-600' },
  { icon: <Shirt className="w-6 h-6" />, label: 'Fashion', color: 'bg-pink-50 text-pink-600' },
  { icon: <Home className="w-6 h-6" />, label: 'Home & Living', color: 'bg-amber-50 text-amber-600' },
  { icon: <Dumbbell className="w-6 h-6" />, label: 'Sports', color: 'bg-green-50 text-green-600' },
  { icon: <Baby className="w-6 h-6" />, label: 'Baby & Kids', color: 'bg-rose-50 text-rose-600' },
  { icon: <Utensils className="w-6 h-6" />, label: 'Food & Kitchen', color: 'bg-orange-50 text-orange-600' },
  { icon: <Watch className="w-6 h-6" />, label: 'Accessories', color: 'bg-purple-50 text-purple-600' },
  { icon: <Car className="w-6 h-6" />, label: 'Automotive', color: 'bg-gray-100 text-gray-600' },
  { icon: <Flower2 className="w-6 h-6" />, label: 'Beauty', color: 'bg-fuchsia-50 text-fuchsia-600' },
];

function CategoryShortcuts({ onSelect }: { onSelect: (label: string) => void }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-4 py-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-900">Shop by Category</h2>
        <button className="text-xs text-orange-600 font-semibold flex items-center gap-1 hover:underline">
          All categories <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
        {categories.map((cat, i) => (
          <button
            key={i}
            onClick={() => onSelect(cat.label)}
            className="flex flex-col items-center gap-2 group"
          >
            <div
              className={`w-12 h-12 rounded-2xl ${cat.color} flex items-center justify-center
                group-hover:scale-110 group-hover:shadow-md transition-all duration-200`}
            >
              {cat.icon}
            </div>
            <span className="text-[10px] font-medium text-gray-600 text-center leading-tight group-hover:text-orange-600 transition-colors">
              {cat.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   FLASH SALE COUNTDOWN BANNER
═══════════════════════════════════════════════════════════════════ */
function useCountdown(targetHours = 8) {
  const endTime = useRef(Date.now() + targetHours * 60 * 60 * 1000);
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, endTime.current - Date.now());
      setTimeLeft({
        h: Math.floor(diff / 3_600_000),
        m: Math.floor((diff % 3_600_000) / 60_000),
        s: Math.floor((diff % 60_000) / 1_000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return timeLeft;
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function FlashSaleBanner() {
  const { h, m, s } = useCountdown(8);

  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #ea580c 0%, #dc2626 50%, #991b1b 100%)',
      }}
    >
      {/* decorative circles */}
      <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute -bottom-10 -left-6 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />

      <div className="relative px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* left */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-yellow-300 fill-yellow-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-black text-lg tracking-tight leading-none">FLASH SALE</span>
              <span className="bg-yellow-400 text-gray-900 text-[10px] font-black px-1.5 py-0.5 rounded-md uppercase">
                Live Now
              </span>
            </div>
            <p className="text-red-100 text-xs mt-0.5">Up to 60% off — limited stock, grab it fast</p>
          </div>
        </div>

        {/* countdown */}
        <div className="flex items-center gap-2">
          <span className="text-red-200 text-xs font-medium">Ends in</span>
          {[pad(h), pad(m), pad(s)].map((val, i) => (
            <span key={i} className="flex items-center gap-1">
              <span className="bg-white/20 backdrop-blur text-white font-black text-lg tabular-nums w-10 h-10 rounded-xl flex items-center justify-center">
                {val}
              </span>
              {i < 2 && <span className="text-white font-black text-lg">:</span>}
            </span>
          ))}
          <button className="ml-2 bg-white text-red-600 text-xs font-black px-4 py-2.5 rounded-xl hover:bg-yellow-50 active:scale-95 transition shadow-md whitespace-nowrap">
            Shop Now →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   FEATURED BRANDS ROW
═══════════════════════════════════════════════════════════════════ */
const brands = [
  { name: 'Samsung', bg: '#1428A0', text: 'white' },
  { name: 'Apple', bg: '#1d1d1f', text: 'white' },
  { name: 'Infinix', bg: '#0066cc', text: 'white' },
  { name: 'Tecno', bg: '#e31e24', text: 'white' },
  { name: 'LG', bg: '#a50034', text: 'white' },
  { name: 'Itel', bg: '#ff6b00', text: 'white' },
  { name: 'Hisense', bg: '#003087', text: 'white' },
  { name: 'Sony', bg: '#000', text: 'white' },
];

function FeaturedBrands() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-4 py-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-900">Featured Brands</h2>
        <button className="text-xs text-orange-600 font-semibold flex items-center gap-1 hover:underline">
          All brands <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
        {brands.map((brand, i) => (
          <button
            key={i}
            className="shrink-0 flex flex-col items-center gap-2 group"
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm
                group-hover:shadow-md group-hover:scale-105 transition-all duration-200"
              style={{ backgroundColor: brand.bg, color: brand.text }}
            >
              {brand.name.slice(0, 2).toUpperCase()}
            </div>
            <span className="text-[10px] text-gray-500 font-medium group-hover:text-orange-600 transition-colors">
              {brand.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION WRAPPER — consistent spacing + fade-in
═══════════════════════════════════════════════════════════════════ */
function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} ${className}`}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION HEADING — consistent styling
═══════════════════════════════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════ */
export default function Main() {
  const [category, setCategory] = useState('Shop');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loading) {
      document.body.classList.add('hide-footer');
    } else {
      document.body.classList.remove('hide-footer');
    }
  }, [loading]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* ── Announcement Bar — full bleed, outside max-width ── */}
      <AnnouncementBar />

      <div className="max-w-[1600px] mx-auto px-4 md:px-6 pb-12 space-y-5 pt-4">

        {/* ── Hero ── */}
        <Section>
          <Hero />
        </Section>

        {/* ── Trust Badges ── */}
        <Section>
          <TrustBadges />
        </Section>

        {/* ── Category Shortcuts ── */}
        <Section>
          <CategoryShortcuts onSelect={setCategory} />
        </Section>

        {/* ── Flash Sale Countdown Banner ── */}
        <Section>
          <FlashSaleBanner />
        </Section>

        {/* ── Flash Sales Products ── */}
        <Section>
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-4 py-5">
            <SectionHeading
              title="⚡ Flash Sales"
              sub="Today's hottest deals — selling fast"
              cta="See all"
            />
            <FlashSales />
          </div>
        </Section>

        {/* ── Featured Brands ── */}
        <Section>
          <FeaturedBrands />
        </Section>

        {/* ── Menu + Products ── */}
        <Section>
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-4 py-5">
            <SectionHeading
              title="Browse Products"
              sub="Discover thousands of items across all categories"
              cta="View all"
            />
            <Menu onSelectCategory={setCategory} />
            <div className="mt-4">
              <ProductsList category={category} />
            </div>
          </div>
        </Section>

        {/* ── Buy on Installments ── */}
        <Section>
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-4 py-5">
            <SectionHeading
              title="💳 Buy on Installments"
              sub="Own it now, pay later — flexible plans available"
              cta="Explore"
            />
            <InstallmentProducts />
          </div>
        </Section>

        {/* ── Sponsored ── */}
        <Section>
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-4 py-5">
            <SectionHeading
              title="Promoted Products"
              sub="Hand-picked deals from top sellers"
            />
            <SponsoredProducts />
          </div>
        </Section>

        {/* ── Suggested For You ── */}
        <Section>
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-2xl shadow-sm px-4 py-5">
            <SectionHeading
              title="✨ Suggested For You"
              sub="Based on what's trending right now"
              cta="See more"
            />
            <SuggestedForYou />
          </div>
        </Section>

        {/* ── Top Picks ── */}
        <Section>
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-4 py-5">
            <SectionHeading
              title="🏆 Top Picks"
              sub="Our most loved products this week"
              cta="See all"
            />
            <TopPicksForYou />
          </div>
        </Section>

        {/* ── Used & Refurbished ── */}
        <Section>
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-4 py-5">
            <SectionHeading
              title="♻️ Used & Refurbished"
              sub="Quality products at unbeatable prices"
              cta="Browse"
            />
            <UsedRefurbishedProducts />
          </div>
        </Section>

        {/* ── Bottom Trust Strip ── */}
        <Section>
          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #1c1c1e 0%, #2d2d30 100%)' }}>
            <div className="px-6 py-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div className="flex flex-col items-center gap-2">
                <ShieldCheck className="w-8 h-8 text-orange-400" />
                <p className="text-white font-bold text-sm">100% Buyer Protection</p>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Your money is safe. Full refund if item doesn't arrive or isn't as described.
                </p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Truck className="w-8 h-8 text-orange-400" />
                <p className="text-white font-bold text-sm">Nationwide Delivery</p>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Same-day Nairobi. 1–3 days to all 47 counties across Kenya.
                </p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <RotateCcw className="w-8 h-8 text-orange-400" />
                <p className="text-white font-bold text-sm">Easy 7-Day Returns</p>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Not happy? Return it within 7 days, no questions asked.
                </p>
              </div>
            </div>
          </div>
        </Section>

      </div>
    </div>
  );
}