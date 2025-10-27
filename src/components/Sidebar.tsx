'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  FiHome, FiSmartphone, FiMonitor, FiHeart, FiUser,
  FiTv, FiWatch, FiGift, FiTruck, FiBook, FiTool,
  FiGrid, FiZoomIn, FiZoomOut, FiPackage, FiLayout,
  FiLoader, FiSend, FiSun, FiMoon, FiGlobe
} from 'react-icons/fi';

export default function Sidebar({ onClose }: { onClose: () => void }) {
  const [fontSize, setFontSize] = useState<number>(() => parseFloat(localStorage.getItem('fontSize') || '1'));
  const [language, setLanguage] = useState<string>(() => localStorage.getItem('language') || 'en');
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize * 100}%`;
    localStorage.setItem('fontSize', fontSize.toString());
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const categories = [
    { label: 'Home', icon: <FiHome />, route: '/' },
    { label: 'Wishlist', icon: <FiHeart />, route: '/wishlist' },
    { label: 'My Orders', icon: <FiPackage />, route: '/orders' },
    { label: 'My Vouchers', icon: <FiGift />, route: '/vouchers' },
    { label: 'Phones & Tablets', icon: <FiSmartphone />, route: '/category/Phones' },
    { label: 'Computing', icon: <FiMonitor />, route: '/category/Laptops' },
    { label: 'Electronics', icon: <FiTv />, route: '/category/Electronics' },
    { label: 'Fashion', icon: <FiUser />, route: '/category/Fashion' },
    { label: 'Health', icon: <FiHeart />, route: '/category/Health' },
    { label: 'Beauty', icon: <FiLayout />, route: '/category/Beauty' },
    { label: 'Baby Products', icon: <FiGift />, route: '/category/Kids' },
    { label: 'Gaming', icon: <FiWatch />, route: '/category/Gaming' },
    { label: 'Sporting Goods', icon: <FiTruck />, route: '/category/Sports' },
    { label: 'Automotive', icon: <FiTool />, route: '/category/Motors' },
    { label: 'Books & Stationery', icon: <FiBook />, route: '/category/Books' },
    { label: 'Sound Systems', icon: <FiLoader />, route: '/category/Systems' },
    { label: 'Shops', icon: <FiGrid />, route: '/shops' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" />

      {/* Sidebar */}
      <div className="relative w-72 bg-gradient-to-b from-orange-50 via-white to-orange-100 dark:from-gray-900 dark:to-gray-800 shadow-2xl h-full transform transition-transform duration-300 translate-x-0 overflow-y-auto border-r border-orange-200/40">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors"
          onClick={onClose}
        >
          ✕
        </button>

        {/* Header */}
        <div className="p-6 pt-14">
          <div
  className="flex items-center justify-center mb-8 cursor-pointer"
  onClick={() => {
    router.push('/');
    onClose();
  }}
>
  <div
    className="bg-white dark:bg-gray-800 rounded-lg p-1 overflow-hidden transition-all duration-300"
  >
    <img
      src="/Logo.jpg"
      alt="Novaxpress Logo"
      className="h-20 w-auto object-contain object-center scale-110 hover:scale-115 transition-transform duration-300 rounded-none
        dark:invert dark:brightness-110 dark:contrast-105 dark:drop-shadow-[0_0_6px_rgba(255,255,255,0.25)]"
      style={{
        clipPath: 'inset(5% 5% 5% 5%)', // hides extra white borders if present
      }}
    />
  </div>
  </div>


          {/* Categories */}
          <ul className="space-y-3">
            {categories.map(({ label, icon, route }, index) => (
              <li
                key={index}
                onClick={() => {
                  router.push(route);
                  onClose();
                }}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-orange-500/10 hover:text-orange-600 text-gray-800 dark:text-gray-200 cursor-pointer transition-all duration-200"
              >
                <span className="text-lg">{icon}</span>
                <span className="text-base font-medium">{label}</span>
              </li>
            ))}
          </ul>

          {/* Settings */}
          <div className="mt-10 border-t border-orange-200/50 pt-5 space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Settings</h3>

            {/* Font Size Controls */}
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center text-gray-600 dark:text-gray-300">
                <FiZoomIn className="mr-2" /> Zoom In
              </span>
              <button
                onClick={() => setFontSize(f => Math.min(f + 0.1, 2))}
                className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-md shadow-sm transition"
              >
                +
              </button>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center text-gray-600 dark:text-gray-300">
                <FiZoomOut className="mr-2" /> Zoom Out
              </span>
              <button
                onClick={() => setFontSize(f => Math.max(f - 0.1, 0.5))}
                className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-md shadow-sm transition"
              >
                -
              </button>
            </div>

            {/* Theme Toggle */}
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center text-gray-600 dark:text-gray-300">
                {theme === 'light' ? <FiSun className="mr-2" /> : <FiMoon className="mr-2" />} Theme
              </span>
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-md shadow-sm transition"
              >
                {theme === 'light' ? 'Dark' : 'Light'}
              </button>
            </div>

            {/* Language Select */}
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center text-gray-600 dark:text-gray-300">
                <FiGlobe className="mr-2" /> Language
              </span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-2 py-1 border border-orange-300 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm focus:ring-2 focus:ring-orange-400"
              >
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="es">Español</option>
                <option value="de">Deutsch</option>
                <option value="sw">Kiswahili</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
