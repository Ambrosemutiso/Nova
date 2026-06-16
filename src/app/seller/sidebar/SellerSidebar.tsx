'use client';
import { useRouter, usePathname } from 'next/navigation';
import {
  FiGrid,
  FiPackage,
  FiShoppingCart,
  FiPlusSquare,
  FiTrendingUp,
  FiCreditCard,
  FiStar,
  FiMessageCircle,
  FiVideo,
  FiInbox,
  FiSliders,
  FiChevronRight,
  FiZap,
  FiX,
} from 'react-icons/fi';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/app/context/AuthContext';

interface Props {
  isOpen?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
}

const menuItems = [
  { label: 'Dashboard',    icon: FiGrid,          path: '/seller/dashboard',        accent: '#f97316' },
  { label: 'Add Product',  icon: FiPlusSquare,    path: '/seller/products/add',     accent: '#10b981' },
  { label: 'Inventory',    icon: FiPackage,        path: '/seller/inventory',        accent: '#6366f1' },
  { label: 'Orders',       icon: FiShoppingCart,   path: '/seller/orders',           accent: '#f59e0b' },
  { label: 'Finance',      icon: FiTrendingUp,     path: '/seller/finance',          accent: '#0ea5e9' },
  { label: 'Installments', icon: FiCreditCard,     path: '/seller/installments',     accent: '#8b5cf6' },
  { label: 'Awards',       icon: FiStar,           path: '/seller/awards',           accent: '#ea580c' },
  { label: 'Messages',     icon: FiMessageCircle,  path: '/seller/chat',             accent: '#10b981' },
  { label: 'Ad Videos',    icon: FiVideo,          path: '/seller/ads/upload',       accent: '#ec4899' },
  { label: 'Feedback',     icon: FiInbox,          path: '/seller/feedback',         accent: '#3b82f6' },
  { label: 'Settings',     icon: FiSliders,        path: '/seller/settings',         accent: '#64748b' },
];

const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.1 } },
};

