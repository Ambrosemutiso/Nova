import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import '@/styles/globals.css';
import { CartProvider } from '@/app/context/CartContext';
import { AuthProvider } from '@/app/context/AuthContext'
import { Toaster } from 'react-hot-toast';
import CartNotification  from '@/app/cart/CartNotification';
import Navbar from '@/components/Navbar';
import BackToTopButton from '@/components/BackToTopButton';
import { ThemeProvider } from 'next-themes';
import Script from 'next/script';
import LoginWrapper from '@/components/LoginWrapper';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NovaMart",
  description: "we sell all products on discounted price and deliver countrywide",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light">
      <AuthProvider>
        <CartProvider>
          <CartNotification />
          <Navbar />
<Script
  src="https://accounts.google.com/gsi/client"
  strategy="beforeInteractive"
/>
          <main className="min-h-screen">
            {children}
          </main>
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
                style: {
                  background: '#d1fae5',
                  color: '#065f46',
                },
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#d1fae5',
                },
              },
              error: {
                style: {
                  background: '#fee2e2',
                  color: '#991b1b',
                },
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fee2e2',
                },
              },
            }}
          />
        </CartProvider>
        </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}