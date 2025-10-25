'use client';
import { useEffect, useState, useRef } from 'react';
import { FiMenu, FiShoppingCart, FiPackage, FiSearch, FiBell } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useCart } from '@/app/context/CartContext';
import Login from './Login';
import Sidebar from './Sidebar';
import SellerSidebar from '@/app/seller/sidebar/SellerSidebar';
import Image from 'next/image';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import type { Notification } from '@/app/types/notification';
import { motion, AnimatePresence } from 'framer-motion';
import { CldImage } from 'next-cloudinary';

export default function Navbar() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [orderCount, setOrderCount] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [currentPromo, setCurrentPromo] = useState(0);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLDivElement | null>(null);

  const router = useRouter();
  const { cartItems } = useCart();
  const { user, logout } = useAuth();
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const isSeller = user?.role === 'seller';

  const promos = [
    '🔥 Flash Sale! Up to 50% off selected products!',
    '📞 Contact us: +254 798 437 508',
    '🚚 Free delivery for orders above Ksh 2,000!',
    '💳 Secure Payments via M-Pesa & AirtelMoney',
  ];

  // 🔹 Cycle promo messages
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPromo((prev) => (prev + 1) % promos.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // 🔹 Close dropdown/search on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node)
      ) setShowDropdown(false);

      if (
        searchRef.current && !searchRef.current.contains(event.target as Node)
      ) setShowSearch(false);
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

const getPublicId = (url?: string) => {
   if (!url || typeof url !== 'string') 
   return ''; const match = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
   return match ? match[1] : url; };


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
  }, [isSeller, user]);

  // 🔹 Seller order count
  useEffect(() => {
    if (user?.role === 'seller') fetchOrders(user._id);
  }, [user]);

  const fetchOrders = async (sellerId: string) => {
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

useEffect(() => {
  if (!searchTerm.trim()) {
    setSuggestions([]);
    return;
  }

  const fetchSuggestions = async () => {
    try {
      const res = await fetch(`/api/products/suggest?q=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();
      setSuggestions(data.slice(0, 5)); // Expecting array of { _id, name, price, images }
    } catch (error) {
      console.error('Suggestion fetch failed', error);
    }
  };

  const timeout = setTimeout(fetchSuggestions, 300);
  return () => clearTimeout(timeout);
}, [searchTerm]);


  return (
    <>
      {/* 🔸 Promo Bar */}
      <div className="fixed top-0 left-0 w-full bg-gradient-to-r from-orange-500 via-orange-400 to-orange-600 text-white text-sm py-1 overflow-hidden z-50 flex justify-center items-center">
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
          <span className="font-bold text-orange-600 text-lg hidden sm:inline">Novaxpress</span>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4 relative ml-auto">
{/* Expandable Search */}
<div ref={searchRef} className="relative flex items-center">
  <AnimatePresence>
    {showSearch && (
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: 240, opacity: 1 }}
        exit={{ width: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute right-8"
      >
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && searchTerm.trim()) {
              router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
              setShowSearch(false);
            }
          }}
          placeholder="Search products..."
          className="w-full border border-orange-300 rounded-full py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
        />

        {/* 🔸 Product Suggestions */}
        {suggestions.length > 0 && (
          <ul className="absolute top-9 left-0 w-full bg-white border border-orange-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
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
                {/* Product Image */}
                <CldImage 
                  src={getPublicId(product.images[0])} 
                  alt={product.name} 
                  width="40" 
                  height="40" 
                  className="rounded-md object-cover" />

                {/* Name + Price */}
                <div className="flex flex-col">
                  <span className="text-sm text-gray-800 font-medium truncate max-w-[130px]">
                    {product.name}
                  </span>
                  <span className="text-xs text-orange-600 font-semibold">
                    Ksh {product.price?.toLocaleString()}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    )}
  </AnimatePresence>

  {/* Search Icon Button */}
  <button
    onClick={() => setShowSearch((prev) => !prev)}
    className="text-2xl text-orange-500 relative z-10"
  >
    <FiSearch />
  </button>
</div>

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
            onClick={() => setShowNotifModal(!showNotifModal)}
            className="relative text-2xl text-orange-500"
          >
            <FiBell />
            {notifications.some((n) => !n.read) && (
              <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs rounded-full px-1.5 py-0.5">
                {notifications.filter((n) => !n.read).length}
              </span>
            )}
          </button>

          {/* User Dropdown */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <Image
                src={user.image || '/avatar.png'}
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
                    style={{ boxShadow: '0 6px 15px rgba(0,0,0,0.15)' }}
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
              onClick={() => setShowLogin(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-6 rounded-full transition"
            >
              Sign In
            </button>
          )}
        </div>

        {/* Modals */}
        {showSidebar &&
          (isSeller ? (
            <SellerSidebar onClose={() => setShowSidebar(false)} />
          ) : (
            <Sidebar onClose={() => setShowSidebar(false)} />
          ))}
        {showLogin && <Login onClose={() => setShowLogin(false)} />}
      </nav>
    </>
  );
}
