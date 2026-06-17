'use client';

import { useEffect, useState, useRef } from 'react';
import {
  FiMenu, FiShoppingCart, FiPackage, FiSearch,
  FiBell, FiUser, FiX, FiChevronRight, FiTrendingUp,
} from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useCart } from '@/app/context/CartContext';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import SellerSidebar from '@/app/seller/sidebar/SellerSidebar';
import type { Notification } from '@/app/types/notification';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { CldImage } from 'next-cloudinary';
import { usePathname } from 'next/navigation';

type NavbarProps = {
  onOpenBuyerLogin?: () => void;
};

const countryData = [
  { name: 'Kenya',       code: 'KE', flag: 'https://flagcdn.com/w40/ke.png', dialCode: '+254', currency: 'KES' },
  { name: 'Uganda',      code: 'UG', flag: 'https://flagcdn.com/w40/ug.png', dialCode: '+256', currency: 'UGX' },
  { name: 'Tanzania',    code: 'TZ', flag: 'https://flagcdn.com/w40/tz.png', dialCode: '+255', currency: 'TZS' },
  { name: 'Rwanda',      code: 'RW', flag: 'https://flagcdn.com/w40/rw.png', dialCode: '+250', currency: 'RWF' },
  { name: 'Burundi',     code: 'BI', flag: 'https://flagcdn.com/w40/bi.png', dialCode: '+257', currency: 'BIF' },
  { name: 'South Sudan', code: 'SS', flag: 'https://flagcdn.com/w40/ss.png', dialCode: '+211', currency: 'SSP' },
  { name: 'Ethiopia',    code: 'ET', flag: 'https://flagcdn.com/w40/et.png', dialCode: '+251', currency: 'ETB' },
  { name: 'Somalia',     code: 'SO', flag: 'https://flagcdn.com/w40/so.png', dialCode: '+252', currency: 'SOS' },
];

// ─── Rotating promo messages ─────────────────────────────────────────────────
const promos = [
  '🎉 Free delivery on orders over Ksh 2,000 in Nairobi',
  '🔒 100% Secure Payments — M-Pesa, Visa & Mastercard',
  '↩️ 7-day hassle-free returns on all orders',
  '⚡ Flash Sale live now — up to 60% OFF selected items',
];

// ─── Trending search terms ────────────────────────────────────────────────────
const TRENDING_SEARCHES = [
  'iphone 16', 'iPhone 15', 'Samsung Galaxy', 'Nike Air Max', 'MacBook', 'Airpods Pro',
];

