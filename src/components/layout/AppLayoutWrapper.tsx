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

  const isSeller = user?.role === 'seller';

  // ✅ Redirect logic
  useEffect(() => {
    if (loading || !user) return;

    if (user.role === 'seller' && !pathname.startsWith('/seller')) {
      router.replace('/seller/dashboard');
    }

    if (user.role === 'buyer' && pathname.startsWith('/seller')) {
      router.replace('/');
    }
  }, [user, loading, pathname, router]);

  // ✅ Save last seller route
  useEffect(() => {
    if (user?.role === 'seller') {
      localStorage.setItem('lastSellerRoute', pathname);
    }
  }, [pathname, user]);

  // ✅ Restore last route (SAFE)
  useEffect(() => {
    if (loading || !user) return;

    if (user.role === 'seller' && pathname === '/') {
      const lastRoute = localStorage.getItem('lastSellerRoute');
      router.replace(lastRoute || '/seller/dashboard');
    }
  }, [user, loading, pathname, router]);

useEffect(() => {
  if (!user?._id) return; // ✅ wait for user

  const setup = async () => {
    const token = await requestPermissionAndToken();

    if (token) {
      await fetch("/api/save-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          userId: user._id,
        }),
      });
    }
  };

  setup();
  listenToMessages();

}, [user]); // ✅ dependency added


  return (
    <>
      <CartNotification />

      {/* NAVBAR */}
      <Navbar/>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:block fixed top-[40px] left-0 w-72 h-[calc(100vh-110px)] z-40">
        {isSeller ? <SellerSidebar /> : <Sidebar isOpen />}
      </aside>

      {/* PAGE */}
      <main className="pt-[20px] md:ml-72 min-h-screen">
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

    const zoom =
      parseFloat(localStorage.getItem('fontSize') || '1');

    document.documentElement.style.fontSize =
      `${zoom * 100}%`;
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