'use client';

import { useState } from 'react';
import { initiateCheckoutPayment } from '@/lib/checkoutPayment';

type PaymentMethod = 'mpesa' | 'npay';

type Props = {
  payload: {
    amount: number;
    items: any[];
    deliveryFee: number;
    county: string;
    town: string;
    userId: string;
    purpose:
      | 'order'
      | 'installment-deposit'
      | 'installment-monthly'
      | 'wallet'
      | 'shop-upgrade';
    refId: string;
  };
  onClose: () => void;
  onSuccess: () => void;
};

export default function GlobalPayModal({
  payload,
  onClose,
  onSuccess,
}: Props) {
  const [method, setMethod] = useState<PaymentMethod>('mpesa');
  const [phone, setPhone] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const safeAmount = Math.round(Number(payload.amount));

  const isValidPhone = (value: string) =>
    /^(07\d{8}|2547\d{8})$/.test(value);

  const normalizePhone = (value: string) =>
    value.startsWith('0') ? value.replace(/^0/, '254') : value;

  const handleWalletPayment = async () => {
    try {
      const res = await fetch('/api/wallet/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: payload.userId,
          amount: safeAmount,
          purpose: payload.purpose,
          refId: payload.refId,
          items: payload.items,
          deliveryFee: payload.deliveryFee,
          county: payload.county,
          town: payload.town
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Wallet payment failed');
        setProcessing(false);
        return;
      }

      setProcessing(false);
      onClose();
      onSuccess();
    } catch {
      setError('Wallet payment failed');
      setProcessing(false);
    }
  };

  const handleTelcoPayment = async () => {
    await initiateCheckoutPayment({
      phone: normalizePhone(phone),
      method,
      amount: safeAmount,
      items: payload.items,
      deliveryFee: payload.deliveryFee,
      county: payload.county,
      town: payload.town,
      userId: payload.userId,
      purpose: payload.purpose,
      refId: payload.refId,
      onSuccess: () => {
        setProcessing(false);
        onClose();
        onSuccess();
      },
      onFailure: () => {
        setProcessing(false);
        setError('Payment failed or cancelled');
      },
    });
  };

  const handlePay = async () => {
    setError(null);

    if (!safeAmount || safeAmount < 1) {
      setError('Invalid payment amount');
      return;
    }

    if (method !== 'npay' && !isValidPhone(phone)) {
      setError('Enter a valid Safaricom number');
      return;
    }

    setProcessing(true);

    if (method === 'npay') {
      await handleWalletPayment();
    } else {
      await handleTelcoPayment();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[9999]">

      {/* Drawer */}
      <div className="
        fixed bottom-0 left-0 right-0 
        md:top-0 md:right-0 md:left-auto md:w-[400px] md:h-full
        bg-white rounded-t-2xl md:rounded-none
        p-5 space-y-4 shadow-xl
        animate-slideUp
      ">

        {/* Handle (mobile UX) */}
        <div className="w-10 h-1 bg-gray-300 rounded mx-auto md:hidden"></div>

        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">Checkout</h2>
          <button onClick={onClose} className="text-gray-500">✕</button>
        </div>

        {/* Amount */}
        <div className="text-center">
          <p className="text-sm text-gray-500">Total Amount</p>
          <p className="text-2xl font-bold text-orange-600">
            Ksh {safeAmount.toLocaleString()}
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-600 text-center">
            {error}
          </p>
        )}

        {/* Payment Methods */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600">
            Select Payment Method
          </p>

          <button
            onClick={() => setMethod('mpesa')}
            className={`w-full flex items-center justify-between border p-3 rounded-lg ${
              method === 'mpesa'
                ? 'border-green-500 bg-green-50'
                : ''
            }`}
          >
            <span className="font-medium">M-Pesa</span>
            {method === 'mpesa' && '✓'}
          </button>

          <button
            onClick={() => setMethod('npay')}
            className={`w-full flex items-center justify-between border p-3 rounded-lg ${
              method === 'npay'
                ? 'border-orange-500 bg-orange-50'
                : ''
            }`}
          >
            <span className="font-medium">N-PAY Wallet</span>
            {method === 'npay' && '✓'}
          </button>
        </div>

        {/* Phone Input */}
        {method === 'mpesa' && (
          <input
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value.trim())
            }
            placeholder="Enter M-Pesa Number (e.g. 0712345678)"
            className="w-full border rounded p-3"
          />
        )}

        {/* Wallet Info */}
        {method === 'npay' && (
          <div className="text-sm bg-orange-50 border border-orange-200 p-3 rounded text-orange-700">
            Payment will be deducted from your <b>N-PAY Wallet</b>.
          </div>
        )}

        {/* Sticky CTA */}
        <div className="pt-2">
          <button
            onClick={handlePay}
            disabled={processing}
            className="w-full bg-orange-600 text-white rounded-lg py-3 font-semibold"
          >
            {processing ? 'Processing...' : 'Pay Now'}
          </button>

          <button
            onClick={onClose}
            className="w-full mt-2 text-sm text-gray-500"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}