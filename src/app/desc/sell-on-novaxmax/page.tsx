'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  CheckCircle, ChevronDown, Users, BarChart3, Truck, Package,
  Wallet, Star, ArrowRight, Clock,
} from 'lucide-react';
import SellerLoginModal from '@/components/modals/SellerLoginModal';

/* ─── Design tokens ──────────────────────────────────────────────────────────
   Same system as the seller dashboard (wallet / finance / awards): ink, paper,
   warm gray, brand orange. This is the first page a prospective seller sees,
   so it carries the identity rather than a generic pastel-gradient hero.
   ──────────────────────────────────────────────────────────────────────────── */
const T = {
  ink:      '#111110',
  canvas:   '#FFFFFF',
  paper:    '#FFFFFF',
  line:     '#EAE6DD',
  muted:    '#8C8780',
  orange:   '#F97316',
  orangeDk: '#C2410C',
};

const TICKER_ITEMS = [
  'New seller joined from Mombasa',
  'Order placed in Kisumu — Ksh 2,300',
  'Payout sent to a seller in Nairobi',
  '5-star review left in Eldoret',
  'New product listed in Nakuru',
  'Order placed in Thika — Ksh 1,150',
];

const FEATURES = [
  { icon: Users,     title: 'Reach buyers nationwide', body: 'Your shop is visible to active shoppers in every county, not just your neighborhood.' },
  { icon: BarChart3, title: 'Real-time performance',   body: 'Track views, orders, and earnings as they happen from one dashboard.' },
  { icon: Truck,     title: 'Flexible delivery',        body: 'Use your own courier or tap into our nationwide delivery network.' },
  { icon: Package,   title: 'List in minutes',          body: 'Add a product with a few photos and a price — no design skills needed.' },
  { icon: Wallet,    title: 'Fast, reliable payouts',   body: 'Funds land in your NovaxMax wallet within 24 hours of delivery.' },
];

const STEPS = [
  { n: '1', title: 'Register', desc: 'Create your free seller account and set up your shop name.' },
  { n: '2', title: 'Upload products', desc: 'Add photos, set your price, and publish — it takes minutes.' },
  { n: '3', title: 'Receive orders', desc: 'Manage incoming orders from your dashboard and ship promptly.' },
  { n: '4', title: 'Get paid', desc: 'Your earnings land in your wallet within 24 hours of delivery.' },
];

const FAQS = [
  { q: 'Is it free to start selling?', a: 'Yes. Creating a seller account and listing products costs nothing upfront. NovaxMax only takes a small commission when you make a sale.' },
  { q: 'How fast do I get paid?', a: 'Once a delivery is confirmed, funds are released to your NovaxMax wallet within 24 hours. From there you can withdraw to M-Pesa or your bank.' },
  { q: 'Do I need a registered business?', a: 'No. Individual sellers, artisans, and registered businesses can all sell on NovaxMax — you just need a valid ID and a phone number.' },
  { q: 'What can I sell?', a: 'Most physical products are welcome — fashion, electronics, home goods, beauty, and more. Restricted and illegal items are not permitted.' },
];

