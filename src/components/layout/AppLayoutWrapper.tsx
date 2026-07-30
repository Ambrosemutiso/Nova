'use client';

import { useEffect, useRef, useState } from 'react';

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
import InstallAppButton from '@/components/IstallAppBtton';
import PWARegister from '../PWARegister';
import { usePathname, useRouter } from 'next/navigation';
import MobileBottomNav from '../MobileNav';
import { listenToMessages, requestPermissionAndToken } from '@/lib/notifications';

/* ================= INNER UI ================= */
function LayoutUI({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // FIX 1: Track whether FCM has already been set up to prevent
  // re-registering the SW and re-saving the token on every re-render
  const fcmInitialized = useRef(false);

  const isSeller = user?.role === 'seller';

  // Redirect logic
  useEffect(() => {
    if (loading || !user) return;

    if (user.role === 'seller' && !pathname.startsWith('/seller')) {
      router.replace('/seller/dashboard');
    }

    if (user.role === 'buyer' && pathname.startsWith('/seller')) {
      router.replace('/');
    }
  }, [user, loading, pathname, router]);

  // Save last seller route
  useEffect(() => {
    if (user?.role === 'seller') {
      localStorage.setItem('lastSellerRoute', pathname);
    }
  }, [pathname, user]);

  // Restore last route
  useEffect(() => {
    if (loading || !user) return;

    if (user.role === 'seller' && pathname === '/') {
      const lastRoute = localStorage.getItem('lastSellerRoute');
      router.replace(lastRoute || '/seller/dashboard');
    }
  }, [user, loading, pathname, router]);

  useEffect(() => {
    if (!user?._id || fcmInitialized.current) return;

    fcmInitialized.current = true;

    const setup = async () => {
      try {
        const token = await requestPermissionAndToken();

        if (token) {
          const res = await fetch("/api/save-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, userId: user._id }),
          });

          if (!res.ok) {
            console.error("Failed to save FCM token:", await res.text());
          }
        }

        await listenToMessages();
      } catch (err) {
        console.error("FCM setup error:", err);
      }
    };

    setup();
  }, [user?._id]); 

  return (
    <>
      <CartNotification />
      <Navbar/>

      <main className="pt-[50px] md:ml-0 min-h-screen">
        {children}
      </main>
      <PWARegister/>
      <BackToTopButton />
      <LoginWrapper />
      <InstallAppButton />
      <MobileBottomNav/>
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

    const zoom = parseFloat(localStorage.getItem('fontSize') || '1');
    document.documentElement.style.fontSize = `${zoom * 100}%`;
  }, []);

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black/5 z-[999999999999999]">
        <div className="w-12 h-12 border-4 border-orange-500 border-dashed rounded-full animate-spin"></div>
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