'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  FaFacebook,
  FaInstagram,
  FaTiktok,
  FaTwitter,
  FaYoutube,
} from 'react-icons/fa';

export default function Footer({
  onOpenSellerLogin,
}: {
  onOpenSellerLogin?: () => void;
}) {
  const [isSeller, setIsSeller] = useState(false);

  useEffect(() => {
    const sellerData = localStorage.getItem('sellerUser');
    setIsSeller(!!sellerData);
  }, []);

  /* ================= SELLER SIMPLE FOOTER ================= */
  if (isSeller) {
    return (
      <footer className="md:ml-72 bg-white shadow-md p-4 text-center text-gray-600">
        &copy; {new Date().getFullYear()} NovaXmax. All rights reserved.
      </footer>
    );
  }

  return (
    <footer
      className="
        md:ml-72
        bg-gray-100
        text-gray-700
        pt-10
        pb-6
        px-6
        transition-all
        duration-300
      "
    >
      {/* ================= GRID ================= */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">

        {/* About */}
        <div>
          <h4 className="font-bold mb-4">About Us</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/desc/about">About NovaXmax</a></li>
            <li><a href="/desc/careers">Careers</a></li>
            <li><a href="/desc/terms">Terms & Conditions</a></li>
          </ul>
        </div>

        {/* Policies */}
        <div>
          <h4 className="font-bold mb-4">Policies</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/desc/privacy">Privacy Policy</a></li>
            <li><a href="/desc/delivery-policy">Shipping Policy</a></li>
            <li><a href="/desc/buyer-protection-policy">Buyer Protection</a></li>
            <li><a href="/desc/seller-policy">Seller Policy</a></li>
          </ul>
        </div>

        {/* Help */}
        <div>
          <h4 className="font-bold mb-4">Help Center</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/desc/help/shop">How to Shop</a></li>
            <li><a href="/desc/help/track-order">Track Order</a></li>
            <li><a href="/desc/help/returns">Returns</a></li>
            <li><a href="/desc/help/contact">Contact Us</a></li>
            <li><a href="/desc/help/feedback">Give Feedback</a></li>
          </ul>
        </div>

        {/* Earn */}
        <div>
          <h4 className="font-bold mb-4">Make Money</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/desc/sell-on-novaxmax">Sell on NovaXmax</a></li>
            <li><a href="/desc/logistics-partner">Logistics Partner</a></li>
            <li><a href="/desc/novaxmax-affilliate-marketing">Affiliate</a></li>
            <li><a href="/desc/seller-Ai-tools">AI Tools</a></li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h4 className="font-bold mb-4">Connect</h4>

          <div className="flex gap-4 mb-4">
            <FaFacebook />
            <FaTwitter />
            <FaInstagram />
            <FaYoutube />
            <FaTiktok />
          </div>

          <input
            type="email"
            placeholder="Enter email"
            className="w-full px-3 py-2 border rounded mb-2"
          />

          <button className="w-full bg-black text-white py-2 rounded">
            Subscribe
          </button>
        </div>
      </div>

      {/* ================= PAYMENTS ================= */}
      <div className="max-w-7xl mx-auto mt-10 flex flex-col lg:flex-row items-center justify-between gap-6">

        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-semibold">
            Our Partners:
          </span>

          <Image src="/visa.png" alt="Visa" width={40} height={24} />
          <Image src="/mastercard.png" alt="MasterCard" width={40} height={24} />
          <Image src="/M-PESA.svg" alt="MPesa" width={40} height={24} />
          <Image src="/Airtel.svg" alt="Airtel" width={40} height={14} />
        </div>

        <div className="flex gap-4">
          <Image src="/play_store.png" alt="Play Store" width={135} height={40} />
          <Image src="/app_store.png" alt="App Store" width={120} height={40} />
        </div>

      </div>

      {/* ================= COPYRIGHT ================= */}
      <div className="text-center text-sm text-gray-500 mt-8">
        &copy; {new Date().getFullYear()} NovaXmax. All rights reserved.
      </div>
    </footer>
  );
}