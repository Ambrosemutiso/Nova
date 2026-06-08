'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  FiHome, FiSmartphone, FiMonitor, FiHeart, FiUser,
  FiTv, FiWatch, FiGift, FiTruck, FiBook, FiTool,
  FiGrid, FiZoomIn, FiZoomOut, FiPackage, FiLayout,
  FiSun, FiFilm, FiPhone, FiCreditCard, FiShield,
  FiX, FiChevronRight, FiStar, FiTag, FiRefreshCw,
  FiZap, FiAward, FiCheck
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { categoryTree } from '@/lib/productCategories';
import { slugify } from '@/lib/slugify';
import TranslateWidget from './TranslateWidget';
import { useCart } from '@/app/context/CartContext';
import { useAuth } from '@/app/context/AuthContext';

// ─── Category icon map ────────────────────────────────────────────────────────
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

// ─── Trust badges ─────────────────────────────────────────────────────────────
const trustBadges = [
  { icon: <FiShield size={14} />,    label: 'Buyer Protected',   color: 'text-emerald-600 bg-emerald-50' },
  { icon: <FiRefreshCw size={14} />, label: '7-Day Returns',     color: 'text-blue-600 bg-blue-50' },
  { icon: <FiTruck size={14} />,     label: 'Fast Delivery',     color: 'text-orange-600 bg-orange-50' },
  { icon: <FiZap size={14} />,       label: 'Flash Deals Daily', color: 'text-amber-600 bg-amber-50' },
];

// ─── Free shipping threshold (replace with real cart value) ──────────────────
const FREE_SHIPPING_THRESHOLD = 2000;

interface Props {
  isOpen?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
}

