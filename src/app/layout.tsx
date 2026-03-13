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
  metadataBase: new URL("https://novaxmax.com"),
  manifest: "/manifest.json",
    title: {
    default: "NovaXmax — Kenya’s Trusted Multi-Seller Marketplace",
    template: "%s | NovaXmax",
    },
    themeColor: "#f97316",
  description:
    "Buy, sell, and advertise products across Kenya with Novaxmax — a powerful multi-seller e-commerce platform connecting local vendors and buyers. Enjoy secure M-Pesa payments, fast delivery, and video ad promotions that help your business grow online.",

    keywords: [
    "Kenya e-commerce",
    "online marketplace Kenya",
    "multi-seller platform Kenya",
    "sell products online Kenya",
    "M-Pesa payments",
    "NovaXmax Kenya",
    "online shop Kenya",
    "digital marketplace Kenya",
    "local business Kenya",
    "buy products online Kenya",
    "sell online Kenya",
    "M-Pesa shopping",
    "NovaXmax",
  ],
    robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "NovaXmax — Kenya’s Trusted Multi-Seller E-Commerce Marketplace",
    description:
      "Join NovaXmax to buy and sell across Kenya. Secure payments, fast delivery, and engaging video ads that boost your product visibility.",
    url: "https://novaxmax.com",
    siteName: "Novaxmax",
    images: [
      {
        url: "https://novaxmax.com/banner8.jpg",
        width: 1200,
        height: 630,
        alt: "NovaXmax Kenya Marketplace",
      },
    ],
    locale: "en_KE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NovaXmax — Empowering Sellers, Connecting Kenya.",
    description:
      "Kenya’s leading multi-seller e-commerce marketplace. Promote your products with video ads, reach more buyers, and grow your business with Novaxpress.",
    images: ["https://novaxmax.com/banner8.jpg"],
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
