'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CldImage } from 'next-cloudinary';
import type { ProductType } from '@/app/types/product';

export default function InstallmentSetupPage() {
  const { id } = useParams();

  const [product, setProduct] = useState<ProductType | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'3' | '6' | '12'>('6');
  const [showModal, setShowModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState('');

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        setProduct(data.product);
      } catch (err) {
        console.error('Failed to load product:', err);
      }
    };
    fetchItem();
  }, [id]);

  if (!product)
    return (
      <div className="pt-24 px-4">
        <p>Loading product...</p>
      </div>
    );

  const getPublicId = (url: string) => {
    const regex = /\/upload\/(?:v\d+\/)?([^\.]+)/;
    const match = url.match(regex);
    return match ? match[1] : url;
  };

  const total = product.calculatedPrice;
  const monthlyPayment = Math.round(total / Number(selectedPlan));

  const handleContinue = () => setShowModal(true);

  const handlePayment = async () => {
    setLoading(true);
    setPaymentMessage('');

    try {
      const res = await fetch('/api/installments/stk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneNumber,
          amount: monthlyPayment,
          productId: product._id,
          plan: selectedPlan,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPaymentMessage(data.error || 'Payment failed.');
      } else {
        setPaymentMessage('STK Push sent! Check your phone.');
      }
    } catch (error) {
      console.error(error);
      setPaymentMessage('Error initiating payment.');
    }

    setLoading(false);
  };

  return (
    <div className="pt-24 px-4 md:ml-64 max-w-3xl mx-auto">
      {/* Header */}
      <h1 className="text-2xl font-semibold mb-2">Set Up Installment Plan</h1>
      <p className="text-gray-600 mb-6">Choose how you want to pay for your product</p>

      {/* Product Details */}
      <div className="bg-white shadow rounded-lg p-4 flex gap-4">
        <CldImage
          src={getPublicId(product.images[0])}
          alt={product.name}
          width="200"
          height="200"
          crop="fill"
          className="w-32 h-32 rounded object-cover"
        />

        <div>
          <h2 className="font-semibold text-lg">{product.name}</h2>
          <p className="text-red-600 font-bold mt-1">Ksh.{total.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Old price: Ksh.{product.oldPrice.toLocaleString()}</p>
        </div>
      </div>

      {/* Installment Plans */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-3">Choose a payment plan</h3>

        <div className="grid grid-cols-3 gap-3">
          {['3', '6', '12'].map((plan) => (
            <button
              key={plan}
              onClick={() => setSelectedPlan(plan as '3' | '6' | '12')}
              className={`border rounded-lg p-4 text-center ${
                selectedPlan === plan
                  ? 'border-orange-600 bg-blue-50'
                  : 'border-gray-300'
              }`}
            >
              <p className="font-semibold">{plan} Months</p>
              <p className="text-sm text-gray-600 mt-1">
                Ksh.{Math.round(total / Number(plan)).toLocaleString()} / month
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="mt-8 bg-white shadow rounded-lg p-4">
        <h3 className="text-lg font-semibold">Plan Summary</h3>

        <div className="mt-3 space-y-2 text-sm">
          <p>
            <span className="font-medium">Total Price:</span> Ksh.{total.toLocaleString()}
          </p>
          <p>
            <span className="font-medium">Plan:</span> {selectedPlan} Months
          </p>
          <p>
            <span className="font-medium">Monthly Payment:</span>{' '}
            Ksh.{monthlyPayment.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Continue Button */}
      <button
        onClick={handleContinue}
        className="mt-6 w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700"
      >
        Continue to Payment
      </button>

      {/* ===================== CHECKOUT MODAL ===================== */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold">Confirm Your First Payment</h2>
            <p className="text-sm text-gray-600 mt-2">
              You are paying the first installment of{' '}
              <span className="font-bold text-orange-600">
                Ksh.{monthlyPayment.toLocaleString()}
              </span>
            </p>

            {/* Phone Input */}
            <div className="mt-4">
              <label className="text-sm font-medium">Phone Number (Mpesa)</label>
              <input
                type="text"
                placeholder="07xxxxxxxx"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full border rounded-md p-2 mt-1"
              />
            </div>

            {/* Error / Success Message */}
            {paymentMessage && (
              <p className="text-sm mt-3 text-center text-orange-600">{paymentMessage}</p>
            )}

            {/* Buttons */}
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-md border hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={handlePayment}
                disabled={loading}
                className="px-6 py-2 rounded-md bg-orange-600 text-white hover:bg-orange-700"
              >
                {loading ? 'Processing…' : 'Pay Now'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ================== END MODAL ================== */}
    </div>
  );
}
