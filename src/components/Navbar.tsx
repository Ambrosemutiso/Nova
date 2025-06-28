'use client';
import { useEffect, useState } from 'react';
import { FiMenu, FiShoppingCart, FiPackage, FiSearch, FiBell } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useCart } from '@/app/context/CartContext';
import Login from './Login';
import Sidebar from './Sidebar';
import SellerSidebar from '@/app/seller/sidebar/SellerSidebar';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { LogOut, ZoomIn, ZoomOut } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/app/context/AuthContext';

interface Notification {
  _id: string;
  message: string;
  createdAt: string;
}

export default function Navbar() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [orderCount, setOrderCount] = useState(0);
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [language, setLanguage] = useState('English');
  const [fontScale, setFontScale] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { cartItems } = useCart();
  const { user, logout } = useAuth();
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const isSeller = user?.role === 'seller';

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const role = isSeller ? 'seller' : 'buyer';
        const res = await fetch(`/api/notifications?role=${role}`);
        const json = await res.json();
        if (json.success) {
          setNotifications(json.data);
        }
      } catch (error) {
        console.error('Failed to fetch notifications', error);
      }
    };

    fetchNotifications();
  }, [isSeller]);

  useEffect(() => {
    if (user?.role === 'seller') {
      fetchOrders(user._id);
    }

    const savedLang = localStorage.getItem('language');
    const savedFontScale = parseFloat(localStorage.getItem('fontScale') || '1');
    const savedTheme = localStorage.getItem('theme');

    if (savedLang) setLanguage(savedLang);
    if (!isNaN(savedFontScale)) setFontScale(savedFontScale);
    if (savedTheme) setTheme(savedTheme);
  }, [user, setTheme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--app-font-size', `${fontScale}rem`);
  }, [fontScale]);

  const fetchOrders = async (sellerId: string) => {
    try {
      const res = await fetch(`/api/orders/count?sellerId=${sellerId}`);
      const data = await res.json();
      if (res.ok) {
        setOrderCount(data.count);
      }
    } catch (err) {
      console.error('Failed to fetch order count:', err);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const res = await fetch('/api/user/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: displayName, photoURL }),
      });

      if (res.ok) {
        const updatedUser = await res.json();
        localStorage.setItem(user?.role === 'seller' ? 'sellerUser' : 'buyerUser', JSON.stringify(updatedUser));
        window.location.reload(); // Refresh to update image
      } else {
        alert('Failed to update profile');
      }
    } catch (error) {
      console.error(error);
      alert('Error updating profile');
    }
  };

  return (
    <>
      <nav className="bg-white shadow-md p-3 flex items-center justify-between fixed top-0 left-0 w-full z-50" style={{ fontSize: 'var(--app-font-size)' }}>
        <button onClick={() => setShowSidebar(true)} className="text-2xl text-orange-500">
          <FiMenu />
        </button>

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

        <div className="flex items-center gap-4 relative">
          {isSeller ? (
            <button onClick={() => router.push('/seller/orders')} className="relative text-2xl text-orange-500">
              <FiPackage />
              {orderCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full px-1.5 py-0.5">{orderCount}</span>
              )}
            </button>
          ) : (
            <button onClick={() => router.push('/cart')} className="relative text-2xl text-orange-500">
              <FiShoppingCart />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{cartCount}</span>
              )}
            </button>
          )}

          <button onClick={() => setShowNotifModal(!showNotifModal)} className="relative text-2xl text-orange-500">
            <FiBell />
            {notifications.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full px-1.5 py-0.5">{notifications.length}</span>
            )}
          </button>

          {showNotifModal && (
            <div className="absolute right-4 top-16 w-80 bg-white shadow-lg rounded-lg z-50 border">
              <div className="p-4 border-b text-lg font-semibold text-gray-700">Notifications</div>
              <ul className="max-h-64 overflow-y-auto divide-y">
                {notifications.length === 0 ? (
                  <li className="p-4 text-sm text-gray-500">No notifications</li>
                ) : (
                  notifications.map((notif) => (
                    <li key={notif._id} className="p-4 text-sm text-gray-700">
                      <span className="font-semibold">Notice:</span> {notif.message}
                      <p className="text-xs text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}

          {user ? (
            <Image
              src={user.photoURL || '/avatar.png'}
              alt="Profile"
              width={40}
              height={40}
              className="rounded-full cursor-pointer border"
              onClick={() => {
                setDisplayName(user.name || '');
                setPhotoURL(user.photoURL || '');
                setShowSettings(true);
              }}
            />
          ) : (
            <button
              onClick={() => setShowLogin(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-6 rounded-full transition"
            >
              Sign In
            </button>
          )}
        </div>

        {showSidebar && (isSeller ? <SellerSidebar onClose={() => setShowSidebar(false)} /> : <Sidebar onClose={() => setShowSidebar(false)} />)}
        {showLogin && <Login onClose={() => setShowLogin(false)} />}
      </nav>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 w-50 h-full bg-white dark:bg-gray-900 shadow-xl z-50 p-6 overflow-y-auto border-l border-orange-200"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-orange-600">Settings</h2>
              <button onClick={() => setShowSettings(false)} className="text-gray-600 hover:text-black dark:hover:text-white text-lg">✕</button>
            </div>

            <div className="mb-6">
              <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-200">Name</label>
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full border p-2 rounded mb-2" />
              <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-200">Photo URL</label>
              <input value={photoURL} onChange={(e) => setPhotoURL(e.target.value)} className="w-full border p-2 rounded mb-2" />
              <button onClick={handleUpdateProfile} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Update Profile</button>
            </div>

            <div className="mb-4">
              <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-200">Language</label>
              <select
                className="w-full border rounded p-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-white"
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value);
                  localStorage.setItem('language', e.target.value);
                }}
              >
                <option>English</option>
                <option>Swahili</option>
                <option>French</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-200">Theme</label>
              <select
                className="w-full border rounded p-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-white"
                value={theme}
                onChange={(e) => {
                  setTheme(e.target.value);
                  localStorage.setItem('theme', e.target.value);
                }}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>

            <div className="mb-4">
              <span className="block font-semibold mb-2 text-gray-700 dark:text-gray-200">Accessibility</span>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    const newScale = Math.min(2, fontScale + 0.1);
                    setFontScale(newScale);
                    localStorage.setItem('fontScale', newScale.toString());
                  }}
                  className="px-3 py-1 bg-gray-200 dark:bg-gray-800 text-black dark:text-white rounded flex items-center gap-1"
                >
                  <ZoomIn size={16} /> Zoom In
                </button>
                <button
                  onClick={() => {
                    const newScale = Math.max(0.8, fontScale - 0.1);
                    setFontScale(newScale);
                    localStorage.setItem('fontScale', newScale.toString());
                  }}
                  className="px-3 py-1 bg-gray-200 dark:bg-gray-800 text-black dark:text-white rounded flex items-center gap-1"
                >
                  <ZoomOut size={16} /> Zoom Out
                </button>
              </div>
            </div>

            <button
              onClick={logout}
              className="mt-6 w-full px-4 py-2 bg-red-500 text-white rounded flex items-center justify-center gap-2 hover:bg-red-600"
            >
              <LogOut size={18} /> Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
