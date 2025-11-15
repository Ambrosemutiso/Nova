'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import BackToTopButton from '@/components/BackToTopButton';
import LoginWrapper from '@/components/LoginWrapper';
import CartNotification from '@/app/cart/CartNotification';
import { CartProvider } from '@/app/context/CartContext';
import { AuthProvider } from '@/app/context/AuthContext';
import { ToastContainer } from 'react-toastify';
import { ThemeProvider } from 'next-themes';
import { LanguageProvider } from '@/app/context/LanguageContext';

export default function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 1000); 
    return () => clearTimeout(timeout);
  }, []);

  // ✅ Apply saved zoom on load
  useEffect(() => {
    const savedZoom = parseFloat(localStorage.getItem('fontSize') || '1');
    document.documentElement.style.fontSize = `${savedZoom * 100}%`;
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white p-5 rounded-xl shadow-sm">
              <div className="w-14 h-14 bg-gray-200 rounded-full mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <LanguageProvider>
    <ThemeProvider attribute="class" defaultTheme="light">
      <AuthProvider>
        <CartProvider>
          <CartNotification />
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <BackToTopButton />
          <LoginWrapper />
          <ToastContainer />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
    </LanguageProvider>
  );
}
