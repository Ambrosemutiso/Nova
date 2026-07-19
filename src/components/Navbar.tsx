'use client';

import { useEffect, useState, useRef } from 'react';
import {
  FiShoppingCart, FiPackage, FiSearch,
  FiBell, FiUser, FiX, FiChevronRight, FiTrendingUp,
  FiChevronDown, FiMapPin, FiGrid,
} from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useCart } from '@/app/context/CartContext';
import { LogOut, Package, Heart, Wallet, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import type { Notification } from '@/app/types/notification';
import { motion, AnimatePresence } from 'framer-motion';
import { CldImage } from 'next-cloudinary';
import { usePathname } from 'next/navigation';
import { categoryTree } from '@/lib/sidebarProductCategories';
import { slugify } from '@/lib/slugify';

type NavbarProps = {
  onOpenBuyerLogin?: () => void;
};

const countryData = [
  { name: 'Kenya',       code: 'KE', flag: 'https://flagcdn.com/w40/ke.png', dialCode: '+254', currency: 'KES' },
  { name: 'Uganda',      code: 'UG', flag: 'https://flagcdn.com/w40/ug.png', dialCode: '+256', currency: 'UGX' },
  { name: 'Tanzania',    code: 'TZ', flag: 'https://flagcdn.com/w40/tz.png', dialCode: '+255', currency: 'TZS' },
  { name: 'Rwanda',      code: 'RW', flag: 'https://flagcdn.com/w40/rw.png', dialCode: '+250', currency: 'RWF' },
  { name: 'Ethiopia',    code: 'ET', flag: 'https://flagcdn.com/w40/et.png', dialCode: '+251', currency: 'ETB' },
];

const promos = [
  '🎉 Free delivery on orders over Ksh 2,000 in Nairobi',
  '🔒 100% Secure Payments — M-Pesa, Visa & Mastercard',
  '↩️ 7-day hassle-free returns on all orders',
  '⚡ Flash Sale live now — up to 60% OFF selected items',
];

const TRENDING_SEARCHES = [
  'iPhone 16', 'Samsung Galaxy', 'Nike Air Max', 'MacBook', 'Airpods Pro', 'Smart TV',
];

// Top categories shown in mega-nav bar (a curated subset of categoryTree keys)
const TOP_CATEGORIES = [
  'Mobile Phones & Accessories',
  'Computers & Laptops',
  'Electronics',
  'Fashion',
  'Home & Kitchen',
  'Beauty & Personal Care',
  'Sports & Outdoors',
  'Baby & Kids',
  'Gaming',
  'Food & Groceries',
];

export default function Navbar({ onOpenBuyerLogin }: NavbarProps) {
  const [orderCount, setOrderCount]         = useState(0);
  const [searchTerm, setSearchTerm]         = useState('');
  const [suggestions, setSuggestions]       = useState<any[]>([]);
  const [currentPromo, setCurrentPromo]     = useState(0);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [notifications, setNotifications]   = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown]     = useState(false);
  const [guestCountry, setGuestCountry]     = useState<any>(null);
  const [cartBounce, setCartBounce]         = useState(false);
  const [prevCartCount, setPrevCartCount]   = useState(0);
  const [searchFocused, setSearchFocused]   = useState(false);
  const [scrolled, setScrolled]             = useState(false);
  const [imgError, setImgError]             = useState(false);
  // active mega-nav category (desktop hover)
  const [activeCat, setActiveCat]           = useState<string | null>(null);
  const megaRef                             = useRef<HTMLDivElement>(null);
  const leaveTimer                          = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const searchRef   = useRef<HTMLDivElement | null>(null);
  const notifRef    = useRef<HTMLDivElement | null>(null);

  const router        = useRouter();
  const { cartItems } = useCart();
  const { user, logout } = useAuth();
  const pathname      = usePathname();

  const isSeller  = user?.role === 'seller';
  const cartCount = cartItems.reduce((t, i) => t + i.quantity, 0);

  // ── Cart bounce ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (cartCount > prevCartCount) {
      setCartBounce(true);
      setTimeout(() => setCartBounce(false), 600);
    }
    setPrevCartCount(cartCount);
  }, [cartCount]);

  // ── Scroll shadow ───────────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Promo rotation ──────────────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => setCurrentPromo(p => (p + 1) % promos.length), 3500);
    return () => clearInterval(id);
  }, []);

  // ── Country ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (guestCountry) localStorage.setItem('guestCountry', JSON.stringify(guestCountry));
  }, [guestCountry]);

  useEffect(() => {
    const stored = localStorage.getItem('guestCountry');
    if (stored) { setGuestCountry(JSON.parse(stored)); return; }
    if (user) return;
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(d => {
        const found = d?.country_code
          ? countryData.find(c => c.code.toUpperCase() === d.country_code.toUpperCase()) ?? countryData[0]
          : countryData[0];
        setGuestCountry(found);
      })
      .catch(() => setGuestCountry(countryData[0]));
  }, [user]);

  // ── Outside click ───────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowDropdown(false);
      if (searchRef.current   && !searchRef.current.contains(e.target as Node))   setSearchFocused(false);
      if (notifRef.current    && !notifRef.current.contains(e.target as Node))    setShowNotifModal(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Notifications ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const role = isSeller ? 'seller' : 'buyer';
    fetch(`/api/notifications?role=${role}&userId=${user._id}`)
      .then(r => r.json())
      .then(j => { if (j.success) setNotifications(j.data); })
      .catch(() => {});
  }, [user, isSeller]);

  // ── Seller order count ──────────────────────────────────────────────────────
  useEffect(() => {
    if (user?.role !== 'seller' || !user._id) return;
    fetch('/api/orders/count', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sellerId: user._id }),
    })
      .then(r => r.json())
      .then(d => { if (d.count) setOrderCount(d.count); })
      .catch(() => {});
  }, [user]);

  // ── Search suggestions ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!searchTerm.trim()) { setSuggestions([]); return; }
    const tid = setTimeout(async () => {
      try {
        const res  = await fetch(`/api/products/suggest?q=${encodeURIComponent(searchTerm)}`);
        const data = await res.json();
        setSuggestions(data.slice(0, 6));
      } catch {}
    }, 280);
    return () => clearTimeout(tid);
  }, [searchTerm]);

  useEffect(() => { setImgError(false); }, [user?.image]);

  const getUserCountryData = () => {
    if (user?.country) {
      const match = countryData.find(c => c.code.toUpperCase() === c.name.toUpperCase());
      return match || countryData[0];
    }
    return guestCountry || countryData[0];
  };

  const currentCountry = getUserCountryData();

  const getPublicId = (url?: string) => {
    if (!url) return '';
    const m = url.match(/\/upload\/(?:v\d+\/)?([^.]+)/);
    return m ? m[1] : url;
  };

  const unreadCount    = notifications.filter(n => !n.read).length;
  const hasProfileImage = Boolean(user?.image) && !imgError;

  // ── Subcategories for hovered category ─────────────────────────────────────
  const activeSubs: string[] = activeCat
    ? Object.keys((categoryTree as any)[activeCat] || {})
    : [];

  const handleCatEnter = (cat: string) => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setActiveCat(cat);
  };

  const handleCatLeave = () => {
    leaveTimer.current = setTimeout(() => setActiveCat(null), 180);
  };

  const handleMegaEnter = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
  };

  // ── Mobile avatar/location tap target ───────────────────────────────────────
  // Previously opened the seller/buyer sidebar drawer; now that the sidebars
  // are gone this routes straight to the relevant page instead.
  const handleMobileIdentityTap = () => {
    if (user) {
      router.push(isSeller ? '/seller/dashboard' : '/account');
    } else {
      onOpenBuyerLogin?.();
    }
  };

  /* ════════════════════════════════════════════════════════════════
     SEARCH DROPDOWN
  ════════════════════════════════════════════════════════════════ */
  const SearchDropdown = () => (
    <AnimatePresence>
      {searchFocused && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.15 }}
          className="absolute top-full left-0 mt-2 w-full bg-white rounded-2xl shadow-2xl border border-orange-100 z-[80] overflow-hidden"
        >
          {suggestions.length === 0 ? (
            <div className="px-4 py-3">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                <FiTrendingUp size={11} /> Trending now
              </p>
              <div className="flex flex-wrap gap-2">
                {TRENDING_SEARCHES.map(term => (
                  <button
                    key={term}
                    onClick={() => { setSearchTerm(term); setSearchFocused(true); }}
                    className="text-xs px-3 py-1.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 transition font-medium"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <ul className="max-h-72 overflow-y-auto divide-y divide-orange-50/60">
              {suggestions.map((product: any, i) => (
                <li
                  key={i}
                  onClick={() => { router.push(`/product/${product.slug}`); setSearchTerm(''); setSearchFocused(false); }}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50 cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    <CldImage src={getPublicId(product.images[0])} alt={product.name} width={40} height={40} className="object-cover w-full h-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 font-medium truncate group-hover:text-orange-600 transition">{product.name}</p>
                    <p className="text-xs text-orange-500 font-bold">Ksh {product.calculatedPrice?.toLocaleString()}</p>
                  </div>
                  <FiChevronRight size={14} className="text-gray-300 group-hover:text-orange-400 flex-shrink-0" />
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* ══ PROMO BAR ═══════════════════════════════════════════════════════════ */}
      <div className="fixed top-0 left-0 w-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white text-xs py-1.5 z-50 flex justify-center items-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPromo}
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -16, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="font-medium tracking-wide"
          >
            {promos[currentPromo]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ══ MAIN NAV ROW ════════════════════════════════════════════════════════ */}
      <nav
        className={`fixed top-6 left-0 w-full z-50 bg-white transition-shadow duration-300
          ${scrolled ? 'shadow-[0_4px_32px_rgba(0,0,0,0.10)]' : 'shadow-sm border-b border-gray-100'}`}
      >
        {/* ─── Top row ────────────────────────────────────────────────────────── */}
        <div className="max-w-[1400px] mx-auto px-4 h-14 flex items-center gap-4">

          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="flex-shrink-0 cursor-pointer"
            onClick={() => router.push('/')}
          >
            <img src="/Logo.png" alt="NovaXmax" className="h-9 w-auto object-contain" style={{ clipPath: 'inset(5% 5% 5% 5%)' }} />
          </motion.div>

          {/* ── DESKTOP ONLY: Location ─────────────────────────────────────── */}
          <button className="hidden lg:flex items-center gap-1.5 text-left flex-shrink-0 hover:text-orange-600 transition-colors group">
            <FiMapPin size={13} className="text-orange-500 flex-shrink-0" />
            <div>
              <p className="text-[9px] text-gray-400 leading-none">Deliver to</p>
              <p className="text-xs font-bold text-gray-800 group-hover:text-orange-600 leading-none mt-0.5 flex items-center gap-0.5">
                {currentCountry?.name || 'Kenya'}
                <FiChevronDown size={10} />
              </p>
            </div>
          </button>

          {/* ── Search ────────────────────────────────────────────────────────── */}
          {!isSeller && (
            <div
              className="hidden md:flex flex-1 relative max-w-2xl"
              ref={searchRef}
            >
              <div className="relative w-full flex">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onKeyDown={e => { if (e.key === 'Enter' && searchTerm) router.push(`/search?q=${encodeURIComponent(searchTerm)}`); }}
                  placeholder="Search products, brands, categories..."
                  className="w-full rounded-l-full border-2 border-orange-400 border-r-0 py-2.5 px-5 text-sm
                    focus:outline-none focus:border-orange-500 bg-white transition-all"
                />
                <button
                  onClick={() => { if (searchTerm) router.push(`/search?q=${encodeURIComponent(searchTerm)}`); }}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-5 rounded-r-full transition-colors flex-shrink-0 flex items-center gap-1.5 text-sm font-semibold"
                >
                  <FiSearch size={15} />
                  <span className="hidden lg:inline">Search</span>
                </button>
              </div>
              <SearchDropdown />
            </div>
          )}

          {isSeller && <div className="flex-1" />}

          {/* ── Desktop right cluster ──────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-1 flex-shrink-0">

            {/* Account */}
            <div className="relative" ref={dropdownRef}>
              {user ? (
                <button
                  onClick={() => setShowDropdown(p => !p)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-orange-50 transition-colors group"
                >
                  {hasProfileImage ? (
                    <CldImage src={getPublicId(user.image)} alt="Profile" width={28} height={28} crop="fill" gravity="face"
                      className="rounded-full border-2 border-orange-300 object-cover w-7 h-7"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-orange-100 border-2 border-orange-300 flex items-center justify-center">
                      <FiUser size={13} className="text-orange-500" />
                    </div>
                  )}
                  <div className="text-left">
                    <p className="text-[9px] text-gray-400 leading-none">Hello, {user.name?.split(' ')[0]}</p>
                    <p className="text-xs font-bold text-gray-800 group-hover:text-orange-600 leading-none mt-0.5 flex items-center gap-0.5">
                      Account <FiChevronDown size={10} />
                    </p>
                  </div>
                </button>
              ) : (
                <button
                  onClick={() => setShowDropdown(p => !p)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-orange-50 transition-colors group"
                >
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                    <FiUser size={13} className="text-gray-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-[9px] text-gray-400 leading-none">Hello, Guest</p>
                    <p className="text-xs font-bold text-gray-800 group-hover:text-orange-600 leading-none mt-0.5 flex items-center gap-0.5">
                      Sign In <FiChevronDown size={10} />
                    </p>
                  </div>
                </button>
              )}

              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 4, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-1 bg-white shadow-2xl rounded-2xl border border-gray-100 z-50 w-52 overflow-hidden"
                  >
                    {user ? (
                      <>
                        <div className="px-4 py-3 bg-orange-50 border-b border-orange-100">
                          <p className="text-xs font-bold text-gray-800 truncate">{user.name}</p>
                          <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                        </div>
                        {[
                          { label: 'My Orders',       icon: ShoppingBag,  href: '/orders' },
                          { label: 'Wishlist',         icon: Heart,        href: '/wishlist' },
                          { label: 'My Wallet',        icon: Wallet,       href: '/wallet' },
                          { label: 'My Installments',  icon: Package,      href: '/installments/progress' },
                        ].map(({ label, icon: Icon, href }) => (
                          <button
                            key={href}
                            onClick={() => { router.push(href); setShowDropdown(false); }}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 transition"
                          >
                            <Icon size={14} className="text-orange-500" /> {label}
                          </button>
                        ))}
                        <div className="border-t border-gray-100" />
                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                        >
                          <LogOut size={14} /> Logout
                        </button>
                      </>
                    ) : (
                      <div className="p-4 space-y-2">
                        <button
                          onClick={() => { onOpenBuyerLogin?.(); setShowDropdown(false); }}
                          className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold py-2.5 rounded-xl transition"
                        >
                          Sign In
                        </button>
                        <p className="text-[11px] text-center text-gray-400">New customer? <span className="text-orange-500 cursor-pointer font-semibold" onClick={() => { onOpenBuyerLogin?.(); setShowDropdown(false); }}>Register</span></p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Orders / Seller orders */}
            {isSeller ? (
              <button
                onClick={() => router.push('/seller/orders')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-orange-50 transition-colors group relative"
              >
                <div className="relative">
                  <FiPackage size={18} className="text-gray-700 group-hover:text-orange-600 transition-colors" />
                  {orderCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                      {orderCount}
                    </span>
                  )}
                </div>
                <div className="text-left">
                  <p className="text-[9px] text-gray-400 leading-none">Returns &</p>
                  <p className="text-xs font-bold text-gray-800 group-hover:text-orange-600 leading-none mt-0.5">Orders</p>
                </div>
              </button>
            ) : (
              <button
                onClick={() => router.push('/orders')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-orange-50 transition-colors group"
              >
                <FiPackage size={18} className="text-gray-700 group-hover:text-orange-600 transition-colors" />
                <div className="text-left">
                  <p className="text-[9px] text-gray-400 leading-none">Returns &</p>
                  <p className="text-xs font-bold text-gray-800 group-hover:text-orange-600 leading-none mt-0.5">Orders</p>
                </div>
              </button>
            )}

            {/* Notifications */}
            <button
              onClick={() => { setShowNotifModal(p => !p); setShowDropdown(false); }}
              className="relative flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-orange-50 transition-colors group"
            >
              <div className="relative">
                <FiBell size={18} className="text-gray-700 group-hover:text-orange-600 transition-colors" />
                {unreadCount > 0 && (
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, repeatDelay: 2, duration: 0.4 }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1"
                  >
                    {unreadCount}
                  </motion.span>
                )}
              </div>
              <div className="text-left">
                <p className="text-[9px] text-gray-400 leading-none">Your</p>
                <p className="text-xs font-bold text-gray-800 group-hover:text-orange-600 leading-none mt-0.5">Alerts</p>
              </div>
            </button>

            {/* Cart */}
            {!isSeller && (
              <motion.button
                whileTap={{ scale: 0.88 }}
                animate={cartBounce ? { scale: [1, 1.25, 0.9, 1.1, 1] } : {}}
                transition={{ duration: 0.5 }}
                onClick={() => router.push('/cart')}
                className="relative flex items-center gap-2 pl-3 pr-4 py-1.5 rounded-xl hover:bg-orange-50 transition-colors group"
              >
                <div className="relative">
                  <FiShoppingCart size={20} className="text-gray-700 group-hover:text-orange-600 transition-colors" />
                  <AnimatePresence>
                    {cartCount > 0 && (
                      <motion.span
                        key={cartCount}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-2.5 -right-2.5 bg-orange-500 text-white text-[10px] font-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
                      >
                        {cartCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <div className="text-left">
                  <p className="text-[9px] text-gray-400 leading-none">My</p>
                  <p className="text-xs font-bold text-gray-800 group-hover:text-orange-600 leading-none mt-0.5">Cart</p>
                </div>
              </motion.button>
            )}
          </div>

          {/* ── Mobile right: bell + cart ────────────────────────────────────── */}
          <div className="flex md:hidden items-center gap-3 ml-auto">
            <button
              onClick={() => { setShowNotifModal(p => !p); }}
              className="relative text-gray-700"
            >
              <FiBell size={22} />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5">
                  {unreadCount}
                </span>
              )}
            </button>
            {!isSeller && (
              <motion.button
                whileTap={{ scale: 0.88 }}
                animate={cartBounce ? { scale: [1, 1.25, 0.9, 1.1, 1] } : {}}
                transition={{ duration: 0.5 }}
                onClick={() => router.push('/cart')}
                className="relative text-gray-700"
              >
                <FiShoppingCart size={22} />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      key={cartCount}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-2 -right-2 bg-orange-500 text-white text-[9px] font-black rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            )}
          </div>
        </div>

        {/* ─── Desktop category mega-nav bar ────────────────────────────────── */}
        {!isSeller && (
          <div className="hidden md:block border-t border-gray-100 bg-white">
            <div className="max-w-[1400px] mx-auto px-4">
              <div className="flex items-center h-10 gap-0">

                {/* All Categories button */}
                <button
                  onMouseEnter={() => handleCatEnter(TOP_CATEGORIES[0])}
                  onMouseLeave={handleCatLeave}
                  onClick={() => router.push('/')}
                  className="flex items-center gap-1.5 pr-4 mr-2 border-r border-gray-200 h-full text-sm font-bold text-gray-800 hover:text-orange-600 transition-colors flex-shrink-0"
                >
                  <FiGrid size={14} className="text-orange-500" />
                  All Categories
                </button>

                {/* Category links */}
                {TOP_CATEGORIES.map(cat => (
                  <div
                    key={cat}
                    onMouseEnter={() => handleCatEnter(cat)}
                    onMouseLeave={handleCatLeave}
                    className="relative h-full flex items-center"
                  >
                    <button
                      onClick={() => router.push(`/category/${slugify(cat)}`)}
                      className={`px-3 h-full text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1
                        ${activeCat === cat ? 'text-orange-600 border-b-2 border-orange-500' : 'text-gray-700 hover:text-orange-600'}`}
                    >
                      {cat.split(' & ')[0].split(' ')[0]}
                      {/* show subcategory chevron if this category has children */}
                      {Object.keys((categoryTree as any)[cat] || {}).length > 0 && (
                        <FiChevronDown size={11} className="opacity-50" />
                      )}
                    </button>
                  </div>
                ))}

                {/* Flash sale pill — far right of the bar */}
                <button
                  onClick={() => router.push('/deals')}
                  className="ml-auto flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full transition-colors flex-shrink-0"
                >
                  ⚡ Flash Sale
                </button>
              </div>
            </div>

            {/* Mega dropdown panel */}
            <AnimatePresence>
              {activeCat && activeSubs.length > 0 && (
                <motion.div
                  ref={megaRef}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  onMouseEnter={handleMegaEnter}
                  onMouseLeave={handleCatLeave}
                  className="absolute left-0 w-full bg-white shadow-2xl border-t border-orange-100 z-[70]"
                >
                  <div className="max-w-[1400px] mx-auto px-6 py-5">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{activeCat}</p>
                    <div className="grid grid-cols-4 xl:grid-cols-6 gap-x-8 gap-y-1.5">
                      {activeSubs.map(sub => (
                        <button
                          key={sub}
                          onClick={() => {
                            router.push(`/category/${slugify(activeCat)}?sub=${slugify(sub)}`);
                            setActiveCat(null);
                          }}
                          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-orange-600 transition-colors text-left py-1 group"
                        >
                          <FiChevronRight size={11} className="text-gray-300 group-hover:text-orange-400 flex-shrink-0" />
                          <span className="truncate">{sub}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ─── Notifications panel ──────────────────────────────────────────── */}
        <AnimatePresence>
          {showNotifModal && (
            <motion.div
              ref={notifRef}
              initial={{ opacity: 0, y: -10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="absolute right-4 top-full mt-1 w-80 max-w-[calc(100vw-2rem)] bg-white/95 backdrop-blur-md border border-orange-100 rounded-2xl shadow-2xl z-[60] overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-orange-100 bg-orange-50 flex justify-between items-center">
                <h4 className="font-bold text-gray-800 text-sm">Notifications</h4>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-orange-500 text-white px-2 py-0.5 rounded-full font-semibold">{unreadCount} new</span>
                  )}
                  <button onClick={() => setShowNotifModal(false)} className="text-gray-400 hover:text-gray-600">
                    <FiX size={15} />
                  </button>
                </div>
              </div>

              {notifications.length > 0 ? (
                <ul className="max-h-72 overflow-y-auto divide-y divide-orange-50">
                  {notifications.map((notif, i) => (
                    <li
                      key={i}
                      onClick={() => setShowNotifModal(false)}
                      className={`px-4 py-3 text-sm flex flex-col gap-0.5 hover:bg-orange-50 cursor-pointer transition ${notif.read ? 'text-gray-500' : 'text-gray-900 font-semibold'}`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="leading-snug">{notif.message || 'New update available'}</span>
                        {!notif.read && <span className="flex-shrink-0 w-2 h-2 rounded-full bg-orange-500 mt-1.5" />}
                      </div>
                      <span className="text-[11px] text-gray-400">{new Date(notif.createdAt).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-6 text-center text-gray-400 text-sm">
                  <FiBell size={28} className="mx-auto mb-2 opacity-30" />
                  You're all caught up!
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ══ MOBILE SEARCH BAR (below main nav, above content) ═══════════════════ */}
      {!isSeller && (
        <div
          ref={searchRef}
          className="md:hidden fixed z-40 px-3 py-2"
          style={{ top: '6rem', left: 0, right: 0, background: 'white', borderBottom: '1px solid #f1f1f1' }}
        >
          <div className="relative flex">
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onKeyDown={e => { if (e.key === 'Enter' && searchTerm) router.push(`/search?q=${encodeURIComponent(searchTerm)}`); }}
              placeholder="Search products, brands..."
              className="flex-1 rounded-l-full border-2 border-orange-400 border-r-0 py-2 px-4 text-sm focus:outline-none bg-white"
            />
            <button
              onClick={() => { if (searchTerm) router.push(`/search?q=${encodeURIComponent(searchTerm)}`); }}
              className="bg-orange-500 text-white px-4 rounded-r-full flex items-center"
            >
              <FiSearch size={16} />
            </button>
            <SearchDropdown />
          </div>
        </div>
      )}

      {/* ══ MOBILE: top-left avatar + location strip ════════════════════════════ */}
      <div
        className="md:hidden fixed z-40 left-0 right-0 flex items-center justify-between px-4"
        style={{ top: '1.5rem', height: '3.5rem' }}
      >
        {/* Left: avatar + location */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <button onClick={handleMobileIdentityTap} className="flex-shrink-0">
                {hasProfileImage ? (
                  <CldImage src={getPublicId(user.image)} alt="Profile" width={34} height={34} crop="fill" gravity="face"
                    className="rounded-full border-2 border-orange-400 w-[34px] h-[34px] object-cover"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="w-[34px] h-[34px] rounded-full bg-orange-100 border-2 border-orange-400 flex items-center justify-center">
                    <FiUser size={15} className="text-orange-500" />
                  </div>
                )}
              </button>
              <button onClick={handleMobileIdentityTap} className="flex flex-col leading-none">
                <span className="text-[9px] text-gray-400">Deliver to</span>
                <span className="text-xs font-bold text-gray-800 flex items-center gap-0.5">
                  {currentCountry?.name || 'Kenya'} <FiChevronDown size={10} />
                </span>
              </button>
            </>
          ) : (
            <button onClick={handleMobileIdentityTap} className="flex items-center gap-1.5">
              <div className="w-[34px] h-[34px] rounded-full bg-gray-100 flex items-center justify-center">
                <FiUser size={15} className="text-gray-500" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[9px] text-gray-400">Deliver to</span>
                <span className="text-xs font-bold text-gray-800">{currentCountry?.name || 'Kenya'}</span>
              </div>
            </button>
          )}
        </div>

        {/* Centre: Logo */}
        <img
          src="/Logo.png"
          alt="NovaXmax"
          className="h-8 w-auto object-contain cursor-pointer absolute left-1/2 -translate-x-1/2"
          style={{ clipPath: 'inset(5% 5% 5% 5%)' }}
          onClick={() => router.push('/')}
        />
      </div>
    </>
  );
}