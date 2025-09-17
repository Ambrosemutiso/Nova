'use client';
import { useEffect, useState, useRef } from 'react';
import { FiMenu, FiShoppingCart, FiPackage, FiSearch, FiBell, FiSettings } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useCart } from '@/app/context/CartContext';
import Login from './Login';
import Sidebar from './Sidebar';
import SellerSidebar from '@/app/seller/sidebar/SellerSidebar';
import Image from 'next/image';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import type { Notification } from '@/app/types/notification';
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [orderCount, setOrderCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const { cartItems } = useCart();
  const { user, logout } = useAuth();
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const isSeller = user?.role === 'seller';

  // Outside click handler for dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const role = isSeller ? 'seller' : 'buyer';
        const res = await fetch(`/api/notifications?role=${role}&userId=${user?._id}`);
        const json = await res.json();
        if (json.success) {
          setNotifications(json.data);
        }
      } catch (error) {
        console.error('Failed to fetch notifications', error);
      }
    };

    fetchNotifications();
  }, [isSeller, user]);

  useEffect(() => {
    if (user?.role === 'seller') {
      fetchOrders(user._id);
    }
  }, [user]);

  const fetchOrders = async (sellerId: string) => {
    try {
      const res = await fetch('/api/orders/count', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerId }),
      });

      const data = await res.json();
      if (res.ok) {
        setOrderCount(data.count);
      }
    } catch (err) {
      console.error('Failed to fetch order count:', err);
    }
  };

  return (
    <>
      <nav className="bg-white shadow-md p-3 flex items-center justify-between fixed top-0 left-0 w-full z-50">
        {/* Sidebar toggle */}
        <button onClick={() => setShowSidebar(true)} className="text-2xl text-orange-500">
          <FiMenu />
        </button>

        {/* Search bar */}
        <div className="flex-1 mx-4 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchTerm.trim()) {
                router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
              }
            }}
            placeholder="Search..."
            className="w-full border border-gray-300 rounded-full py-2 px-4 pr-10 focus:outline-none focus:border-orange-500"
          />
          <FiSearch
            className="absolute right-3 top-2.5 text-gray-500 cursor-pointer"
            onClick={() => {
              if (searchTerm.trim()) {
                router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
              }
            }}
          />
        </div>

        {/* Right section */}
        <div className="flex items-center gap-4 relative">
          {/* Cart / Orders */}
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
            onClick={async () => {
              setShowNotifModal(!showNotifModal);
              if (!showNotifModal && user) {
                try {
                  await fetch('/api/notifications/mark-read', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user._id }),
                  });
                  setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
                } catch (err) {
                  console.error('Failed to mark notifications as read:', err);
                }
              }
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

          {user && (
            <button
              onClick={() => router.push('/settings')}
              className="text-2xl text-orange-500"
            >
              <FiSettings />
            </button>
          )}

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <Image
                src={user.image || "/avatar.png"}
                alt="Profile"
                width={40}
                height={40}
                className="rounded-full cursor-pointer border"
                onClick={() => setShowDropdown((prev) => !prev)}
              />

              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    key="dropdown"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-900 shadow-lg rounded-lg border z-50"
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
