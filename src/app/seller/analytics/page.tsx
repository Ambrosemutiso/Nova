'use client';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { useAuth } from '@/app/context/AuthContext';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({ totalOrders: 0, totalRevenue: 0 });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const q = query(collection(db, 'orders'), where('sellerId', '==', user.uid));
      const snap = await getDocs(q);
      let revenue = 0;
      snap.docs.forEach(d => revenue += (d.data().totalPrice || 0));
      setMetrics({ totalOrders: snap.size, totalRevenue: revenue });
    })();
  }, [user]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-orange-600 mb-4">Sales Analytics</h2>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow text-center">
          <p className="text-gray-600">Total Orders</p>
          <p className="text-3xl font-bold">{metrics.totalOrders}</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <p className="text-gray-600">Total Revenue</p>
          <p className="text-3xl font-bold">Ksh {metrics.totalRevenue}</p>
        </div>
      </div>
    </div>
  );
}