export default function SellOnNovaXpress() {
  const [showLogin, setShowLogin] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div style={{ background: T.canvas, color: T.ink }} className="min-h-screen">
      {showLogin && <SellerLoginModal onClose={() => setShowLogin(false)} />}

      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
      <section className="pt-28 pb-16 px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">

          {/* left: copy */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="text-[11px] font-semibold tracking-[0.16em] uppercase mb-3" style={{ color: T.orange }}>
              For Kenyan Entrepreneurs
            </p>
            <h1
              className="text-4xl md:text-[44px] font-bold leading-[1.08] mb-5"
              style={{ fontFamily: "'Outfit', sans-serif", color: T.ink }}
            >
              Turn what you sell<br />into what you earn.
            </h1>
            <p className="text-base leading-relaxed mb-7 max-w-md" style={{ color: T.muted }}>
              List your first product in under five minutes. Reach shoppers across Kenya, manage
              orders from one dashboard, and get paid within 24 hours of delivery.
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-7">
              <button
                onClick={() => setShowLogin(true)}
                className="flex items-center gap-2 text-white px-7 py-3.5 rounded-full text-[15px] font-semibold transition"
                style={{ background: T.orange, boxShadow: `0 12px 28px -12px ${T.orange}99` }}
              >
                Start Selling Now <ArrowRight size={16} />
              </button>
              <a
                href="#how-it-works"
                className="px-6 py-3.5 rounded-full text-[15px] font-semibold transition"
                style={{ color: T.ink, border: `1px solid ${T.line}` }}
              >
                See how it works
              </a>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {['No setup fees', 'Payouts in 24 hrs', '10,000+ active sellers'].map((t, i) => (
                <span key={i} className="flex items-center gap-1.5 text-xs font-medium" style={{ color: T.muted }}>
                  <CheckCircle size={13} style={{ color: T.orange }} /> {t}
                </span>
              ))}
            </div>
          </motion.div>

          {/* right: earnings calculator — signature element */}
          <EarningsCalculator />
        </div>
      </section>

      {/* ══ LIVE TICKER ═══════════════════════════════════════════════════ */}
      <div className="overflow-hidden py-3" style={{ background: T.ink }}>
        <div className="flex gap-10 animate-novax-marquee whitespace-nowrap">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="flex items-center gap-2 text-xs font-medium text-white/70">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: T.orange }} />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ══ PROOF IMAGE + FEATURES ════════════════════════════════════════ */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">

          {/* image with floating proof chips */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="rounded-3xl overflow-hidden" style={{ border: `1px solid ${T.line}` }}>
              <Image
                src="/Seller-partner.jpg"
                alt="Seller dashboard preview"
                width={600}
                height={420}
                className="w-full h-auto object-cover"
              />
            </div>

            <div
              className="absolute -bottom-5 -left-4 sm:-left-6 rounded-2xl px-4 py-3 flex items-center gap-2.5"
              style={{ background: T.paper, border: `1px solid ${T.line}`, boxShadow: '0 16px 32px -16px rgba(0,0,0,0.18)' }}
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${T.orange}1A`, color: T.orange }}>
                <Wallet size={15} />
              </div>
              <div>
                <p className="text-[10px]" style={{ color: T.muted }}>Payout sent</p>
                <p className="text-sm font-bold" style={{ color: T.ink }}>Ksh 4,250</p>
              </div>
            </div>

            <div
              className="absolute -top-4 -right-3 sm:-right-5 rounded-2xl px-3.5 py-2.5 flex items-center gap-1.5"
              style={{ background: T.ink, boxShadow: '0 16px 32px -16px rgba(0,0,0,0.4)' }}
            >
              <Star size={13} style={{ color: T.orange }} fill={T.orange} />
              <span className="text-xs font-bold text-white">4.9 seller rating</span>
            </div>
          </motion.div>

          {/* feature grid */}
          <div>
            <h2 className="text-2xl font-bold mb-1.5" style={{ fontFamily: "'Outfit', sans-serif", color: T.ink }}>
              Why sell on NovaxMax?
            </h2>
            <p className="text-sm mb-6" style={{ color: T.muted }}>
              Everything you need to run a shop, without running a business alone.
            </p>
            <div className="grid sm:grid-cols-2 gap-3.5">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="rounded-2xl p-4"
                  style={{ background: T.paper, border: `1px solid ${T.line}` }}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: T.ink, color: T.orange }}>
                    <f.icon size={16} />
                  </div>
                  <p className="text-sm font-bold mb-1" style={{ color: T.ink }}>{f.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: T.muted }}>{f.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ STATS BAND ════════════════════════════════════════════════════ */}
      <section className="py-14" style={{ background: T.ink }}>
        <div className="max-w-6xl mx-auto px-6 grid sm:grid-cols-3 gap-8 text-center">
          {[
            { value: '10,000+', label: 'Active sellers nationwide' },
            { value: '1M+', label: 'Monthly visitors' },
            { value: '24 hrs', label: 'Average payout time' },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <h3 className="text-3xl font-bold mb-1" style={{ fontFamily: "'Outfit', sans-serif", color: T.orange }}>
                {s.value}
              </h3>
              <p className="text-sm text-white/55">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══ HOW IT WORKS ══════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-1.5" style={{ fontFamily: "'Outfit', sans-serif", color: T.ink }}>
            How to get started
          </h2>
          <p className="text-sm text-center mb-10" style={{ color: T.muted }}>
            Four steps from sign-up to your first payout.
          </p>

          <div className="grid md:grid-cols-4 gap-6 relative">
            <div
              className="hidden md:block absolute top-6 left-[12.5%] right-[12.5%] h-px"
              style={{ background: T.line }}
            />
            {STEPS.map((s, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.12 }}
                className="relative text-center"
              >
                <div
                  className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center font-bold mx-auto mb-4"
                  style={{ background: T.orange, color: '#fff', fontFamily: "'Outfit', sans-serif" }}
                >
                  {s.n}
                </div>
                <p className="text-sm font-bold mb-1" style={{ color: T.ink }}>{s.title}</p>
                <p className="text-xs leading-relaxed px-2" style={{ color: T.muted }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8" style={{ fontFamily: "'Outfit', sans-serif", color: T.ink }}>
            Common questions
          </h2>
          <div className="space-y-2.5">
            {FAQS.map((f, i) => {
              const open = openFaq === i;
              return (
                <div key={i} className="rounded-2xl overflow-hidden" style={{ background: T.paper, border: `1px solid ${T.line}` }}>
                  <button
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left"
                  >
                    <span className="text-sm font-semibold" style={{ color: T.ink }}>{f.q}</span>
                    <ChevronDown
                      size={16}
                      style={{ color: T.muted, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                    />
                  </button>
                  <AnimatePresence>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-4 text-sm leading-relaxed" style={{ color: T.muted }}>{f.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ═════════════════════════════════════════════════════ */}
      <section className="py-20 px-4" style={{ background: T.ink }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Ready to grow your business?
          </h2>
          <p className="text-white/55 text-sm mb-7">
            Join NovaxMax today and take your products to every corner of Kenya.
          </p>
          <button
            onClick={() => setShowLogin(true)}
            className="inline-flex items-center gap-2 text-white px-9 py-3.5 rounded-full text-[15px] font-semibold transition"
            style={{ background: T.orange, boxShadow: `0 12px 28px -12px ${T.orange}99` }}
          >
            Start Selling Now <ArrowRight size={16} />
          </button>
        </div>
      </section>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800&display=swap');
        @keyframes novax-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .animate-novax-marquee {
          animation: novax-marquee 22s linear infinite;
        }
      `}</style>
    </div>
  );
}

