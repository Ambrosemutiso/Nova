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
import { categoryTree } from '@/lib/productCategories';
import { slugify } from '@/lib/slugify';
import TranslateWidget from './TranslateWidget';

const categoryIcons: Record<string, JSX.Element> = {
  Electronics: <FiTv />,
  "Computers & Laptops": <FiMonitor />,
  "Mobile Phones & Accessories": <FiSmartphone />,
  Gaming: <FiFilm />,
  "Home & Kitchen": <FiGrid />,
  Furniture: <FiLayout />,
  Fashion: <FiUser />,
  "Beauty & Personal Care": <FiHeart />,
  "Health & Wellness": <FiHeart />,
  "Baby & Kids": <FiGift />,
  "Jewelry & Watches": <FiWatch />,
  "Sports & Outdoors": <FiTruck />,
  "Automotive & Motorcycles": <FiTool />,
  "Industrial & Machinery": <FiTool />,
  "Tools & Hardware": <FiTool />,
  Agriculture: <FiTruck />,
  "Books & Stationery": <FiBook />,
  "Toys & Hobbies": <FiGift />,
  "Pet Supplies": <FiHeart />,
  "Food & Groceries": <FiPackage />,
  Beverages: <FiPackage />,
  "Alcohol & Liquor": <FiPackage />,
  "Office Supplies": <FiMonitor />,
  "Musical Instruments": <FiFilm />,
  "Smart Home & Robotics": <FiMonitor />,
  "Solar & Renewable Energy": <FiSun />,
  "Motorbike Parts": <FiTool />,
  "Farm Equipment": <FiTruck />,
  "Mobile Money Devices": <FiCreditCard />,
  "Construction Materials": <FiTool />,
};

interface Props {
  isOpen?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
}
export default function Sidebar({ isOpen = false, onClose, onOpen }: Props) {

  const router = useRouter();
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

  if (saved) {
    setFontSize(parseFloat(saved));
  } else {
    // Default smallest font on mobile
    if (window.innerWidth < 768) {
      setFontSize(0.85);
    } else {
      setFontSize(1);
    }
  }
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
  const savedLang = localStorage.getItem('language');

  if (savedLang) {
    setLanguage(savedLang);
    document.documentElement.lang = savedLang;
  }
}, []);

useEffect(() => {
  localStorage.setItem("language", language);
  document.documentElement.lang = language;

  const translateSelect = document.querySelector(
    ".goog-te-combo"
  ) as HTMLSelectElement | null;

  if (translateSelect) {
    translateSelect.value = language;
    translateSelect.dispatchEvent(new Event("change"));
  }

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

  ...Object.keys(categoryTree).map((category) => ({
    label: category,
    icon: categoryIcons[category] || <FiGrid />,
    route: `/category/${slugify(category)}`
  })),

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
        <TranslateWidget/>
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
          <option value="fr">French</option>
          <option value="ar">Arabic</option>
          <option value="am">Amharic</option>
        </select>

      </div>
    </div>
  );

  /* -------------------------------- */
  /* FINAL RENDER */
  /* -------------------------------- */

  return (
    <>
      {/* SIDEBAR */}
<aside
  className="
    h-full w-72
    bg-gradient-to-b
    from-orange-50 via-white to-orange-100
    dark:from-gray-900 dark:to-gray-800
    border-r
    overflow-y-auto
  "
>
  {sidebarContent}
</aside>
    </>
  );
}