// --- Success Page (app/success/page.tsx) ---
'use client';

import { useSearchParams } from 'next/navigation';

export default function SuccessPage() {
  const params = useSearchParams();
  const orderId = params.get('orderId');

  return (
    <div className="p-10 text-center">
      <h1 className="text-3xl font-bold text-green-600 mb-4">Payment Successful</h1>
      <p>Your order has been received and is being processed.</p>
      <p className="mt-4 text-gray-600">Order ID: {orderId}</p>
      <a href="/orders" className="text-blue-500 hover:underline">My Orders</a>
    </div>
  );
}