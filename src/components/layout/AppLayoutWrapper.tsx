'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import BackToTopButton from '@/components/BackToTopButton';
import LoginWrapper from '@/components/LoginWrapper';
import CartNotification from '@/app/cart/CartNotification';
import { CartProvider } from '@/app/context/CartContext';
import { AuthProvider } from '@/app/context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import { ThemeProvider } from 'next-themes';
import { SpeedInsights } from '@vercel/speedinsights/next'

export default function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 1000); // simulate a short loading delay
    return () => clearTimeout(timeout);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-12 h-12 border-4 border-orange-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <AuthProvider>
        <CartProvider>
          <CartNotification />
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <SpeedInsights/>
          <BackToTopButton />
          <LoginWrapper />
          <ToastContainer/>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
