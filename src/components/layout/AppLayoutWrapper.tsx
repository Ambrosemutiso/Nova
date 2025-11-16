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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto"></div>
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