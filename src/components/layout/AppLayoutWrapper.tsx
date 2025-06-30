'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import BackToTopButton from '@/components/BackToTopButton';
import LoginWrapper from '@/components/LoginWrapper';
import CartNotification from '@/app/cart/CartNotification';
import { CartProvider } from '@/app/context/CartContext';
import { AuthProvider } from '@/app/context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from 'next-themes';

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
          <main className="min-h-screen">{children}</main>
          <BackToTopButton />
          <LoginWrapper />
          <Toaster
            position="top-right"
            reverseOrder={false}
            toastOptions={{
              duration: 3000,
              style: {
                background: '#fff',
                color: '#333',
                fontSize: '14px',
                border: '1px solid #FFA500',
                padding: '12px',
                borderRadius: '8px',
              },
              success: {
                style: { background: '#d1fae5', color: '#065f46' },
                iconTheme: { primary: '#10b981', secondary: '#d1fae5' },
              },
              error: {
                style: { background: '#fee2e2', color: '#991b1b' },
                iconTheme: { primary: '#ef4444', secondary: '#fee2e2' },
              },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
