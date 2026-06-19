'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  FiHome, FiSmartphone, FiMonitor, FiHeart, FiUser,
  FiTv, FiWatch, FiGift, FiTruck, FiBook, FiTool,
  FiGrid, FiZoomIn, FiZoomOut, FiPackage, FiLayout,
  FiSun, FiFilm, FiPhone, FiCreditCard, FiShield,
  FiX, FiChevronRight, FiStar, FiRefreshCw,
  FiZap, FiCheck
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { categoryTree } from '@/lib/sidebarProductCategories';
import { slugify } from '@/lib/slugify';
import TranslateWidget from './TranslateWidget';
import { useCart } from '@/app/context/CartContext';
import { useAuth } from '@/app/context/AuthContext';

/* ══════════════════════════════════════════════════════════════
   CATEGORY ICONS
══════════════════════════════════════════════════════════════ */
const categoryIcons: Record<string, JSX.Element> = {
  'Electronics':                  <FiTv />,
  'Computers & Laptops':          <FiMonitor />,
  'Mobile Phones & Accessories':  <FiSmartphone />,
  'Gaming':                       <FiFilm />,
  'Home & Kitchen':               <FiGrid />,
  'Furniture':                    <FiLayout />,
  'Fashion':                      <FiUser />,
  'Beauty & Personal Care':       <FiHeart />,
  'Health & Wellness':            <FiHeart />,
  'Baby & Kids':                  <FiGift />,
  'Jewelry & Watches':            <FiWatch />,
  'Sports & Outdoors':            <FiTruck />,
  'Automotive & Motorcycles':     <FiTool />,
  'Industrial & Machinery':       <FiTool />,
  'Tools & Hardware':             <FiTool />,
  'Agriculture':                  <FiTruck />,
  'Books & Stationery':           <FiBook />,
  'Toys & Hobbies':               <FiGift />,
  'Pet Supplies':                 <FiHeart />,
  'Food & Groceries':             <FiPackage />,
  'Beverages':                    <FiPackage />,
  'Alcohol & Liquor':             <FiPackage />,
  'Office Supplies':              <FiMonitor />,
  'Musical Instruments':          <FiFilm />,
  'Smart Home & Robotics':        <FiMonitor />,
  'Solar & Renewable Energy':     <FiSun />,
  'Motorbike Parts':              <FiTool />,
  'Farm Equipment':               <FiTruck />,
  'Mobile Money Devices':         <FiCreditCard />,
  'Construction Materials':       <FiTool />,
};

/* ══════════════════════════════════════════════════════════════
   TRUST BADGES — single color family now (orange + neutral)
══════════════════════════════════════════════════════════════ */
const trustBadges = [
  { icon: <FiShield size={13} />,    label: 'Buyer Protected' },
  { icon: <FiRefreshCw size={13} />, label: '7-Day Returns'   },
  { icon: <FiTruck size={13} />,     label: 'Fast Delivery'   },
  { icon: <FiZap size={13} />,       label: 'Flash Deals'     },
];

const FREE_SHIPPING_THRESHOLD = 2000;

interface Props {
  isOpen?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
}

