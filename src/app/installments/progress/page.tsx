'use client';

import { useEffect, useState } from 'react';

export default function InstallmentProgressPage() {
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/installments/my-plans');
      const data = await res.json();
      setPlans(data.plans || []);
    };
    load();
  }, []);

  return (
    <div className="pt-24 px-4 md:ml-64">
      <h1 className="text-2xl font-semibold mb-6">My Installment Plans</h1>

      {plans.length === 0 ? (
        <p>You have no active installment plans.</p>
      ) : (
        <div className="space-y-4">
          {plans.map((plan: any) => {
            const progress = (plan.paidAmount / plan.totalAmount) * 100;

            return (
              <div
                key={plan._id}
                className="bg-white rounded-xl shadow p-4 border"
              >
                <h3 className="font-semibold">{plan.product.title}</h3>

                <p className="text-sm text-gray-600">
                  Total: KES {plan.totalAmount.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  Paid: KES {plan.paidAmount.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  Balance: KES {(plan.totalAmount - plan.paidAmount).toLocaleString()}
                </p>

                <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
                  <div
                    className="bg-orange-500 h-3 rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>

                <button
                  className="w-full mt-4 bg-orange-600 text-white py-2 rounded-xl"
                  onClick={() => {
                    // trigger payment modal
                  }}
                >
                  Pay Installment
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
