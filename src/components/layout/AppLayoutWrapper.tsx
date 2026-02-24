'use client';

import { useEffect, useState } from 'react';

import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import SellerSidebar from '@/app/seller/sidebar/SellerSidebar';

import BackToTopButton from '@/components/BackToTopButton';
import LoginWrapper from '@/components/LoginWrapper';
import CartNotification from '@/app/cart/CartNotification';

import { CartProvider } from '@/app/context/CartContext';
import { AuthProvider, useAuth } from '@/app/context/AuthContext';
import { LanguageProvider } from '@/app/context/LanguageContext';

import { ToastContainer } from 'react-toastify';
import { ThemeProvider } from 'next-themes';

/* ================= INNER UI ================= */
function LayoutUI({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [startX, setStartX] = useState<number | null>(null);

  const isSeller = user?.role === 'seller';

  const handleTouchStart = (e: React.TouchEvent) => {
  setStartX(e.touches[0].clientX);
};

const handleTouchMove = (e: React.TouchEvent) => {
  if (!startX) return;

  const diff = e.touches[0].clientX - startX;

  if (diff < -80) {
    setSidebarOpen(false);
  }
};

  /* MOBILE SCROLL LOCK */
useEffect(() => {
  const isMobile = window.matchMedia("(max-width: 767px)").matches;

  if (sidebarOpen && isMobile) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }

  return () => {
    document.body.style.overflow = "";
  };
}, [sidebarOpen]);

  return (
    <>
      <CartNotification />

      {/* NAVBAR */}
      <Navbar onMenuClick={() => setSidebarOpen(true)} />

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:block fixed top-[110px] left-0 w-72 h-[calc(100vh-110px)] z-40">
        {isSeller ? <SellerSidebar /> : <Sidebar isOpen />}
      </aside>

{/* ================= MOBILE SIDEBAR ================= */}
<div
  onTouchStart={handleTouchStart}
  onTouchMove={handleTouchMove}
  className={`
    absolute top-0 left-0 h-full w-72
    transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
  `}
>
  {/* Overlay */}
  <div
    onClick={() => setSidebarOpen(false)}
    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
  />

  {/* Sliding Panel */}
  <div
    className={`
      absolute top-0 left-0 h-full w-72
      transition-transform duration-300 ease-out
      transform
      ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
    `}
  >
    {isSeller ? (
      <SellerSidebar onClose={() => setSidebarOpen(false)} />
    ) : (
      <Sidebar onClose={() => setSidebarOpen(false)} />
    )}
  </div>
</div>

      {/* PAGE */}
      <main className="pt-[40px] md:ml-72 min-h-screen">
        {children}
      </main>

      <BackToTopButton />
      <LoginWrapper />
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

/* ================= WRAPPER ================= */
export default function AppLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setTimeout(() => setReady(true), 600);

    const zoom =
      parseFloat(localStorage.getItem('fontSize') || '1');

    document.documentElement.style.fontSize =
      `${zoom * 100}%`;
  }, []);

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-10 w-10 border-b-2 border-orange-500 rounded-full" />
      </div>
    );
  }

  return (
    <LanguageProvider>
      <ThemeProvider attribute="class" defaultTheme="light">
        <AuthProvider>
          <CartProvider>
            <LayoutUI>{children}</LayoutUI>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}