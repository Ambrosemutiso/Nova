'use client';

import { useEffect, useState, useRef } from 'react';
import { FiMenu, FiShoppingCart, FiPackage, FiSearch, FiBell, FiUser } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useCart } from '@/app/context/CartContext';
import Sidebar from './Sidebar';
import SellerSidebar from '@/app/seller/sidebar/SellerSidebar';
import Image from 'next/image';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import type { Notification } from '@/app/types/notification';
import { motion, AnimatePresence } from 'framer-motion';
import { CldImage } from 'next-cloudinary';

type NavbarProps = {
  onOpenBuyerLogin?: () => void;
  onOpenSellerLogin?: () => void;
};

const countryData = [
  { name: 'Kenya', code: 'KE', flag: 'https://flagcdn.com/w40/ke.png', dialCode: '+254', currency: 'KES' },
  { name: 'Uganda', code: 'UG', flag: 'https://flagcdn.com/w40/ug.png', dialCode: '+256', currency: 'UGX' },
  { name: 'Tanzania', code: 'TZ', flag: 'https://flagcdn.com/w40/tz.png', dialCode: '+255', currency: 'TZS' },
  { name: 'Rwanda', code: 'RW', flag: 'https://flagcdn.com/w40/rw.png', dialCode: '+250', currency: 'RWF' },
  { name: 'Burundi', code: 'BI', flag: 'https://flagcdn.com/w40/bi.png', dialCode: '+257', currency: 'BIF' },
  { name: 'South Sudan', code: 'SS', flag: 'https://flagcdn.com/w40/ss.png', dialCode: '+211', currency: 'SSP' },
  { name: 'Ethiopia', code: 'ET', flag: 'https://flagcdn.com/w40/et.png', dialCode: '+251', currency: 'ETB' },
  { name: 'Somalia', code: 'SO', flag: 'https://flagcdn.com/w40/so.png', dialCode: '+252', currency: 'SOS' },
];

