'use client';
import { useRouter } from 'next/navigation';
import {
  FiHome,
  FiBox,
  FiBarChart2,
  FiShoppingBag,
  FiPlusCircle,
  FiDollarSign,
  FiAward,
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/app/context/AuthContext';

interface Props {
  onClose?: () => void;
}

export default function SellerSidebar({ onClose }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768);
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  const menuItems = [
    { label: 'Dashboard', icon: <FiHome size={18} />, path: '/seller/dashboard' },
    { label: 'Add Product', icon: <FiPlusCircle size={18} />, path: '/seller/products/add' },
    { label: 'Inventory', icon: <FiBox size={18} />, path: '/seller/inventory' },
    { label: 'Orders', icon: <FiShoppingBag size={18} />, path: '/seller/orders' },
    { label: 'Analytics', icon: <FiBarChart2 size={18} />, path: '/seller/analytics' },
    { label: 'Finance', icon: <FiDollarSign size={18} />, path: '/seller/finance' },
    { label: 'Awards', icon: <FiAward size={18} />, path: '/seller/awards' },
  ];

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        exit={{ x: -300 }}
        transition={{ duration: 0.3 }}
        className="fixed top-[64px] left-0 h-[calc(100vh-64px)] w-64 bg-gradient-to-b from-orange-500 to-orange-600 text-white shadow-xl flex flex-col z-40"
      >
        {/* Header (mobile only) */}
        {isMobile && (
          <div className="flex justify-between items-center p-4 border-b border-orange-400">
            <h2 className="text-lg font-bold">Seller Panel</h2>
            <button onClick={onClose} className="text-white hover:text-red-200 transition text-xl">
              ✕
            </button>
          </div>
        )}

        {/* Profile Section */}
        <div className="p-5 border-b border-orange-400 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-white shadow-md"
          >
            <Image
              src={user?.image || '/avatar.png'}
              alt={user?.name || 'Seller'}
              width={80}
              height={80}
              className="object-cover w-full h-full"
            />
          </motion.div>
          <p className="mt-3 text-sm font-semibold">{user?.name || 'Seller Account'}</p>
          <p className="text-xs text-orange-200">{user ? 'Active' : 'Guest Mode'}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto mt-3">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                router.push(item.path);
                if (isMobile && onClose) onClose();
              }}
              className="flex items-center gap-3 w-full px-5 py-3 text-left text-white hover:bg-orange-700 transition-all duration-200"
            >
              <span>{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-orange-400 text-center text-xs text-orange-100">
          {/* ✅ System Status */}
          <div className="flex justify-center items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></span>
            <span className="font-medium text-green-100">All Good</span>
          </div>

          <p>© {new Date().getFullYear()} YourShop. All rights reserved.</p>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
