import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import '@/styles/globals.css';
import AppLayoutWrapper from '@/components/layout/AppLayoutWrapper';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://novaxpress.co.ke"),
  title: "Novaxpress — Kenya’s Trusted Multi-Seller E-Commerce Marketplace",
  description:
    "Buy, sell, and advertise products across Kenya with Novaxpress — a powerful multi-seller e-commerce platform connecting local vendors and buyers. Enjoy secure M-Pesa payments, fast delivery, and video ad promotions that help your business grow online.",
  keywords: [
    "Kenya e-commerce",
    "online marketplace Kenya",
    "multi-seller platform Kenya",
    "sell products online Kenya",
    "M-Pesa payments",
    "Novaxpress Kenya",
    "online shop Kenya",
    "digital marketplace Kenya",
    "local business Kenya",
    "Kenya delivery platform",
  ],
  openGraph: {
    title: "Novaxmax — Kenya’s Trusted Multi-Seller E-Commerce Marketplace",
    description:
      "Join Novaxpress to buy and sell across Kenya. Secure payments, fast delivery, and engaging video ads that boost your product visibility.",
    url: "https://novaxpress.co.ke",
    siteName: "Novaxpress",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Novaxpress Kenya Marketplace",
      },
    ],
    locale: "en_KE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Novaxpress — Empowering Sellers, Connecting Kenya.",
    description:
      "Kenya’s leading multi-seller e-commerce marketplace. Promote your products with video ads, reach more buyers, and grow your business with Novaxpress.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AppLayoutWrapper>{children}</AppLayoutWrapper>
      </body>
    </html>
  );
}
