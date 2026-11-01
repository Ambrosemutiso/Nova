
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  FaFacebook,
  FaInstagram,
  FaTiktok,
  FaTwitter,
  FaYoutube,
  FaArrowRight,
  FaEnvelope,
  FaStore,
  FaShieldAlt,
  FaHeadset,
  FaGlobeAfrica,
} from 'react-icons/fa';

export default function Footer({
  onOpenSellerLogin,
}: {
  onOpenSellerLogin?: () => void;
}) {
  const [isSeller, setIsSeller] = useState(false);

  useEffect(() => {
    const checkSeller = () => {
      setIsSeller(!!localStorage.getItem('sellerUser'));
    };

    checkSeller();

    window.addEventListener('storage', checkSeller);

    return () => {
      window.removeEventListener('storage', checkSeller);
    };
  }, []);

  const year = new Date().getFullYear();

  const linkStyle =
    'text-sm text-gray-400 transition-colors duration-200 hover:text-orange-400';

  const socialLinks = [
    {
      name: 'Facebook',
      icon: FaFacebook,
      url: 'https://www.facebook.com/',
    },
    {
      name: 'Instagram',
      icon: FaInstagram,
      url: 'https://www.instagram.com/',
    },
    {
      name: 'Twitter',
      icon: FaTwitter,
      url: 'https://twitter.com/',
    },
    {
      name: 'YouTube',
      icon: FaYoutube,
      url: 'https://www.youtube.com/',
    },
    {
      name: 'TikTok',
      icon: FaTiktok,
      url: 'https://www.tiktok.com/',
    },
  ];

  /* ================= SELLER FOOTER ================= */

  if (isSeller) {
    return (
      <footer className="md:ml-5 border-t border-gray-100 bg-white px-4 py-5 text-center">
        <p className="text-xs text-gray-500">
          © {year} <span className="font-bold text-orange-600">NovaXmax</span>.
          All rights reserved.
        </p>
      </footer>
    );
  }

  return (
    <footer className="md:ml-5 overflow-hidden bg-[#151515] text-white">

      {/* ================= TOP BRAND AREA ================= */}

      <div className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-9 sm:px-8 lg:flex-row lg:items-center lg:justify-between">

          <div className="max-w-xl">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Shop smarter.
              <span className="text-orange-500"> Sell bigger.</span>
            </h2>

            <p className="mt-2 max-w-lg text-sm leading-6 text-gray-400">
              Discover products, connect with sellers and grow your business
              with NovaXmax.
            </p>
          </div>

          {onOpenSellerLogin && (
            <button
              type="button"
              onClick={onOpenSellerLogin}
              className="group flex w-fit items-center gap-3 rounded-xl bg-orange-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-700"
            >
              <FaStore size={16} />
              Seller Login
              <FaArrowRight
                size={12}
                className="transition-transform group-hover:translate-x-1"
              />
            </button>
          )}
        </div>
      </div>

      {/* ================= MAIN FOOTER ================= */}

      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-10 px-5 py-10 sm:px-8 md:grid-cols-3 lg:grid-cols-5">

        {/* ABOUT */}

        <div>
          <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-white">
            About NovaXmax
          </h3>

          <ul className="space-y-3">
            <li>
              <Link href="/desc/about" className={linkStyle}>
                About Us
              </Link>
            </li>
            <li>
              <Link href="/desc/careers" className={linkStyle}>
                Careers
              </Link>
            </li>
            <li>
              <Link href="/desc/terms" className={linkStyle}>
                Terms & Conditions
              </Link>
            </li>
          </ul>
        </div>

        {/* POLICIES */}

        <div>
          <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-white">
            Policies
          </h3>

          <ul className="space-y-3">
            <li>
              <Link href="/desc/privacy" className={linkStyle}>
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/desc/delivery-policy" className={linkStyle}>
                Shipping Policy
              </Link>
            </li>
            <li>
              <Link href="/desc/buyer-protection-policy" className={linkStyle}>
                Buyer Protection
              </Link>
            </li>
            <li>
              <Link href="/desc/seller-policy" className={linkStyle}>
                Seller Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* HELP */}

        <div>
          <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-white">
            Customer Care
          </h3>

          <ul className="space-y-3">
            <li>
              <Link href="/desc/help/shop" className={linkStyle}>
                How to Shop
              </Link>
            </li>
            <li>
              <Link href="/desc/help/track-order" className={linkStyle}>
                Track Order
              </Link>
            </li>
            <li>
              <Link href="/desc/help/returns" className={linkStyle}>
                Returns
              </Link>
            </li>
            <li>
              <Link href="/desc/help/contact" className={linkStyle}>
                Contact Us
              </Link>
            </li>
            <li>
              <Link href="/desc/help/feedback" className={linkStyle}>
                Give Feedback
              </Link>
            </li>
          </ul>
        </div>

        {/* SELL & EARN */}

        <div>
          <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-white">
            Sell & Earn
          </h3>

          <ul className="space-y-3">
            <li>
              <Link href="/desc/sell-on-novaxmax" className={linkStyle}>
                Sell on NovaXmax
              </Link>
            </li>
            <li>
              <Link href="/desc/logistics-partner" className={linkStyle}>
                Logistics Partner
              </Link>
            </li>
            <li>
              <Link href="/desc/novaxmax-affilliate-marketing" className={linkStyle}>
                Affiliate Program
              </Link>
            </li>
            <li>
              <Link href="/desc/seller-Ai-tools" className={linkStyle}>
                Seller AI Tools
              </Link>
            </li>
          </ul>
        </div>

        {/* CONNECT */}

        <div className="col-span-2 sm:col-span-1">
          <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-white">
            Stay Connected
          </h3>

          <p className="mb-4 text-sm leading-6 text-gray-400">
            Follow NovaXmax for updates, offers and marketplace news.
          </p>

          <div className="flex flex-wrap gap-2">
            {socialLinks.map(({ name, icon: Icon, url }) => (
              <a
                key={name}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={name}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 transition hover:border-orange-500 hover:bg-orange-600 hover:text-white"
              >
                <Icon size={15} />
              </a>
            ))}
          </div>

          <div className="mt-5 space-y-3">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <FaShieldAlt className="text-orange-500" />
              Secure marketplace experience
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-400">
              <FaHeadset className="text-orange-500" />
              Customer support
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-400">
              <FaGlobeAfrica className="text-orange-500" />
              Built for African markets
            </div>
          </div>
        </div>
      </div>

      {/* ================= PAYMENT METHODS ================= */}

      <div className="border-y border-white/10 bg-white/[0.03]">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-7 sm:px-8 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-300">
              Payment Methods
            </h3>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex h-10 w-16 items-center justify-center rounded-md bg-white px-2">
                <Image
                  src="/visa.png"
                  alt="Visa"
                  width={45}
                  height={27}
                  className="object-contain"
                />
              </div>

              <div className="flex h-10 w-16 items-center justify-center rounded-md bg-white px-2">
                <Image
                  src="/mastercard.png"
                  alt="Mastercard"
                  width={45}
                  height={27}
                  className="object-contain"
                />
              </div>

              <div className="flex h-10 w-16 items-center justify-center rounded-md bg-white px-2">
                <Image
                  src="/M-PESA.svg"
                  alt="M-Pesa"
                  width={45}
                  height={27}
                  className="object-contain"
                />
              </div>

              <div className="flex h-10 w-16 items-center justify-center rounded-md bg-white px-2">
                <Image
                  src="/Airtel.svg"
                  alt="Airtel Money"
                  width={45}
                  height={27}
                  className="object-contain"
                />
              </div>
            </div>
          </div>

          {/* APP DOWNLOAD */}

          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-300">
              Get the App
            </h3>

            <div className="flex flex-wrap items-center gap-3">
              <Image
                src="/play_store.png"
                alt="Get it on Google Play"
                width={135}
                height={40}
                className="h-10 w-auto object-contain"
              />

              <Image
                src="/app_store.png"
                alt="Download on the App Store"
                width={120}
                height={40}
                className="h-10 w-auto object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ================= BOTTOM BAR ================= */}

      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-6 text-center sm:px-8 md:flex-row md:text-left">

        <p className="text-xs text-gray-500">
          © {year}{' '}
          <span className="font-bold text-orange-500">NovaXmax</span>.
          All rights reserved.
        </p>

        <p className="text-xs text-gray-500">
          Empowering sellers to maximise sales and reach.
        </p>

      </div>
    </footer>
  );
}
