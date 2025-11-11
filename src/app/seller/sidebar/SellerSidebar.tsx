'use client';
import { useRouter } from 'next/navigation';
import {
  FiHome,
  FiBox,
  FiShoppingBag,
  FiPlusCircle,
  FiDollarSign,
  FiAward,
  FiMessageSquare,
  FiSettings,
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/app/context/AuthContext';

interface Props {
  isOpen?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
}

export default function SellerSidebar({ isOpen = false, onClose, onOpen }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true); // 👈 desktop collapse toggle

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768);
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  const menuItems = [
    { label: 'Dashboard', icon: <FiHome size={20} />, path: '/seller/dashboard' },
    { label: 'Add Product', icon: <FiPlusCircle size={20} />, path: '/seller/products/add' },
    { label: 'Inventory', icon: <FiBox size={20} />, path: '/seller/inventory' },
    { label: 'Orders', icon: <FiShoppingBag size={20} />, path: '/seller/orders' },
    { label: 'Finance', icon: <FiDollarSign size={20} />, path: '/seller/finance' },
    { label: 'Awards', icon: <FiAward size={20} />, path: '/seller/awards' },
    { label: 'Messages', icon: <FiMessageSquare size={20} />, path: '/seller/chat' },
    { label: 'Settings', icon: <FiSettings size={20} />, path: '/seller/settings' },
  ];

  return (
    <>
      <AnimatePresence>
        {/* 🟧 Overlay for mobile */}
        {isMobile && isOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-30"
          />
        )}

        {/* 🧡 Full Sidebar (mobile open or desktop expanded) */}
        {(isOpen || !isMobile) && (
          <motion.aside
            key="sidebar"
            initial={{ x: isMobile ? -260 : 0 }}
            animate={{ x: 0 }}
            exit={{ x: isMobile ? -260 : 0 }}
            transition={{ duration: 0.3 }}
            className={`fixed top-[64px] left-0 h-[calc(100vh-64px)] 
              ${isMobile ? 'w-64' : isCollapsed ? 'w-20' : 'w-64'} 
              bg-gradient-to-b from-orange-500 to-orange-600 text-white shadow-2xl 
              flex flex-col z-40 transition-all duration-300 group`}
            onMouseEnter={() => !isMobile && setIsCollapsed(false)}
            onMouseLeave={() => !isMobile && setIsCollapsed(true)}
          >
            {/* Mobile Header */}
            {isMobile && (
              <div className="flex justify-between items-center px-4 py-3 border-b border-orange-400">
                <button onClick={onClose} className="text-white hover:text-red-200 transition text-xl">
                  ✕
                </button>
              </div>
            )}

            {/* Seller Info (hidden when collapsed) */}
            {!isMobile && !isCollapsed && (
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
            )}

            {/* Navigation */}
            <nav className={`flex-1 overflow-y-auto mt-3 ${isCollapsed ? 'px-3' : ''}`}>
              {menuItems.map((item, index) => (
                <motion.button
                  key={index}
                  onClick={() => {
                    router.push(item.path);
                    if (isMobile && onClose) onClose();
                  }}
                  whileHover={{ scale: 1.03 }}
                  className={`group relative flex items-center gap-3 px-5 w-full py-3 text-left 
                    text-white hover:bg-orange-700 transition-all duration-200 rounded-lg`}
                >
                  <span>{item.icon}</span>
                  {!isCollapsed && <span className="font-medium">{item.label}</span>}
                  {/* Tooltip for collapsed mode */}
                  {isCollapsed && (
                    <span className="absolute left-[3.5rem] opacity-0 group-hover:opacity-100 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap transition-opacity">
                      {item.label}
                    </span>
                  )}
                </motion.button>
              ))}
            </nav>

            {/* Footer (Desktop Only, hidden when collapsed) */}
            {!isMobile && !isCollapsed && (
              <div className="p-4 border-t border-orange-400 text-center text-xs text-orange-100">
                <div className="flex justify-center items-center gap-2 mb-2">
                  <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="font-medium text-green-100">All Good</span>
                </div>
                <p>© {new Date().getFullYear()} Novaxpress. All rights reserved.</p>
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
