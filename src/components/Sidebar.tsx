'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiHome, FiSmartphone, FiMonitor, FiHeart, FiUser,
  FiTv, FiWatch, FiGift, FiTruck, FiBook, FiTool, 
  FiGrid, FiZoomIn, FiZoomOut, FiPackage, FiLayout, 
  FiLoader, FiSend, FiSun, FiMoon
} from 'react-icons/fi';

export default function Sidebar({ onClose }: { onClose: () => void }) {
  const router = useRouter();

  const [fontSize, setFontSize] = useState<number>(() => parseFloat(localStorage.getItem('fontSize') || '1'));
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme') as 'light' | 'dark') || 'light');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--zoom', fontSize.toString());
    document.documentElement.style.fontSize = `${fontSize * 100}%`;
    localStorage.setItem('fontSize', fontSize.toString());
  }, [fontSize]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => (t === 'light' ? 'dark' : 'light'));

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
    <div className="fixed inset-0 z-40 flex">

      <div onClick={onClose} className="fixed inset-0 bg-black bg-opacity-30" />

      <div className="relative w-72 bg-white dark:bg-gray-900 shadow-lg h-full transform transition-transform duration-300 translate-x-0 overflow-y-auto">
        <button
          className="absolute top-4 right-4 text-gray-700 dark:text-gray-200"
          onClick={onClose}
        >
          ✕
        </button>
        
        <div className="p-6 pt-14">
          <div className="flex items-center justify-center mb-6 space-x-2">
            <h2
              onClick={() => {
                router.push('/');
                onClose();
              }}
              className="cursor-pointer font-bold text-black text-xl"
            >
              NOVAXPRESS
            </h2>
            <FiSend className="text-orange-500 text-xl" />
          </div>

          <ul className="space-y-4">
            {categories.map(({ label, icon, route }, index) => (
              <li
                key={index}
                className="flex items-center text-gray-700 dark:text-gray-200 hover:text-orange-500 cursor-pointer transition-colors"
                onClick={() => {
                  router.push(route);
                  onClose();
                }}
              >
                <span className="mr-3 text-lg">{icon}</span>
                <span className="text-base">{label}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 space-y-4 border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Settings</h3>

            {/* Zoom Controls */}
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center text-gray-600 dark:text-gray-300">
                <FiZoomIn className="mr-2" /> Zoom In
              </span>
              <button
                onClick={() => setFontSize(f => Math.min(f + 0.1, 2))}
                className="px-2 py-1 bg-orange-500 text-white rounded"
              >+</button>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center text-gray-600 dark:text-gray-300">
                <FiZoomOut className="mr-2" /> Zoom Out
              </span>
              <button
                onClick={() => setFontSize(f => Math.max(f - 0.1, 0.5))}
                className="px-2 py-1 bg-orange-500 text-white rounded"
              >-</button>
            </div>

            {/* Theme Toggle */}
            <div className="flex items-center justify-between text-sm mt-4">
              <span className="flex items-center text-gray-600 dark:text-gray-300">
                {theme === 'light' ? <FiSun className="mr-2" /> : <FiMoon className="mr-2" />}
                Theme
              </span>
              <button
                onClick={toggleTheme}
                className="px-2 py-1 bg-orange-500 text-white rounded"
              >
                {theme === 'light' ? 'Dark' : 'Light'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
