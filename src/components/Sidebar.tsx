'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  FiHome, FiSmartphone, FiMonitor, FiHeart, FiUser,
  FiTv, FiWatch, FiGift, FiTruck, FiBook, FiTool,
  FiGrid, FiZoomIn, FiZoomOut, FiPackage, FiLayout,
  FiLoader, FiSun, FiMoon, FiGlobe,
  FiFilm, FiPhone, FiCreditCard
} from 'react-icons/fi';

interface Props {
  isOpen?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
}
export default function Sidebar({ isOpen = false, onClose, onOpen }: Props) {

  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const [isMobile, setIsMobile] = useState(false);
  const [fontSize, setFontSize] = useState(1);
  const [language, setLanguage] = useState('en');

  /* -------------------------------- */
  /* Detect mobile / desktop */
  /* -------------------------------- */
  useEffect(() => {
    const checkScreen = () =>
      setIsMobile(window.innerWidth < 768);

    checkScreen();
    window.addEventListener('resize', checkScreen);

    return () =>
      window.removeEventListener('resize', checkScreen);
  }, []);

  /* -------------------------------- */
  /* Font size */
  /* -------------------------------- */
  useEffect(() => {
    const saved = localStorage.getItem('fontSize');
    if (saved) setFontSize(parseFloat(saved));
  }, []);

  useEffect(() => {
    document.documentElement.style.fontSize =
      `${fontSize * 100}%`;

    localStorage.setItem(
      'fontSize',
      fontSize.toString()
    );
  }, [fontSize]);

  /* -------------------------------- */
  /* Language */
  /* -------------------------------- */
  useEffect(() => {
    const savedLang =
      localStorage.getItem('language');
    if (savedLang) setLanguage(savedLang);
  }, []);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  /* -------------------------------- */
  /* Categories */
  /* -------------------------------- */
  const categories = [
    { label: 'Home', icon: <FiHome />, route: '/' },
    { label: 'Wishlist', icon: <FiHeart />, route: '/wishlist' },
    { label: 'My Wallet', icon: <FiCreditCard />, route: '/wallet' },
    { label: 'My Orders', icon: <FiPackage />, route: '/orders' },
    { label: 'My Vouchers', icon: <FiGift />, route: '/vouchers' },
    { label: 'My Installments', icon: <FiPhone />, route: '/installments/progress' },
    { label: 'Phones & Tablets', icon: <FiSmartphone />, route: '/category/Phones' },
    { label: 'Computing', icon: <FiMonitor />, route: '/category/Laptops' },
    { label: 'Electronics', icon: <FiTv />, route: '/category/Electronics' },
    { label: 'Fashion', icon: <FiUser />, route: '/category/Fashion' },
    { label: 'Gaming', icon: <FiWatch />, route: '/category/Gaming' },
    { label: 'Automotive', icon: <FiTool />, route: '/category/Motors' },
    { label: 'Books', icon: <FiBook />, route: '/category/Books' },
    { label: 'Ads', icon: <FiFilm />, route: '/ads' },
    { label: 'Shops', icon: <FiGrid />, route: '/shops' },
  ];

  /* -------------------------------- */
  /* Sidebar Content */
  /* -------------------------------- */
  const sidebarContent = (
    <div className="p-6 pt-8">

      {/* LOGO */}
      <div
        className="flex justify-center mb-8 cursor-pointer"
        onClick={() => {
          router.push('/');
          onClose?.();
        }}
      >
        <img
          src="/Logo.png"
          className="h-16 object-contain"
        />
      </div>

      {/* Categories */}
      <ul className="space-y-2">
        {categories.map(({ label, icon, route }, i) => (
          <li
            key={i}
            onClick={() => {
              router.push(route);
              onClose?.();
            }}
            className="
              flex items-center gap-3
              px-3 py-2 rounded-lg
              cursor-pointer
              hover:bg-orange-500/10
              text-gray-800 dark:text-gray-200
            "
          >
            {icon}
            <span>{label}</span>
          </li>
        ))}
      </ul>

      {/* SETTINGS */}
      <div className="mt-10 border-t pt-6 space-y-4">

        <button
          onClick={() =>
            setFontSize(f => Math.min(f + 0.1, 2))
          }
          className="w-full bg-orange-500 text-white py-2 rounded"
        >
          <FiZoomIn className="inline mr-2" />
          Zoom In
        </button>

        <button
          onClick={() =>
            setFontSize(f => Math.max(f - 0.1, 0.6))
          }
          className="w-full bg-orange-500 text-white py-2 rounded"
        >
          <FiZoomOut className="inline mr-2" />
          Zoom Out
        </button>

        <button
          onClick={() =>
            setTheme(theme === 'light'
              ? 'dark'
              : 'light')
          }
          className="w-full bg-orange-500 text-white py-2 rounded"
        >
          {theme === 'light'
            ? <FiMoon className="inline mr-2"/>
            : <FiSun className="inline mr-2"/>}
          Theme
        </button>

        <select
          value={language}
          onChange={(e) =>
            setLanguage(e.target.value)
          }
          className="w-full border rounded p-2
          dark:bg-gray-800"
        >
          <option value="en">English</option>
          <option value="sw">Kiswahili</option>
        </select>

      </div>
    </div>
  );

  /* -------------------------------- */
  /* FINAL RENDER */
  /* -------------------------------- */

  return (
    <>
      {/* MOBILE OVERLAY */}
      {isMobile && (
        <div
          onClick={onClose}
          className="relative h-full w-72 bg-white dark:bg-gray-900 shadow-xl"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          bg-gradient-to-b
          from-orange-50 via-white to-orange-100
          dark:from-gray-900 dark:to-gray-800
          border-r
          overflow-y-auto
          transition-all duration-300

          ${isMobile
            ? 'fixed left-0 top-0 z-50 w-72 h-screen'
            : 'hidden md:block fixed left-0 top-[80px] w-72 h-[calc(100vh-80px)] z-30'
          }
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
}