export default function Sidebar({ isOpen = false, onClose, onOpen }: Props) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { cartItems } = useCart();
  const { user }       = useAuth();

  const [isMobile,     setIsMobile]     = useState(false);
  const [fontSize,     setFontSize]     = useState(1);
  const [language,     setLanguage]     = useState('en');
  const [expandedCat,  setExpandedCat]  = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const cartTotal = cartItems.reduce((sum, item) => sum + item.quantity * (item.calculatedPrice ?? 0), 0);
  const shippingProgress = Math.min((cartTotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const shippingRemaining = Math.max(FREE_SHIPPING_THRESHOLD - cartTotal, 0);

  // ── Detect mobile ──────────────────────────────────────────────────────────
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ── Font size ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem('fontSize');
    setFontSize(saved ? parseFloat(saved) : (window.innerWidth < 768 ? 0.85 : 1));
  }, []);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize * 100}%`;
    localStorage.setItem('fontSize', fontSize.toString());
  }, [fontSize]);

  // ── Language ──────────────────────────────────────────────────────────────
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

  // ── Nav items ─────────────────────────────────────────────────────────────
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

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
        <motion.img
          whileHover={{ scale: 1.05 }}
          src="/Logo.png"
          className="h-10 object-contain cursor-pointer"
          onClick={() => navigate('/')}
          alt="Logo"
        />
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:bg-orange-100 hover:text-orange-600 transition"
        >
          <FiX size={15} />
        </motion.button>
      </div>

      {/* ── User greeting (if logged in) ────────────────────────────────────── */}
      {user && (
        <div className="px-5 py-3 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-900 border-b border-orange-100 dark:border-gray-800 flex-shrink-0">
          <p className="text-xs text-gray-500 dark:text-gray-400">Welcome back,</p>
          <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">{user.name?.split(' ')[0]} 👋</p>
        </div>
      )}

      {/* ── Free shipping progress ───────────────────────────────────────────── */}
      {!user?.role || user.role === 'buyer' ? (
        <div className="px-5 py-3 bg-orange-50 dark:bg-gray-900 border-b border-orange-100 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-700 dark:text-orange-400">
              <FiTruck size={12} />
              {shippingProgress >= 100
                ? <span className="text-emerald-600 flex items-center gap-1"><FiCheck size={11} /> Free shipping unlocked!</span>
                : <span>Add <strong>Ksh {shippingRemaining.toLocaleString()}</strong> for free delivery</span>
              }
            </div>
            <span className="text-[10px] font-bold text-orange-500">{Math.round(shippingProgress)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-orange-200 dark:bg-gray-700 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${shippingProgress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-400"
            />
          </div>
        </div>
      ) : null}

      {/* ── Scrollable content ───────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-orange-200">

        {/* Quick links */}
        <div className="px-4 pt-4 pb-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">Quick Access</p>
          <ul className="space-y-0.5">
            {quickLinks.map(({ label, icon, route }, i) => (
              <motion.li
                key={i}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(route)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer hover:bg-orange-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition group"
              >
                <span className="text-orange-400 group-hover:text-orange-600 transition">{icon}</span>
                <span className="text-sm font-medium">{label}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Divider */}
        <div className="mx-5 my-2 border-t border-dashed border-gray-200 dark:border-gray-800" />

        {/* Categories */}
        <div className="px-4 pb-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">Shop by Category</p>
          <ul className="space-y-0.5">
            {categories.map(({ label, icon, route }, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.018, duration: 0.25 }}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(route)}
                className="flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer hover:bg-orange-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-orange-400 group-hover:text-orange-600 transition">{icon}</span>
                  <span className="text-sm">{label}</span>
                </div>
                <FiChevronRight size={13} className="text-gray-300 group-hover:text-orange-400 transition" />
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Trust badges */}
        <div className="mx-4 my-3 p-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
            <FiAward size={10} /> Why shop with us
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {trustBadges.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.07 }}
                className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 ${b.color}`}
              >
                {b.icon}
                <span className="text-[11px] font-semibold leading-tight">{b.label}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Featured deal banner */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => navigate('/deals')}
          className="mx-4 mb-3 p-3 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 cursor-pointer shadow-lg shadow-orange-200 dark:shadow-orange-900"
        >
          <div className="flex items-center gap-2 mb-1">
            <FiZap size={14} className="text-white" />
            <span className="text-[11px] font-bold text-orange-100 uppercase tracking-wider">Flash Sale</span>
          </div>
          <p className="text-white font-black text-lg leading-tight">Up to 60% OFF</p>
          <p className="text-orange-100 text-xs mt-0.5">Ends tonight at midnight</p>
          <div className="mt-2 flex items-center gap-1 text-white text-xs font-semibold">
            Shop Now <FiChevronRight size={12} />
          </div>
        </motion.div>

        {/* Ratings trust line */}
        <div className="mx-4 mb-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-yellow-50 dark:bg-gray-900 border border-yellow-200 dark:border-gray-800">
          <div className="flex">
            {[1,2,3,4,5].map(s => <FiStar key={s} size={12} className="text-amber-400 fill-amber-400" />)}
          </div>
          <span className="text-[11px] text-gray-600 dark:text-gray-400 font-medium">4.8/5 from 12,000+ shoppers</span>
        </div>

        {/* Settings accordion */}
        <div className="mx-4 mb-6">
          <button
            onClick={() => setShowSettings(p => !p)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-500 text-sm transition"
          >
            <span className="font-semibold text-xs uppercase tracking-wider">Preferences</span>
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
                  {/* Font size */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setFontSize(f => Math.max(f - 0.1, 0.6))}
                      className="flex-1 flex items-center justify-center gap-2 bg-orange-50 dark:bg-gray-800 border border-orange-200 dark:border-gray-700 text-orange-600 py-2 rounded-xl text-xs font-semibold hover:bg-orange-100 transition"
                    >
                      <FiZoomOut size={13} /> Smaller
                    </button>
                    <button
                      onClick={() => setFontSize(f => Math.min(f + 0.1, 2))}
                      className="flex-1 flex items-center justify-center gap-2 bg-orange-50 dark:bg-gray-800 border border-orange-200 dark:border-gray-700 text-orange-600 py-2 rounded-xl text-xs font-semibold hover:bg-orange-100 transition"
                    >
                      <FiZoomIn size={13} /> Larger
                    </button>
                  </div>

                  {/* Dark mode */}
                  <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-xl text-xs font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                  >
                    {theme === 'dark' ? <FiSun size={13} /> : <span className="text-xs">🌙</span>}
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  </button>

                  {/* Language */}
                  <TranslateWidget />
                  <select
                    value={language}
                    onChange={e => setLanguage(e.target.value)}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-2 text-xs dark:bg-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-orange-400 outline-none"
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