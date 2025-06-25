'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiHome, FiSmartphone, FiMonitor, FiHeart, FiUser, FiShoppingCart,
  FiTv, FiWatch, FiGift, FiTruck, FiBook, FiTool, FiGrid, FiZoomIn, FiZoomOut, FiPackage,
  FiLayout,
  FiLoader
} from 'react-icons/fi';

export default function Sidebar({ onClose }: { onClose: () => void }) {
  const [fontSize, setFontSize] = useState<number>(() => parseFloat(localStorage.getItem('fontSize') || '1'));
  const router = useRouter();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--zoom', fontSize.toString());
    localStorage.setItem('fontSize', fontSize.toString());
  }, [fontSize]);

  const categories = [
    { label: 'Home', icon: <FiHome />, route: '/' },
    { label: 'Wishlist', icon: <FiHeart />, route: '/wishlist' },
    { label: 'My Orders', icon: <FiPackage />, route: '/orders' },
    { label: 'Phones & Tablets', icon: <FiSmartphone />, route: '/category/Phones' },
    { label: 'Computing', icon: <FiMonitor />, route: '/category/Laptops' },
    { label: 'Electronics', icon: <FiTv />, route: '/category/Electronics' },
    { label: 'Fashion', icon: <FiUser />, route: '/category/Fashion' },
    { label: 'Health', icon: <FiHeart />, route: '/category/Health' },
    { label: 'Beauty', icon: <FiLayout />, route: '/category/Beauty' },
    { label: 'Supermarket', icon: <FiShoppingCart />, route: '/Shop' },
    { label: 'Baby Products', icon: <FiGift />, route: '/category/Kids' },
    { label: 'Gaming', icon: <FiWatch />, route: '/category/Gaming' },
    { label: 'Sporting Goods', icon: <FiTruck />, route: '/category/Sports' },
    { label: 'Automotive', icon: <FiTool />, route: '/category/Motors' },
    { label: 'Books & Stationery', icon: <FiBook />, route: '/category/Books' },
    { label: 'Sound Systems', icon: <FiLoader />, route: '/category/Systems' },
    { label: 'Other Categories', icon: <FiGrid />, route: '/Shop' },
  ];
  
  return (
    <div className="fixed inset-0 z-40 flex">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black bg-opacity-30"
      />

      {/* Sidebar Drawer */}
      <div className="relative w-72 bg-white dark:bg-gray-900 shadow-lg h-full transform transition-transform duration-300 translate-x-0 overflow-y-auto">
        <button
          className="absolute top-4 right-4 text-gray-700 dark:text-gray-200"
          onClick={onClose}
        >
          ✕
        </button>

        <div className="p-6 pt-14">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
            Shop by Category
          </h2>
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
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center text-gray-600 dark:text-gray-300">
                <FiZoomIn className="mr-2" /> Zoom In
              </span>
              <button onClick={() => setFontSize(f => Math.min(f + 0.1, 2))} className="px-2 py-1 bg-orange-500 text-white rounded">+</button>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center text-gray-600 dark:text-gray-300">
                <FiZoomOut className="mr-2" /> Zoom Out
              </span>
              <button onClick={() => setFontSize(f => Math.max(f - 0.1, 0.5))} className="px-2 py-1 bg-orange-500 text-white rounded">-</button>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Update Profile</h3>
            <form onSubmit={(e) => { e.preventDefault(); alert('Profile updated!'); }} className="space-y-3">
              <input type="text" placeholder="Full Name" className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:text-white" />
              <input type="email" placeholder="Email" className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:text-white" />
              <button type="submit" className="w-full bg-orange-500 text-white py-2 rounded">Update</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
