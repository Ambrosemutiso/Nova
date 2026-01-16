'use client';

import { useState } from 'react';
import { CldImage } from 'next-cloudinary';
import GlobalPayModal from '@/components/payments/GlobalPayModal';

export default function InstallmentProgressCard({ plan }: any) {
  const product = plan.product;
  const [showPay, setShowPay] = useState(false);

  const buyerId =
    typeof window !== 'undefined'
      ? localStorage.getItem('userId')
      : null;

  const getPublicId = (url: string) => {
    const regex = /\/upload\/(?:v\d+\/)?([^\.]+)/;
    const match = url?.match(regex);
    return match ? match[1] : url;
  };

  const progress = Math.min(
    (plan.paidAmount / plan.totalAmount) * 100,
    100
  );

  const fullyPaid = progress >= 100;

  return (
    <>
      <div className="bg-white rounded-xl p-4 shadow border">

        {/* PRODUCT INFO */}
        <div className="flex gap-4">
          <CldImage
            src={getPublicId(product.images[0])}
            width="120"
            height="120"
            crop="fill"
            alt={product.name}
            className="rounded"
          />

          <div>
            <h3 className="font-semibold text-gray-800">{product.name}</h3>
            <p className="text-sm text-gray-600">
              Total: Ksh {plan.totalAmount.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">
              Paid: Ksh {plan.paidAmount.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">
              Balance: Ksh {(plan.totalAmount - plan.paidAmount).toLocaleString()}
            </p>
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
          <div
            className={`h-3 rounded-full ${
              fullyPaid ? 'bg-green-600' : 'bg-orange-600'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* FULLY PAID MESSAGE */}
        {fullyPaid && (
          <p className="text-green-600 mt-3 font-semibold text-sm">
            🎉 Fully Paid! Ready for delivery.
          </p>
        )}

        {/* PAY BUTTON */}
        {!fullyPaid && (
          <button
            className="w-full mt-4 bg-orange-600 text-white py-2 rounded-xl"
            onClick={() => setShowPay(true)}
          >
            Pay Installment
          </button>
        )}
      </div>

      {showPay && buyerId && (
        <GlobalPayModal
          payload={{
            amount: plan.monthlyAmount,
            items: [],
            deliveryFee: 0,
            county: '',
            town: '',
            userId: buyerId,
            purpose: 'installment-monthly',
            refId: plan._id,
          }}
          onClose={() => setShowPay(false)}
          onSuccess={() => {
            setShowPay(false);
            window.location.reload();
          }}
        />
      )}
    </>
  );
}
