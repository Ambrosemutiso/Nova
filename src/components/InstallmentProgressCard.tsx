'use client';

import { useState } from 'react';
import { CldImage } from 'next-cloudinary';
import GlobalPayModal from '@/components/payments/GlobalPayModal';

export default function InstallmentProgressCard({ plan }: any) {
  const product = plan?.product ?? {};

  const totalAmount = Number(plan?.totalAmount ?? 0);
  const paidAmount = Number(plan?.paidAmount ?? 0);
  const monthlyAmount = Number(plan?.monthlyAmount ?? 0);

  const balance = Math.max(totalAmount - paidAmount, 0);

  const progress =
    totalAmount > 0
      ? Math.min((paidAmount / totalAmount) * 100, 100)
      : 0;

  const fullyPaid = plan?.status === 'completed';

  const [showPay, setShowPay] = useState(false);

  const buyerId =
    typeof window !== 'undefined'
      ? localStorage.getItem('userId')
      : null;

  const getPublicId = (url?: string) => {
    if (!url) return '';
    const match = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
    return match ? match[1] : url;
  };

  return (
    <>
      <div className="bg-white rounded-xl p-4 shadow border space-y-4">

        {/* PRODUCT */}
        <div className="flex gap-4">
          {product?.images?.[0] && (
            <CldImage
              src={getPublicId(product.images[0])}
              width="120"
              height="120"
              crop="fill"
              alt={product?.name ?? 'Product'}
              className="rounded"
            />
          )}

          <div>
            <h3 className="font-semibold text-gray-800">
              {product?.name ?? 'Product'}
            </h3>

            <p className="text-sm text-gray-600">
              Total: Ksh {totalAmount.toLocaleString()}
            </p>

            <p className="text-sm text-gray-600">
              Paid: Ksh {paidAmount.toLocaleString()}
            </p>

            <p className="text-sm text-gray-600">
              Balance: Ksh {balance.toLocaleString()}
            </p>
          </div>
        </div>

        {/* PROGRESS */}
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full ${
              fullyPaid ? 'bg-green-600' : 'bg-orange-600'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* ACTION */}
        {fullyPaid ? (
          <p className="text-green-600 font-semibold text-sm">
            🎉 Fully Paid — Awaiting delivery
          </p>
        ) : (
          <button
            className="w-full bg-orange-600 text-white py-2 rounded-xl"
            onClick={() => setShowPay(true)}
          >
            Pay Installment
          </button>
        )}
      </div>

      {showPay && buyerId && (
        <GlobalPayModal
          payload={{
            amount: monthlyAmount,
            items: [],
            deliveryFee: 0,
            county:'',
            town: '',
            userId: buyerId,
            purpose: 'installment-monthly',
            refId: plan._id,
          }}
          onClose={() => setShowPay(false)}
          onSuccess={() => {
            setShowPay(false);
            setTimeout(() => window.location.reload(), 3000);
          }}
        />
      )}
    </>
  );
}
