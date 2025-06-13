'use client';

import { useEffect, useState } from 'react';

export default function OrderStatus({ orderId }: { orderId: string }) {
  const [status, setStatus] = useState('Processing');
  const [receipt, setReceipt] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();

        if (res.ok) {
          setStatus(data.status);
          setReceipt(data.mpesaReceiptNumber);
          if (data.status !== 'Processing') {
            setChecking(false);
            clearInterval(interval);
          }
        } else {
          setStatus('Error checking status');
          setChecking(false);
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Status error:', error);
        setStatus('Error checking status');
        setChecking(false);
        clearInterval(interval);
      }
    }, 5000); // Check every 5s

    return () => clearInterval(interval);
  }, [orderId]);

  return (
    <div className="p-4 border rounded-lg mt-4 bg-white shadow">
      <h2 className="text-xl font-bold">Payment Status</h2>
      <p className="mt-2">
        Status: <span className="font-semibold">{status}</span>
      </p>
      {receipt && (
        <p>
          M-PESA Receipt: <span className="text-green-600 font-mono">{receipt}</span>
        </p>
      )}
      {checking && (
        <p className="text-sm text-gray-500 mt-2">⏳ Checking payment status...</p>
      )}
    </div>
  );
}
