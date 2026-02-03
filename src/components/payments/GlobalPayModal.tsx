'use client';

import { useState } from 'react';
import { initiateCheckoutPayment } from '@/lib/checkoutPayment';

type PaymentMethod = 'mpesa' | 'airtel' | 'npay';

type Props = {
  payload: {
    amount: number;
    items: any[];
    deliveryFee: number;
    county: string;
    town: string;
    userId: string;
    purpose: 'order' | 'installment-deposit' | 'installment-monthly' | 'wallet' | 'shop-upgrade';
    refId: string;
  };
  onClose: () => void;
  onSuccess: () => void;
};

export default function GlobalPayModal({ payload, onClose, onSuccess }: Props) {
  const [method, setMethod] = useState<PaymentMethod>('mpesa');
  const [phone, setPhone] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const safeAmount = Math.round(Number(payload.amount));

  const isValidPhone = (value: string) =>
    /^(07\d{8}|2547\d{8})$/.test(value);

  const normalizePhone = (value: string) =>
    value.startsWith('0') ? value.replace(/^0/, '254') : value;

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

    await initiateCheckoutPayment({
      phone: method === 'npay' ? '' : normalizePhone(phone),
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
      onFailure: () => setProcessing(false),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center">
      <div className="bg-white rounded-xl w-full max-w-md p-6 space-y-4 shadow-xl">
        <h2 className="text-xl font-bold text-center">Checkout Payment</h2>

        <p className="text-center text-orange-600 font-semibold">
          Total: Ksh {safeAmount.toLocaleString()}
        </p>

        {error && (
          <p className="text-sm text-red-600 text-center">{error}</p>
        )}

        {/* Payment Methods */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setMethod('mpesa')}
            className={`border p-2 rounded ${
              method === 'mpesa' ? 'border-green-500 bg-green-50' : ''
            }`}
          >
            M-Pesa
          </button>

          <button
            onClick={() => setMethod('airtel')}
            className={`border p-2 rounded ${
              method === 'airtel' ? 'border-red-500 bg-red-50' : ''
            }`}
          >
            Airtel
          </button>

          <button
            onClick={() => setMethod('npay')}
            className={`border p-2 rounded ${
              method === 'npay' ? 'border-orange-500 bg-purple-50' : ''
            }`}
          >
            N-PAY
          </button>
        </div>

        
        {/* Phone (only for telco payments) */}
        {method !== 'npay' && (
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value.trim())}
            placeholder="e.g. 0712345678"
            className="w-full border rounded p-2"
          />
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={processing}
            className="flex-1 border rounded py-2"
          >
            Cancel
          </button>

          <button
            onClick={handlePay}
            disabled={processing}
            className="flex-1 bg-orange-600 text-white rounded py-2"
          >
            {processing ? 'Processing...' : 'Pay Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
