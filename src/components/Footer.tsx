'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export default function Footer({ onOpenSellerLogin }: { onOpenSellerLogin: () => void }) {
  const [isSeller, setIsSeller] = useState(false);

  useEffect(() => {
    const sellerData = localStorage.getItem('sellerUser');
    setIsSeller(!!sellerData);
  }, []);

  if (isSeller) {
    return (
      <footer className="bg-white shadow-md p-4 text-center text-gray-600">
        &copy; {new Date().getFullYear()}. All rights reserved.
      </footer>
    );
  }

  return (
    <footer className="bg-gray-100 text-gray-700 pt-10 pb-6 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        {/* About Us */}
        <div>
          <h4 className="font-bold mb-4">About Us</h4>
          <ul className="space-y-2">
            <li><a href="#">About NovaMart</a></li>
            <li><a href="#">Careers</a></li>
            <li><a href="#">Terms & Conditions</a></li>
            <li><a href="#">Privacy Policy</a></li>
          </ul>
        </div>

        {/* Help Center */}
        <div>
          <h4 className="font-bold mb-4">Help Center</h4>
          <ul className="space-y-2">
            <li><a href="#">How to Shop</a></li>
            <li><a href="#">Track Your Order</a></li>
            <li><a href="#">Returns & Refunds</a></li>
            <li><a href="#">Contact Us</a></li>
          </ul>
        </div>

        {/* Make Money */}
        <div>
          <h4 className="font-bold mb-4">Make Money With Us</h4>
          <ul className="space-y-2">
            <li>
              <button
                onClick={onOpenSellerLogin}
                className="text-left text-blue-600 hover:underline"
              >
                Sell on NovaMart
              </button>
            </li>
            <li><a href="#">Become a Logistics Partner</a></li>
            <li><a href="#">Join Affiliate Program</a></li>
          </ul>
        </div>

        {/* Social & Newsletter */}
        <div>
          <h4 className="font-bold mb-4">Connect With Us</h4>
          <div className="flex space-x-4 mb-4">
            <a href="#"><Facebook className="w-5 h-5" /></a>
            <a href="#"><Twitter className="w-5 h-5" /></a>
            <a href="#"><Instagram className="w-5 h-5" /></a>
            <a href="#"><Youtube className="w-5 h-5" /></a>
          </div>
          <h4 className="font-bold mb-2">Newsletter</h4>
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full px-2 py-1 border border-gray-300 rounded mb-2"
          />
          <button className="w-full bg-black text-white py-2 rounded hover:bg-gray-800">Subscribe</button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-10 px-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex space-x-4 items-center mb-4 md:mb-0">
            <h4 className="font-semibold text-sm">Payment Methods:</h4>
            <Image src="/visa.png" alt="Visa" width={40} height={24} />
            <Image src="/mastercard.png" alt="MasterCard" width={40} height={24} />
            <Image src="/M-PESA.png" alt="MPesa" width={40} height={24} />
          </div>

          <div className="flex space-x-4">
            <a href="#"><Image src="/play_store.png" alt="Google Play" width={135} height={40} /></a>
            <a href="#"><Image src="/app_store.png" alt="App Store" width={120} height={40} /></a>
          </div>
        </div>
      </div>

      <div className="text-center text-sm text-gray-500 mt-6">
        &copy; {new Date().getFullYear()}. All rights reserved.
      </div>
    </footer>
  );
}
