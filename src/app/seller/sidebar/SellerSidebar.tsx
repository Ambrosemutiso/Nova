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
  FiMenu,
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
  { label: 'Finance',      icon: FiTrendingUp,     path: '/seller/finance',          accent: '#22d3ee' },
  { label: 'Installments', icon: FiCreditCard,     path: '/seller/installments',     accent: '#a78bfa' },
  { label: 'Awards',       icon: FiStar,           path: '/seller/awards',           accent: '#fb923c' },
  { label: 'Messages',     icon: FiMessageCircle,  path: '/seller/chat',             accent: '#34d399' },
  { label: 'Ad Videos',    icon: FiVideo,          path: '/seller/ads/upload',       accent: '#f472b6' },
  { label: 'Feedback',     icon: FiInbox,          path: '/seller/feedback',         accent: '#60a5fa' },
  { label: 'Settings',     icon: FiSliders,        path: '/seller/settings',         accent: '#94a3b8' },
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
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
          />
        )}

        {/* ── Full sidebar ── */}
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
              background: 'linear-gradient(160deg, #0f0f13 0%, #18141f 60%, #1a1016 100%)',
              borderRight: '1px solid rgba(249,115,22,0.15)',
              boxShadow: '4px 0 40px rgba(0,0,0,0.5), inset -1px 0 0 rgba(255,255,255,0.04)',
            }}
          >
            {/* ── Decorative top glow ── */}
            <div
              aria-hidden
              style={{
                position: 'absolute',
                top: -60,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 220,
                height: 180,
                background: 'radial-gradient(ellipse at center, rgba(249,115,22,0.18) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />

            {/* ── Brand / close row ── */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
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
                    boxShadow: '0 0 12px rgba(249,115,22,0.45)',
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
                    background: 'linear-gradient(90deg,#fff 30%,#f97316)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  NovaxMax
                </span>
              </div>
              {isMobile && (
                <button
                  onClick={onClose}
                  style={{ color: 'rgba(255,255,255,0.4)', padding: 4, borderRadius: 6 }}
                  className="hover:text-white transition-colors"
                >
                  <FiX size={18} />
                </button>
              )}
            </div>

            {/* ── Profile ── */}
            <div
              className="mx-4 my-4 flex items-center gap-3 p-3 rounded-xl"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '2px solid rgba(249,115,22,0.6)',
                    boxShadow: '0 0 0 3px rgba(249,115,22,0.12)',
                  }}
                >
                  <Image
                    src={user?.image || user?.name?.charAt(0)?.toUpperCase() || "S"}
                    alt={user?.name || 'Seller'}
                    width={42}
                    height={42}
                    className="object-cover w-full h-full"
                  />
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
                    border: '2px solid #18141f',
                  }}
                />
              </div>
              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 600,
                    fontSize: 13,
                    color: '#fff',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {user?.name || 'Seller Account'}
                </p>
                <p style={{ fontSize: 11, color: 'rgba(249,115,22,0.8)', marginTop: 1 }}>
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
                color: 'rgba(255,255,255,0.25)',
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
                        ? `linear-gradient(90deg, ${item.accent}22, ${item.accent}08)`
                        : 'transparent',
                      border: active
                        ? `1px solid ${item.accent}30`
                        : '1px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                    onMouseEnter={e => {
                      if (!active) {
                        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)';
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)';
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
                          boxShadow: `0 0 8px ${item.accent}`,
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
                        background: active ? `${item.accent}25` : 'rgba(255,255,255,0.05)',
                        color: active ? item.accent : 'rgba(255,255,255,0.45)',
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
                        color: active ? '#fff' : 'rgba(255,255,255,0.55)',
                        flex: 1,
                        textAlign: 'left',
                        transition: 'color 0.18s ease',
                      }}
                    >
                      {item.label}
                    </span>

                    {active && (
                      <FiChevronRight size={14} style={{ color: item.accent, opacity: 0.7 }} />
                    )}
                  </motion.button>
                );
              })}
            </motion.nav>

            {/* ── Footer ── */}
            <div
              className="mx-4 mb-4 p-3 rounded-xl"
              style={{
                background: 'rgba(249,115,22,0.06)',
                border: '1px solid rgba(249,115,22,0.14)',
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: '#22c55e',
                    boxShadow: '0 0 6px #22c55e',
                    flexShrink: 0,
                    animation: 'pulse 2s infinite',
                  }}
                />
                <span style={{ fontSize: 11.5, fontWeight: 600, color: '#86efac' }}>
                  All systems operational
                </span>
              </div>
              <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.28)', marginTop: 4 }}>
                © {new Date().getFullYear()} NovaxMax
              </p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Mobile mini sidebar with labels ── */}
      {isMobile && !isOpen && (
        <motion.div
          key="mini-sidebar"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
style={{
  position: 'fixed',
  top: 12,
  bottom: 12,
  left: 10,
  zIndex: 20,

  background:
    'linear-gradient(180deg, rgba(20,20,25,0.96), rgba(10,10,15,0.98))',

  backdropFilter: 'blur(14px)',

  border: '1px solid rgba(249,115,22,0.2)',
  borderLeft: '1px solid rgba(255,255,255,0.04)',

  borderRadius: 16,

  boxShadow: '0 8px 32px rgba(0,0,0,0.45)',

  padding: '12px 6px',

  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 2,

  width: 68,

  overflowY: 'auto',
  overflowX: 'hidden',

  scrollbarWidth: 'none',
  WebkitOverflowScrolling: 'touch',
}}
        >
          {menuItems.map((item) => {
            const active = isActive(item.path);
            const Icon   = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                  padding: '7px 6px',
                  borderRadius: 10,
                  background: active ? `${item.accent}20` : 'transparent',
                  border: active ? `1px solid ${item.accent}35` : '1px solid transparent',
                  width: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon
                  size={18}
                  style={{
                    color: active ? item.accent : 'rgba(255,255,255,0.4)',
                    filter: active ? `drop-shadow(0 0 4px ${item.accent})` : 'none',
                    transition: 'all 0.15s ease',
                  }}
                />
                <span
                  style={{
                    fontSize: 9,
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: active ? 600 : 400,
                    color: active ? item.accent : 'rgba(255,255,255,0.35)',
                    textAlign: 'center',
                    lineHeight: 1.2,
                    maxWidth: 52,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* Expand button */}
          <button
            onClick={onOpen}
            style={{
              marginTop: 4,
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg,#f97316,#ea580c)',
              boxShadow: '0 0 14px rgba(249,115,22,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: 'none',
              flexShrink: 0,
            }}
          >
            <FiMenu size={16} color="#fff" />
          </button>
        </motion.div>
      )}

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