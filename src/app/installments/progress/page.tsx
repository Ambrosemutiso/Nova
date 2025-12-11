'use client';

import { useEffect, useState } from 'react';
import InstallmentProgressCard from '@/components/InstallmentProgressCard';

export default function InstallmentProgressPage() {
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    const buyerId = localStorage.getItem("userId");

    const load = async () => {
      const res = await fetch('/api/installments/my-plans', {
        headers: { "buyer-id": buyerId || "" },
      });
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
          {plans.map((plan: any) => (
            <InstallmentProgressCard
              key={plan._id}
              plan={plan}
              onPay={() => {
                // open pay modal
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