export default function Navbar({ onOpenBuyerLogin }: NavbarProps) {
  const [orderCount, setOrderCount]           = useState(0);
  const [searchTerm, setSearchTerm]           = useState('');
  const [suggestions, setSuggestions]         = useState<any[]>([]);
  const [currentPromo, setCurrentPromo]       = useState(0);
  const [showNotifModal, setShowNotifModal]   = useState(false);
  const [notifications, setNotifications]     = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown]       = useState(false);
  const [guestCountry, setGuestCountry]       = useState<any>(null);
  const [sidebarOpen, setSidebarOpen]         = useState(false);
  const [cartBounce, setCartBounce]           = useState(false);
  const [prevCartCount, setPrevCartCount]     = useState(0);
  const [searchFocused, setSearchFocused]     = useState(false);
  const [scrolled, setScrolled]               = useState(false);
  const [imgError, setImgError]               = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const searchRef   = useRef<HTMLDivElement | null>(null);
  const notifRef    = useRef<HTMLDivElement | null>(null);

  const router        = useRouter();
  const { cartItems } = useCart();
  const { user, logout } = useAuth();
  const pathname      = usePathname();
  const x             = useMotionValue(-288);

  const isSeller  = user?.role === 'seller';
  const cartCount = cartItems.reduce((t, i) => t + i.quantity, 0);

  // ── Bounce cart icon when item added ──────────────────────────────────────
  useEffect(() => {
    if (cartCount > prevCartCount) {
      setCartBounce(true);
      setTimeout(() => setCartBounce(false), 600);
    }
    setPrevCartCount(cartCount);
  }, [cartCount]);

  // ── Scroll shadow ──────────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Promo rotation ─────────────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      setCurrentPromo(p => (p + 1) % promos.length);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  // ── Country persistence ────────────────────────────────────────────────────
  useEffect(() => {
    if (guestCountry) localStorage.setItem('guestCountry', JSON.stringify(guestCountry));
  }, [guestCountry]);

  useEffect(() => {
    const stored = localStorage.getItem('guestCountry');
    if (stored) setGuestCountry(JSON.parse(stored));
  }, []);

  // ── IP geolocation for guests ──────────────────────────────────────────────
  useEffect(() => {
    if (user) return;
    const fetchGuestCountry = async () => {
      try {
        const res  = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        const found = data?.country_code
          ? countryData.find(c => c.code.toUpperCase() === data.country_code.toUpperCase()) ?? countryData[0]
          : countryData[0];
        setGuestCountry(found);
      } catch {
        setGuestCountry(countryData[0]);
      }
    };
    fetchGuestCountry();
  }, [user]);

  // ── Outside click ──────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowDropdown(false);
      if (searchRef.current   && !searchRef.current.contains(e.target as Node))   setSearchFocused(false);
      if (notifRef.current    && !notifRef.current.contains(e.target as Node))    setShowNotifModal(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Notifications ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const fetchNotifs = async () => {
      try {
        const role = isSeller ? 'seller' : 'buyer';
        const res  = await fetch(`/api/notifications?role=${role}&userId=${user._id}`);
        const json = await res.json();
        if (json.success) setNotifications(json.data);
      } catch {}
    };
    fetchNotifs();
  }, [user, isSeller]);

  // ── Seller order count ─────────────────────────────────────────────────────
  useEffect(() => {
    if (user?.role === 'seller' && user._id) {
      fetch('/api/orders/count', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerId: user._id }),
      })
        .then(r => r.json())
        .then(d => { if (d.count) setOrderCount(d.count); })
        .catch(() => {});
    }
  }, [user]);

  // ── Search suggestions ─────────────────────────────────────────────────────
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

  // ── reset broken-image flag whenever the image URL itself changes ─────────
  useEffect(() => { setImgError(false); }, [user?.image]);

  const getUserCountryData = (user?: any, guestCountry?: any) => {
    if (user?.country) {
      const isoCode = user.country;
      const match = countryData.find(
        (c) => c.code.toUpperCase() === isoCode.toUpperCase()
      );
      return match || countryData[0];
    }
    return guestCountry || countryData[0];
  };

  const currentCountry = getUserCountryData(user, guestCountry);

  const getPublicId = (url?: string) => {
    if (!url) return '';
    const m = url.match(/\/upload\/(?:v\d+\/)?([^.]+)/);
    return m ? m[1] : url;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // ── Does the user actually have a usable profile image? ───────────────────
  const hasProfileImage = Boolean(user?.image) && !imgError;

  // ─── Search dropdown (shared desktop + mobile) ──────────────────────────
  const SearchDropdown = () => (
    <AnimatePresence>
      {searchFocused && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.18 }}
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
                  onClick={() => {
                    router.push(`/product/${product.slug}`);
                    setSearchTerm('');
                    setSearchFocused(false);
                  }}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50 cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    <CldImage src={getPublicId(product.images[0])} alt={product.name} width={40} height={40} className="object-cover w-full h-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 font-medium truncate group-hover:text-orange-600 transition">{product.name}</p>
                    <p className="text-xs text-orange-500 font-bold">Ksh {product.calculatedPrice?.toLocaleString()}</p>
                  </div>
                  <FiChevronRight size={14} className="text-gray-300 group-hover:text-orange-400 transition flex-shrink-0" />
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
      {/* ── Promo Bar ─────────────────────────────────────────────────────── */}
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

      {/* ── Main Navbar ───────────────────────────────────────────────────── */}
      <nav
        className={`
          fixed top-6 left-0 w-full z-50 bg-white py-2.5 px-4
          flex items-center justify-between gap-3
          transition-all duration-300
          ${scrolled ? 'shadow-[0_4px_32px_rgba(0,0,0,0.10)]' : 'shadow-md'}
        `}
      >
        {/* Hamburger + Logo — grouped together */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => setSidebarOpen(true)}
            className="text-2xl text-orange-600"
            aria-label="Open menu"
          >
            <FiMenu />
          </motion.button>

          <motion.div
            whileHover={{ scale: 1.04 }}
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => router.push('/')}
          >
            <img
              src="/Logo.png"
              alt="NovaXmax"
              className="h-9 w-auto object-contain"
              style={{ clipPath: 'inset(5% 5% 5% 5%)' }}
            />
          </motion.div>
        </div>

        {/* Desktop Search — centered, hidden for sellers ───────────────── */}
        {!isSeller && (
          <div className="hidden md:flex flex-1 justify-center px-4 max-w-2xl mx-auto relative" ref={searchRef}>
            <div className="relative w-full">
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                placeholder="Search products, brands, categories..."
                className="w-full rounded-full border-2 border-orange-200 py-2.5 px-5 pr-12 text-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition-all duration-200 bg-orange-50/40"
              />
              <button
                onClick={() => { if (searchTerm) router.push(`/search?q=${encodeURIComponent(searchTerm)}`); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center hover:bg-orange-600 transition"
              >
                <FiSearch size={13} className="text-white" />
              </button>
              <SearchDropdown />
            </div>
          </div>
        )}

        {/* Spacer so right-icons stay right-aligned when search is hidden (seller view) */}
        {isSeller && <div className="flex-1" />}

        {/* Right icons ────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 flex-shrink-0">

          {/* Country + Currency (logged in only) */}
          {user && (
            <motion.div
              whileHover={{ scale: 1.04 }}
              className="hidden sm:flex items-center gap-1.5 border border-orange-200 rounded-full px-2.5 py-1 cursor-pointer hover:bg-orange-50 transition"
            >
              <img src={currentCountry.flag} alt={currentCountry.name} className="w-5 h-3.5 rounded-sm object-cover" />
              <span className="text-xs font-semibold text-gray-700">{currentCountry.currency}</span>
            </motion.div>
          )}

          {/* Cart / Orders ─────────────────────────────────────────────── */}
          {isSeller ? (
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => router.push('/seller/orders')}
              className="relative text-xl text-orange-500"
              aria-label="Orders"
            >
              <FiPackage />
              {orderCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-orange-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
                >
                  {orderCount}
                </motion.span>
              )}
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.88 }}
              animate={cartBounce ? { scale: [1, 1.35, 0.9, 1.1, 1] } : {}}
              transition={{ duration: 0.5 }}
              onClick={() => router.push('/cart')}
              className="relative text-xl text-orange-500"
              aria-label="Cart"
            >
              <FiShoppingCart />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          )}

          {/* Notifications ─────────────────────────────────────────────── */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => { setShowNotifModal(p => !p); setShowDropdown(false); }}
            className="relative text-xl text-orange-500"
            aria-label="Notifications"
          >
            <FiBell />
            {unreadCount > 0 && (
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, repeatDelay: 2, duration: 0.4 }}
                className="absolute -top-2 -right-2 bg-orange-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
              >
                {unreadCount}
              </motion.span>
            )}
          </motion.button>

          {/* User / Sign In ─────────────────────────────────────────────── */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <motion.div whileTap={{ scale: 0.9 }} onClick={() => setShowDropdown(p => !p)} className="cursor-pointer">
                {hasProfileImage ? (
                  <CldImage
                    src={getPublicId(user.image)}
                    alt="Profile"
                    width={34}
                    height={34}
                    crop="fill"
                    gravity="face"
                    className="rounded-full border-2 border-orange-300 object-cover w-[34px] h-[34px]"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-orange-100 border-2 border-orange-300 flex items-center justify-center">
                    <FiUser size={15} className="text-orange-500" />
                  </div>
                )}
              </motion.div>

              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 4, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 mt-2 bg-white shadow-2xl rounded-2xl border border-orange-100 z-50 w-44 overflow-hidden"
                  >
                    <div className="px-4 py-3 bg-orange-50 border-b border-orange-100">
                      <p className="text-xs font-semibold text-gray-800 truncate">{user.name}</p>
                      <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                    >
                      <LogOut size={15} /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onOpenBuyerLogin ? onOpenBuyerLogin() : router.push('/auth/google-login')}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm font-semibold py-2 px-5 rounded-full transition shadow-md shadow-orange-200"
            >
              Sign In
            </motion.button>
          )}
        </div>

        {/* Notifications panel ────────────────────────────────────────────── */}
        <AnimatePresence>
          {showNotifModal && (
            <motion.div
              ref={notifRef}
              initial={{ opacity: 0, y: -10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.97 }}
              transition={{ duration: 0.22 }}
              className="absolute right-4 top-16 w-88 max-w-[calc(100vw-2rem)] bg-white/95 backdrop-blur-md border border-orange-100 rounded-2xl shadow-2xl z-[60] overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-orange-100 bg-gradient-to-r from-orange-50 to-white flex justify-between items-center">
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

      {/* ── Mobile Search — always visible just below nav icons, hidden for sellers ── */}
      {!isSeller && (
        <div
          ref={searchRef}
          className="md:hidden fixed top-[60px] left-0 w-full bg-white border-b border-orange-100 z-40 px-4 py-2.5"
        >
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              placeholder="Search products, brands, categories..."
              className="w-full rounded-full border-2 border-orange-200 py-2.5 px-5 pr-12 text-sm
                focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none
                transition-all duration-200 bg-orange-50/40"
            />
            <button
              onClick={() => { if (searchTerm) router.push(`/search?q=${encodeURIComponent(searchTerm)}`); }}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-orange-500
                flex items-center justify-center hover:bg-orange-600 transition"
            >
              <FiSearch size={13} className="text-white" />
            </button>
            <SearchDropdown />
          </div>
        </div>
      )}

      {/* ── Edge swipe (mobile) ─────────────────────────────────────────────── */}
      <div
        className="fixed top-0 left-0 h-full w-5 z-[9998] md:hidden"
        onTouchStart={() => { if (!sidebarOpen) setSidebarOpen(true); }}
      />

      {/* ── Sidebar Drawer ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="md:hidden fixed inset-0 z-[9999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              drag="x"
              dragConstraints={{ left: -288, right: 0 }}
              dragElastic={0.08}
              style={{ x }}
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ type: 'spring', stiffness: 320, damping: 35 }}
              onDragEnd={(_, info) => {
                if (info.offset.x < -120 || info.velocity.x < -500) {
                  setSidebarOpen(false);
                  x.set(-288);
                } else {
                  x.set(0);
                }
              }}
              className="absolute top-0 left-0 bg-white dark:bg-gray-900 shadow-2xl h-full w-72 touch-pan-y"
            >
              {isSeller
                ? <SellerSidebar onClose={() => setSidebarOpen(false)} />
                : <Sidebar onClose={() => setSidebarOpen(false)} />
              }
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}