export default function Navbar({ onOpenBuyerLogin, onOpenSellerLogin }: NavbarProps) {
  const [showSidebar, setShowSidebar] = useState(false);
  const [orderCount, setOrderCount] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [currentPromo, setCurrentPromo] = useState(0);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [guestCountry, setGuestCountry] = useState<any>(null);

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const notifRef = useRef<HTMLDivElement | null>(null);

  const router = useRouter();
  const { cartItems } = useCart();
  const { user, logout } = useAuth();

  const isSeller = user?.role === 'seller';
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const promos = [
    '🔥 Flash Sale! Up to 50% off selected products!',
    '📞 Contact us: +254 798 437 508',
    '🚚 Free delivery for orders above Ksh 2,000!',
    '💳 Secure Payments via M-Pesa & AirtelMoney',
  ];

  useEffect(() => {
  if (guestCountry) localStorage.setItem("guestCountry", JSON.stringify(guestCountry));
}, [guestCountry]);

useEffect(() => {
  const stored = localStorage.getItem("guestCountry");
  if (stored) setGuestCountry(JSON.parse(stored));
}, []);

  // 🌍 NEW: Fetch guest country via IP if user not logged in
  useEffect(() => {
    const fetchGuestCountry = async () => {
      if (user) return; // skip for logged-in users

      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();

        if (data && data.country_code) {
          const foundCountry =
            countryData.find(
              (c) => c.code.toUpperCase() === data.country_code.toUpperCase()
            ) || countryData[0];

          setGuestCountry(foundCountry);
        } else {
          setGuestCountry(countryData[0]); // fallback Kenya
        }
      } catch (err) {
        console.error("IP lookup failed:", err);
        setGuestCountry(countryData[0]); // fallback
      }
    };

    fetchGuestCountry();
  }, [user]);

  // ✅ Unified function for flag + currency
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

  // 🔸 Promo rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPromo((prev) => (prev + 1) % promos.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // 🔹 Close dropdown/search/notif on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node))
        setShowDropdown(false);
      if (searchRef.current && !searchRef.current.contains(event.target as Node))
        setShowSearch(false);
      if (notifRef.current && !notifRef.current.contains(event.target as Node))
        setShowNotifModal(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 🔹 Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      try {
        const role = isSeller ? 'seller' : 'buyer';
        const res = await fetch(`/api/notifications?role=${role}&userId=${user._id}`);
        const json = await res.json();
        if (json.success) setNotifications(json.data);
      } catch (error) {
        console.error('Failed to fetch notifications', error);
      }
    };
    fetchNotifications();
  }, [user, isSeller]);

  // 🔹 Seller order count
  useEffect(() => {
    if (user?.role === 'seller' && user._id) {
      fetchOrders(user._id);
    }
  }, [user]);

  const fetchOrders = async (sellerId?: string) => {
    if (!sellerId) return;
    try {
      const res = await fetch('/api/orders/count', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerId }),
      });
      const data = await res.json();
      if (res.ok) setOrderCount(data.count);
    } catch (err) {
      console.error('Failed to fetch order count:', err);
    }
  };

  // 🔹 Product search suggestions
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSuggestions([]);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products/suggest?q=${encodeURIComponent(searchTerm)}`);
        const data = await res.json();
        setSuggestions(data.slice(0, 5));
      } catch (error) {
        console.error('Suggestion fetch failed', error);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const getPublicId = (url?: string) => {
    if (!url || typeof url !== 'string') return '';
    const match = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
    return match ? match[1] : url;
  };

  return (
    <>
      {/* 🔸 Promo Bar */}
      <div className="fixed top-0 left-0 w-full bg-gradient-to-r from-orange-500 via-orange-400 to-orange-600 text-white text-sm py-1 z-50 flex justify-center items-center">
        <motion.div
          key={currentPromo}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center font-medium"
        >
          {promos[currentPromo]}
        </motion.div>
      </div>

      {/* 🔹 Navbar */}
      <nav className="fixed top-6 left-0 w-full z-50 bg-gradient-to-b from-orange-50 via-white to-orange-100 dark:from-gray-900 dark:to-gray-800 shadow-lg py-3 px-4 flex items-center justify-between transition-all">
        {/* Sidebar Button */}
        <button onClick={() => setShowSidebar(true)} className="text-2xl text-orange-600">
          <FiMenu />
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
      <img
      src="/Logo.png"
      alt="NovaXmax Logo"
      className="h-10 w-auto object-contain object-center scale-110 hover:scale-115 transition-transform duration-300 rounded-none
        dark:invert dark:brightness-110 dark:contrast-105 dark:drop-shadow-[0_0_6px_rgba(255,255,255,0.25)]"
      style={{
        clipPath: 'inset(5% 5% 5% 5%)', // hides extra white borders if present
      }}
    />   
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4 relative ml-auto">
          {/* Search */}
<div
  ref={searchRef}
  className="relative flex items-center"
>
  <AnimatePresence>
    {showSearch && (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.25 }}
        className="
          fixed 
          right-0
          left-1/2
          top-16
          w-[92vw]
          max-w-[420px]
          md:w-[240px]
          md:top-0
          md:-right-8
          z-[9999]
          md: translate-x-0
          md: fixed-none
        "
      >
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search products..."
          className="w-full border border-orange-300 rounded-full py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
        />

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <ul className="absolute top-10 left-0 w-full bg-white border border-orange-200 rounded-lg shadow-lg z-[70] max-h-80 overflow-y-auto">
            {suggestions.map((product: any, i) => (
              <li
                key={i}
                onClick={() => {
                  router.push(`/product/${product._id}`);
                  setSearchTerm('');
                  setShowSearch(false);
                }}
                className="flex items-center gap-3 px-3 py-2 hover:bg-orange-50 cursor-pointer"
              >
                <CldImage
                  src={getPublicId(product.images[0])}
                  alt={product.name}
                  width="40"
                  height="40"
                  className="rounded-md object-cover"
                />
                <div className="flex flex-col">
                  <span className="text-sm text-gray-800 font-medium truncate max-w-[130px]">
                    {product.name}
                  </span>
                  <span className="text-xs text-orange-600 font-semibold">
                    Ksh {product.calculatedPrice?.toLocaleString()}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    )}
  </AnimatePresence>

  <button
    onClick={() => {
      setShowSearch((prev) => !prev);
      setShowDropdown(false);
      setShowNotifModal(false);
    }}
    className="text-2xl text-orange-500 relative z-[50]"
  >
    <FiSearch />
  </button>
</div>


      {/* Country Flag & Currency */}
          {user && (
<div className="flex items-center gap-2 border border-orange-200 rounded-full px-3 py-1 cursor-pointer hover:bg-orange-50 transition">
  <img
    src={currentCountry.flag}
    alt={currentCountry.name}
    className="w-6 h-4 rounded-sm object-cover"
  />
  <span className="text-sm font-medium text-gray-700">{currentCountry.currency}</span>
</div>

          )}

          {/* Cart or Orders */}
          {isSeller ? (
            <button onClick={() => router.push('/seller/orders')} className="relative text-2xl text-orange-500">
              <FiPackage />
              {orderCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs rounded-full px-1.5 py-0.5">
                  {orderCount}
                </span>
              )}
            </button>
          ) : (
            <button onClick={() => router.push('/cart')} className="relative text-2xl text-orange-500">
              <FiShoppingCart />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* Notifications */}
          <button
            onClick={() => {
              setShowNotifModal((prev) => !prev);
              setShowSearch(false);
              setShowDropdown(false);
            }}
            className="relative text-2xl text-orange-500"
          >
            <FiBell />
            {notifications.some((n) => !n.read) && (
              <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs rounded-full px-1.5 py-0.5">
                {notifications.filter((n) => !n.read).length}
              </span>
            )}
          </button>

          {/* User or Sign-in */}
          {user ? (
            <div className="relative" ref={dropdownRef}>

                <Image
                  src={user.image || 'https://ui-avatars.com/api/?name=User&background=random'}
                  alt="Profile"
                  width={38}
                  height={38}
                  className="rounded-full cursor-pointer border"
                  onClick={() => setShowDropdown((prev) => !prev)}
                />

              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 4 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-3 bg-white dark:bg-gray-900 shadow-lg rounded-lg border z-50 w-40"
                  >
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-100 dark:hover:bg-gray-800 rounded"
                    >
                      <LogOut size={18} /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={() => {
                if (onOpenBuyerLogin) onOpenBuyerLogin();
                else router.push('/auth/google-login');
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-6 rounded-full transition"
            >
              Sign In
            </button>
          )}
        </div>

        {/* 🧭 Sidebars */}
        {isSeller ? (
          <>
            {showSidebar && (
              <div className="md:hidden">
                <SellerSidebar onClose={() => setShowSidebar(false)} />
              </div>
            )}

            {!showSidebar && (
              <button
                onClick={() => setShowSidebar(true)}
                className="md:hidden fixed bottom-6 right-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all z-[60]"
                aria-label="Open Menu"
              >
                <FiMenu size={22} />
              </button>
            )}
          </>
        ) : (
          showSidebar && <Sidebar onClose={() => setShowSidebar(false)} />
        )}

        {/* 🔔 Notifications */}
        <AnimatePresence>
          {showNotifModal && (
            <motion.div
              ref={notifRef}
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="absolute right-16 top-14 w-96 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-orange-100/60 dark:border-gray-700/60 rounded-2xl shadow-xl z-[60]"
            >
              <div className="px-5 py-3 border-b border-orange-100 dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-orange-50 to-white dark:from-gray-800 dark:to-gray-900">
                <h4 className="font-semibold text-gray-800 dark:text-gray-100 text-sm uppercase tracking-wide">
                  Notifications
                </h4>
                <button
                  onClick={() => setShowNotifModal(false)}
                  className="text-gray-500 hover:text-orange-500 text-xs font-medium transition-colors"
                >
                  Close
                </button>
              </div>

              {notifications.length > 0 ? (
                <ul className="max-h-80 overflow-y-auto divide-y divide-orange-50 dark:divide-gray-800">
                  {notifications.map((notif, i) => (
                    <li
                      key={i}
                      onClick={() => setShowNotifModal(false)}
                      className={`px-5 py-3 text-sm flex flex-col gap-1 hover:bg-orange-50 dark:hover:bg-gray-800 transition-all ${
                        notif.read ? 'text-gray-600' : 'text-gray-900 font-semibold'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{notif.message || 'New update available'}</span>
                        {!notif.read && (
                          <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                            New
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(notif.createdAt).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-6 text-gray-500 text-sm text-center">
                  You’re all caught up!
                  <div className="text-xs text-gray-400 mt-1">No new notifications</div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