/* ─── Earnings Calculator — the page's signature element ────────────────────
   Concrete, interactive proof of value instead of decorative floating icons.
   ──────────────────────────────────────────────────────────────────────────── */
function EarningsCalculator() {
  const [ordersPerWeek, setOrdersPerWeek] = useState(12);
  const [avgOrderValue, setAvgOrderValue] = useState(1500);

  const monthlyEstimate = Math.round(ordersPerWeek * 4.33 * avgOrderValue);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="relative rounded-[28px] p-6 overflow-hidden"
      style={{ background: T.ink }}
    >
      <div
        aria-hidden
        className="absolute w-64 h-64 rounded-full pointer-events-none"
        style={{ top: -100, right: -80, background: `radial-gradient(circle, ${T.orange}33 0%, transparent 70%)` }}
      />
      <div className="relative z-10">
        <p className="text-[10px] tracking-[0.16em] uppercase text-white/45 mb-1">Estimate your sales</p>
        <p className="text-sm text-white/65 mb-5">See what's possible based on your own numbers.</p>

        <div className="mb-5">
          <div className="flex justify-between items-baseline mb-1.5">
            <label className="text-xs font-medium text-white/70">Orders per week</label>
            <span className="text-sm font-bold text-white tabular-nums">{ordersPerWeek}</span>
          </div>
          <input
            type="range" min={1} max={100} value={ordersPerWeek}
            onChange={(e) => setOrdersPerWeek(Number(e.target.value))}
            className="w-full"
            style={{ accentColor: T.orange }}
          />
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-baseline mb-1.5">
            <label className="text-xs font-medium text-white/70">Average order value</label>
            <span className="text-sm font-bold text-white tabular-nums">Ksh {avgOrderValue.toLocaleString()}</span>
          </div>
          <input
            type="range" min={200} max={10000} step={100} value={avgOrderValue}
            onChange={(e) => setAvgOrderValue(Number(e.target.value))}
            className="w-full"
            style={{ accentColor: T.orange }}
          />
        </div>

        <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <p className="text-[11px] text-white/50 mb-1">Estimated monthly sales</p>
          <p className="text-3xl font-bold text-white tabular-nums" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Ksh {monthlyEstimate.toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-1.5 mt-3">
          <Clock size={11} className="text-white/35" />
          <p className="text-[10px] text-white/35">Estimate only — actual results vary by category and demand.</p>
        </div>
      </div>
    </motion.div>
  );
}