export default function Sidebar({ onClose }: Props) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { cartItems } = useCart();
  const { user }       = useAuth();

  const [isMobile,     setIsMobile]     = useState(false);
  const [fontSize,     setFontSize]     = useState(1);
  const [language,     setLanguage]     = useState('en');
  const [showSettings, setShowSettings] = useState(false);

  const cartTotal = cartItems.reduce((sum, item) => sum + item.quantity * (item.calculatedPrice ?? 0), 0);
  const shippingProgress  = Math.min((cartTotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const shippingRemaining = Math.max(FREE_SHIPPING_THRESHOLD - cartTotal, 0);
  const isBuyer = !user?.role || user.role === 'buyer';

  /* ── mobile detect ── */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  /* ── font size ── */
useEffect(() => {
  const saved = localStorage.getItem('fontSize');
  setFontSize(saved ? parseFloat(saved) : (window.innerWidth < 768 ? 0.5 : 1));
}, []);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize * 100}%`;
    localStorage.setItem('fontSize', fontSize.toString());
  }, [fontSize]);

  /* ── language ── */
  useEffect(() => {
    const saved = localStorage.getItem('language');
    if (saved) { setLanguage(saved); document.documentElement.lang = saved; }
  }, []);

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
    const sel = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
    if (sel) { sel.value = language; sel.dispatchEvent(new Event('change')); }
  }, [language]);

  /* ── nav items ── */
  const quickLinks = [
    { label: 'Home',            icon: <FiHome />,       route: '/' },
    { label: 'Wishlist',        icon: <FiHeart />,      route: '/wishlist' },
    { label: 'My Wallet',       icon: <FiCreditCard />, route: '/wallet' },
    { label: 'My Orders',       icon: <FiPackage />,    route: '/orders' },
    { label: 'My Vouchers',     icon: <FiGift />,       route: '/vouchers' },
    { label: 'My Installments', icon: <FiPhone />,      route: '/installments/progress' },
    ...(isMobile ? [{ label: 'Ads', icon: <FiFilm />, route: '/ads' }] : []),
  ];

  const categories = Object.keys(categoryTree).map(cat => ({
    label: cat,
    icon: categoryIcons[cat] || <FiGrid />,
    route: `/category/${slugify(cat)}`,
  }));

  const navigate = (route: string) => {
    router.push(route);
    onClose?.();
  };

  return (
    <aside className="h-full w-72 flex flex-col bg-white dark:bg-gray-950 overflow-hidden">

      {/* ══ HEADER ══ */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
        <motion.img
          whileHover={{ scale: 1.05 }}
          src="/Logo.png"
          className="h-9 object-contain cursor-pointer"
          onClick={() => navigate('/')}
          alt="Logo"
        />
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={onClose}
          className="md:hidden w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center
            text-gray-500 hover:bg-orange-50 hover:text-orange-600 transition-colors"
        >
          <FiX size={15} />
        </motion.button>
      </div>

      {/* ══ IDENTITY STRIP — one combined block instead of two competing ones ══ */}
      <div className="shrink-0 border-b border-gray-100 dark:border-gray-800">

        {/* greeting row — plain, no background color */}
        {user && (
          <div className="px-5 pt-3.5 pb-2.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-gray-400 dark:text-gray-500">Welcome back</p>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                {user.name?.split(' ')[0]}
              </p>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-50 dark:bg-gray-900">
              <FiStar size={10} className="text-orange-500 fill-orange-500" />
              <span className="text-[10px] font-bold text-orange-600">4.8</span>
            </div>
          </div>
        )}

        {/* free shipping progress — single accent, lives under greeting, same block */}
        {isBuyer && (
          <div className={`px-5 ${user ? 'pb-3.5' : 'pt-4 pb-4'}`}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-600 dark:text-gray-400">
                <FiTruck size={11} className="text-orange-500" />
                {shippingProgress >= 100
                  ? <span className="text-gray-900 dark:text-gray-100 flex items-center gap-1">
                      <FiCheck size={11} className="text-orange-500" /> Free shipping unlocked
                    </span>
                  : <span>Add <strong className="text-gray-900 dark:text-gray-100">Ksh {shippingRemaining.toLocaleString()}</strong> for free delivery</span>
                }
              </div>
              <span className="text-[10px] font-bold text-orange-500">{Math.round(shippingProgress)}%</span>
            </div>
            <div className="h-1 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${shippingProgress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full bg-orange-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* ══ SCROLLABLE CONTENT ══ */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">

        {/* ── Quick links ── */}
        <div className="px-4 pt-4 pb-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-1.5">
            Quick Access
          </p>
          <ul className="space-y-0.5">
            {quickLinks.map(({ label, icon, route }, i) => (
              <motion.li
                key={i}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(route)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer
                  text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors group"
              >
                <span className="text-gray-400 group-hover:text-orange-500 transition-colors text-base">{icon}</span>
                <span className="text-sm font-medium">{label}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* ── divider ── */}
        <div className="mx-5 my-3 border-t border-gray-100 dark:border-gray-800" />

        {/* ── Categories ── */}
        <div className="px-4 pb-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-1.5">
            Shop by Category
          </p>
          <ul className="space-y-0.5">
            {categories.map(({ label, icon, route }, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: Math.min(i * 0.015, 0.3), duration: 0.2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(route)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer
                  text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 group-hover:text-orange-500 transition-colors text-base">{icon}</span>
                  <span className="text-sm">{label}</span>
                </div>
                <FiChevronRight size={13} className="text-gray-300 group-hover:text-orange-400 transition-colors" />
              </motion.li>
            ))}
          </ul>
        </div>

        {/* ── divider ── */}
        <div className="mx-5 my-3 border-t border-gray-100 dark:border-gray-800" />

        {/* ══ TRUST & CONVERSION BLOCK — single consolidated card ══ */}
        <div className="mx-4 mb-4 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">

          {/* flash sale — the ONE bold colored moment in the whole sidebar */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/deals')}
            className="bg-orange-500 px-4 py-3.5 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <FiZap size={12} className="text-white" />
                  <span className="text-[10px] font-bold text-orange-100 uppercase tracking-wider">Flash Sale</span>
                </div>
                <p className="text-white font-black text-base leading-tight">Up to 60% OFF</p>
                <p className="text-orange-100 text-[11px] mt-0.5">Ends tonight</p>
              </div>
              <div className="flex items-center gap-1 bg-white/15 rounded-lg px-2 py-1.5">
                <span className="text-white text-xs font-bold">Shop</span>
                <FiChevronRight size={12} className="text-white" />
              </div>
            </div>
          </motion.div>

          {/* trust badges — neutral grid, no per-item colors */}
          <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3">
            <div className="grid grid-cols-2 gap-1.5">
              {trustBadges.map((b, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white dark:bg-gray-800
                    border border-gray-100 dark:border-gray-700"
                >
                  <span className="text-orange-500">{b.icon}</span>
                  <span className="text-[10.5px] font-semibold text-gray-600 dark:text-gray-300 leading-tight">
                    {b.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* rating line — folded into the same card, no separate yellow box */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-t border-gray-100 dark:border-gray-800">
            <div className="flex">
              {[1,2,3,4,5].map(s => (
                <FiStar key={s} size={11} className="text-orange-400 fill-orange-400" />
              ))}
            </div>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
              4.8/5 · 12,000+ shoppers
            </span>
          </div>
        </div>

        {/* ── Settings accordion ── */}
        <div className="mx-4 mb-6">
          <button
            onClick={() => setShowSettings(p => !p)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl
              hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-500 text-sm transition-colors"
          >
            <span className="font-semibold text-[10px] uppercase tracking-widest">Preferences</span>
            <motion.span animate={{ rotate: showSettings ? 90 : 0 }} transition={{ duration: 0.2 }}>
              <FiChevronRight size={14} />
            </motion.span>
          </button>

          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="pt-2 space-y-2 px-1">

                  {/* font size */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setFontSize(f => Math.max(f - 0.1, 0.6))}
                      className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-gray-800
                        border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300
                        py-2 rounded-xl text-xs font-semibold hover:border-orange-300 hover:text-orange-600 transition-colors"
                    >
                      <FiZoomOut size={13} /> Smaller
                    </button>
                    <button
                      onClick={() => setFontSize(f => Math.min(f + 0.1, 2))}
                      className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-gray-800
                        border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300
                        py-2 rounded-xl text-xs font-semibold hover:border-orange-300 hover:text-orange-600 transition-colors"
                    >
                      <FiZoomIn size={13} /> Larger
                    </button>
                  </div>

                  {/* dark mode */}
                  <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="w-full flex items-center justify-center gap-2 bg-white dark:bg-gray-800
                      border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300
                      py-2 rounded-xl text-xs font-semibold hover:border-orange-300 hover:text-orange-600 transition-colors"
                  >
                    {theme === 'dark' ? <FiSun size={13} /> : <span className="text-xs">🌙</span>}
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  </button>

                  {/* language */}
                  <TranslateWidget />
                  <select
                    value={language}
                    onChange={e => setLanguage(e.target.value)}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-2 text-xs
                      bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200
                      focus:ring-2 focus:ring-orange-300 outline-none"
                  >
                    <option value="en">🇬🇧 English</option>
                    <option value="sw">🇰🇪 Kiswahili</option>
                    <option value="fr">🇫🇷 French</option>
                    <option value="ar">🇸🇦 Arabic</option>
                    <option value="am">🇪🇹 Amharic</option>
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </aside>
  );
}