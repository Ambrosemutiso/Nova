'use client';

import { useEffect, useState } from 'react';

import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import BackToTopButton from '@/components/BackToTopButton';
import LoginWrapper from '@/components/LoginWrapper';
import CartNotification from '@/app/cart/CartNotification';

import { CartProvider } from '@/app/context/CartContext';
import { AuthProvider } from '@/app/context/AuthContext';
import { LanguageProvider } from '@/app/context/LanguageContext';

import { ToastContainer } from 'react-toastify';
import { ThemeProvider } from 'next-themes';

export default function AppLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* ================= INITIAL LOADER ================= */
  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timeout);
  }, []);

  /* ================= RESTORE ZOOM ================= */
  useEffect(() => {
    const savedZoom = parseFloat(
      localStorage.getItem('fontSize') || '1'
    );
    document.documentElement.style.fontSize = `${savedZoom * 100}%`;
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <LanguageProvider>
      <ThemeProvider attribute="class" defaultTheme="light">
        <AuthProvider>
          <CartProvider>

            {/* ================= GLOBAL COMPONENTS ================= */}
            <CartNotification />

            {/* ================= NAVBAR ================= */}
            <Navbar onMenuClick={() => setSidebarOpen(true)} />

            {/* ================= DESKTOP SIDEBAR ================= */}
            <aside
              className="
                hidden md:block
                fixed
                top-0
                left-0
                h-[calc(100vh-110px)]
                w-72
                z-[60]
              "
            >
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </aside>

            {/* ================= MOBILE SIDEBAR ================= */}
            {sidebarOpen && (
              <div className="md:hidden">
                <Sidebar onClose={() => setSidebarOpen(false)} />
              </div>
            )}

            {/* ================= MAIN CONTENT AREA ================= */}
            <main
              className="
                pt-[30px]
                md:ml-72
                min-h-screen
                transition-all
                duration-300
                bg-gradient-to-b
                from-orange-50
                to-white
                dark:from-gray-900
                dark:to-gray-950
              "
            >
              {children}
            </main>

            {/* ================= GLOBAL UTILITIES ================= */}
            <BackToTopButton />
            <LoginWrapper />
            <ToastContainer position="top-right" autoClose={3000} />

          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}