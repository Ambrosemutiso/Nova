'use client';

import { useEffect, useRef, useState } from 'react';
import Hero from '@/components/Hero';
import Menu from '@/components/Menu';
import TopPicksForYou from '@/components/TopPicksForYou';
import SuggestedForYou from '@/components/SuggestedForYou';
import SponsoredProducts from '@/components/SponsoredProducts';
import FlashSales from '@/components/FlashSales';
import InstallmentProducts from '@/components/InstallmentProducts';
import UsedRefurbishedProducts from '@/components/RefurbishedProducts';
import Loader from '@/components/Loader';
import {
  ShieldCheck, Truck, RotateCcw, Headphones,
  ChevronRight, X,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   ANNOUNCEMENT BAR
═══════════════════════════════════════════════════════════════ */
const messages = [
  '🎉 Free delivery on orders over Ksh 2,000 in Nairobi',
  '🔒 100% Secure Payments — M-Pesa, Visa & Mastercard accepted',
  '↩️ 7-day hassle-free returns on all orders',
  '⚡ Flash Sale live now — up to 60% OFF selected items',
];

function AnnouncementBar() {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setCurrent((p) => (p + 1) % messages.length), 3500);
    return () => clearInterval(id);
  }, []);

  if (!visible) return null;

  return (
    <div className="bg-gray-900 text-white text-xs py-2 px-4 flex items-center justify-between">
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

/* ═══════════════════════════════════════════════════════════════
   FEATURED BRANDS
═══════════════════════════════════════════════════════════════ */
const brands = [
  { name: 'Samsung', bg: '#1428A0' },
  { name: 'Apple',   bg: '#1d1d1f' },
  { name: 'Infinix', bg: '#0066cc' },
  { name: 'Tecno',   bg: '#e31e24' },
  { name: 'LG',      bg: '#a50034' },
  { name: 'Itel',    bg: '#ff6b00' },
  { name: 'Hisense', bg: '#003087' },
  { name: 'Sony',    bg: '#000000' },
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
      <div className="flex gap-4 overflow-x-auto pb-1 no-scrollbar">
        {brands.map((brand, i) => (
          <button key={i} className="shrink-0 flex flex-col items-center gap-2 group">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xs text-white shadow-sm
                group-hover:shadow-md group-hover:scale-105 transition-all duration-200"
              style={{ backgroundColor: brand.bg }}
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

/* ═══════════════════════════════════════════════════════════════
   SECTION WRAPPER — scroll-triggered fade-up
═══════════════════════════════════════════════════════════════ */
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
      className={`transition-all duration-500 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      } ${className}`}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SECTION HEADING
═══════════════════════════════════════════════════════════════ */
function SectionHeading({
  title, sub, cta,
}: { title: string; sub?: string; cta?: string }) {
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

/* ═══════════════════════════════════════════════════════════════
   BOTTOM TRUST STRIP
═══════════════════════════════════════════════════════════════ */
function BottomTrustStrip() {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1c1c1e 0%, #2d2d30 100%)' }}
    >
      <div className="px-6 py-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
        {[
          {
            icon: <ShieldCheck className="w-8 h-8 text-orange-400" />,
            title: '100% Buyer Protection',
            body: "Your money is safe. Full refund if item doesn't arrive or isn't as described.",
          },
          {
            icon: <Truck className="w-8 h-8 text-orange-400" />,
            title: 'Nationwide Delivery',
            body: 'Same-day Nairobi. 1–3 days to all 47 counties across Kenya.',
          },
          {
            icon: <RotateCcw className="w-8 h-8 text-orange-400" />,
            title: 'Easy 7-Day Returns',
            body: "Not happy? Return it within 7 days, no questions asked.",
          },
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

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
export default function Main() {
  const [category, setCategory] = useState('Shop');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.classList.toggle('hide-footer', loading);
  }, [loading]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(t);
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="bg-gray-50 min-h-screen">

      <div className="max-w-[1600px] mx-auto px-4 md:px-6 pt-[60px] pb-12 space-y-5">
              {/* Full-bleed announcement bar */}
        
        <Section>
          <Hero/>
        </Section>

                {/* 4 · Category menu — real data, real images; no duplicate icon grid */}
        <Menu onSelectCategory={setCategory} />

        {/* 3 · Flash Sales — live timer already built-in to the component */}
        <Section>
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-4 py-5">
            <FlashSales />
          </div>
        </Section>

        {/* 6 · Suggested for you — personalised feed first, ads below */}
        <Section>
            <SuggestedForYou />
        </Section>

        {/* 8 · Buy on installments */}
        <Section>
            <InstallmentProducts />
        </Section>

        {/* 2 · Trust badges — appear immediately below hero */}
        <Section>
          <TrustBadges />
        </Section>

        {/* 9 · Top picks */}
        <Section>
            <TopPicksForYou />
        </Section>

        {/* 10 · Sponsored / promoted — after organic content */}
        <Section>
            <SponsoredProducts />
        </Section>

        {/* 11 · Used & refurbished */}
        <Section>
            <UsedRefurbishedProducts />
        </Section>

        {/* 12 · Bottom trust strip — closes the page with confidence */}
        <Section>
          <BottomTrustStrip />
        </Section>

      </div>
    </div>
  );
}