const itemVariant: Variants = {
  hidden: { opacity: 0, x: -14 },
  show:   { opacity: 1,  x: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
};

export default function SellerSidebar({ isOpen = false, onClose, onOpen }: Props) {
  const router   = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const navigate = (path: string) => {
    router.push(path);
    if (isMobile && onClose) onClose();
  };

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  return (
    <>
      <AnimatePresence>
        {/* ── Mobile overlay ── */}
        {isMobile && isOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[999]"
            style={{ background: 'rgba(15,15,20,0.45)', backdropFilter: 'blur(4px)' }}
          />
        )}

        {/* ── Full sidebar — same component renders on mobile and desktop ── */}
        {(isOpen || !isMobile) && (
          <motion.aside
            key="sidebar"
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            className="fixed top-0 left-0 h-full z-[999] flex flex-col"
            style={{
              width: '268px',
              background: '#ffffff',
              borderRight: '1px solid #f1f1f1',
              boxShadow: '4px 0 32px rgba(15,15,20,0.06)',
            }}
          >
            {/* ── Decorative top glow — softened for light bg ── */}
            <div
              aria-hidden
              style={{
                position: 'absolute',
                top: -60,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 220,
                height: 180,
                background: 'radial-gradient(ellipse at center, rgba(249,115,22,0.06) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />

            {/* ── Brand / close row ── */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid #f1f1f1' }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: 'linear-gradient(135deg,#f97316,#ea580c)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(249,115,22,0.35)',
                  }}
                >
                  <FiZap size={15} color="#fff" />
                </div>
                <span
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 700,
                    fontSize: 16,
                    letterSpacing: '-0.01em',
                    color: '#18181b',
                  }}
                >
                  Novax<span style={{ color: '#f97316' }}>Max</span>
                </span>
              </div>
              {isMobile && (
                <button
                  onClick={onClose}
                  style={{ color: '#9ca3af', padding: 4, borderRadius: 6 }}
                  className="hover:text-gray-700 transition-colors"
                >
                  <FiX size={18} />
                </button>
              )}
            </div>

            {/* ── Profile ── */}
            <div
              className="mx-4 my-4 flex items-center gap-3 p-3 rounded-xl"
              style={{
                background: '#fafafa',
                border: '1px solid #f0f0f0',
              }}
            >
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '2px solid #fed7aa',
                    background: '#fff7ed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {user?.image ? (
                    <Image
                      src={user.image}
                      alt={user?.name || 'Seller'}
                      width={42}
                      height={42}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span style={{ fontWeight: 700, fontSize: 16, color: '#f97316' }}>
                      {user?.name?.charAt(0)?.toUpperCase() || 'S'}
                    </span>
                  )}
                </div>
                {/* online dot */}
                <span
                  style={{
                    position: 'absolute',
                    bottom: 1,
                    right: 1,
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: '#22c55e',
                    border: '2px solid #ffffff',
                  }}
                />
              </div>
              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 600,
                    fontSize: 13,
                    color: '#18181b',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {user?.name || 'Seller Account'}
                </p>
                <p style={{ fontSize: 11, color: '#ea580c', marginTop: 1, fontWeight: 500 }}>
                  {user ? '● Active seller' : 'Guest Mode'}
                </p>
              </div>
            </div>

            {/* ── Section label ── */}
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.12em',
                color: '#b0b0b8',
                textTransform: 'uppercase',
                padding: '0 20px',
                marginBottom: 6,
              }}
            >
              Navigation
            </p>

            {/* ── Nav items ── */}
            <motion.nav
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="flex-1 overflow-y-auto px-3 pb-4"
              style={{ scrollbarWidth: 'none' }}
            >
              {menuItems.map((item) => {
                const active = isActive(item.path);
                const Icon   = item.icon;
                return (
                  <motion.button
                    key={item.path}
                    variants={itemVariant}
                    onClick={() => navigate(item.path)}
                    className="w-full flex items-center gap-3 mb-1 group"
                    style={{
                      padding: '9px 12px',
                      borderRadius: 10,
                      background: active
                        ? `${item.accent}12`
                        : 'transparent',
                      border: active
                        ? `1px solid ${item.accent}28`
                        : '1px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                    onMouseEnter={e => {
                      if (!active) {
                        (e.currentTarget as HTMLButtonElement).style.background = '#f6f6f7';
                        (e.currentTarget as HTMLButtonElement).style.borderColor = '#eee';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!active) {
                        (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent';
                      }
                    }}
                  >
                    {/* Active left bar */}
                    {active && (
                      <span
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: '20%',
                          height: '60%',
                          width: 3,
                          borderRadius: 4,
                          background: item.accent,
                        }}
                      />
                    )}

                    {/* Icon badge */}
                    <span
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        background: active ? `${item.accent}18` : '#f6f6f7',
                        color: active ? item.accent : '#9aa0ac',
                        transition: 'all 0.18s ease',
                      }}
                    >
                      <Icon size={16} />
                    </span>

                    <span
                      style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: 13.5,
                        fontWeight: active ? 600 : 400,
                        color: active ? '#18181b' : '#6b7280',
                        flex: 1,
                        textAlign: 'left',
                        transition: 'color 0.18s ease',
                      }}
                    >
                      {item.label}
                    </span>

                    {active && (
                      <FiChevronRight size={14} style={{ color: item.accent, opacity: 0.8 }} />
                    )}
                  </motion.button>
                );
              })}
            </motion.nav>

            {/* ── Footer ── */}
            <div
              className="mx-4 mb-4 p-3 rounded-xl"
              style={{
                background: '#fff7ed',
                border: '1px solid #fed7aa',
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: '#22c55e',
                    flexShrink: 0,
                    animation: 'pulse 2s infinite',
                  }}
                />
                <span style={{ fontSize: 11.5, fontWeight: 600, color: '#15803d' }}>
                  All systems operational
                </span>
              </div>
              <p style={{ fontSize: 10.5, color: '#c2876a', marginTop: 4 }}>
                © {new Date().getFullYear()} NovaxMax
              </p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap');
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </>
  );
}