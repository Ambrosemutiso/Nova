'use client';

import { useEffect, useState } from 'react';
import InstallmentProgressCard from '@/components/InstallmentProgressCard';

export default function InstallmentProgressPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [tab, setTab] = useState<'current' | 'completed'>('current');

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

  const currentPlans = plans.filter(
    p => p.status !== 'completed'
  );

  const completedPlans = plans.filter(
    p => p.status === 'completed'
  );

  const visiblePlans =
    tab === 'current' ? currentPlans : completedPlans;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-6xl mx-auto px-4 pt-28 pb-10">
      <h1 className="text-2xl font-semibold mb-6">
        My Installment Plans
      </h1>

      {/* TABS */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setTab('current')}
          className={`px-4 py-2 rounded ${
            tab === 'current'
              ? 'bg-orange-600 text-white'
              : 'bg-gray-200'
          }`}
        >
          Current
        </button>

        <button
          onClick={() => setTab('completed')}
          className={`px-4 py-2 rounded ${
            tab === 'completed'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200'
          }`}
        >
          Completed
        </button>
      </div>

      {visiblePlans.length === 0 ? (
        <p>No installment plans in this category.</p>
      ) : (
        <div className="space-y-4">
          {visiblePlans.map(plan => (
            <InstallmentProgressCard
              key={plan._id}
              plan={plan}
            />
          ))}
        </div>
      )}
    </div>
    </div>
  );
}