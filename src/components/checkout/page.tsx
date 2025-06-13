'use client';

import Link from 'next/link';

export default function CheckoutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold mb-6">Select Payment Method</h2>
      <div className="grid gap-4 grid-cols-2">
        <Link href="/checkout/stripe">
          <button className="w-full bg-blue-400 text-white py-3 rounded hover:bg-blue-700">
            Stripe
          </button>
        </Link>
        <Link href="/checkout/mpesa">
          <button className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700">
            M-Pesa
          </button>
        </Link>
        <Link href="/">
          <button className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700">
            Card
          </button>
        </Link>
        <Link href="/">
          <button className="w-full bg-gray-800 text-white py-3 rounded hover:bg-gray-900">
            PayPal
          </button>
        </Link>
        <Link href="/">
          <button className="w-full bg-yellow-500 text-white py-3 rounded hover:bg-yellow-600">
            Bitcoin
          </button>
        </Link>
        <Link href="/">
          <button className="w-full bg-purple-600 text-white py-3 rounded hover:bg-purple-700">
            Ethereum
          </button>
        </Link>

      </div>
    </div>
  );
}
