'use client';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { useAuth } from '@/app/context/AuthContext';
import { toast } from 'react-toastify';

interface Order {
  id: string;
  productId: string;
  quantity: number;
  totalPrice: number;
  status: string;
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        const q = query(collection(db, 'orders'), where('sellerId', '==', user.uid));
        const snap = await getDocs(q);
        setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
      } catch (error) {
        console.error('Failed to load orders:', error);
        toast.error('Failed to load orders');
      }
    })();
  }, [user]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', id), { status: newStatus });
      toast.success('Status updated');
      setOrders(o => o.map(ord => (ord.id === id ? { ...ord, status: newStatus } : ord)));
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error updating status');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-orange-600 mb-4">Manage Orders</h2>
      <ul className="space-y-4">
        {orders.map(o => (
          <li key={o.id} className="bg-white p-4 rounded shadow">
            <p>Order: {o.id}</p>
            <p>Product: {o.productId}</p>
            <p>Quantity: {o.quantity}</p>
            <p>Total: Ksh {o.totalPrice}</p>
            <p>Status: <strong>{o.status}</strong></p>
            <div className="mt-2 space-x-2">
              {['pending', 'shipped', 'delivered']
                .filter(s => s !== o.status)
                .map(s => (
                  <button
                    key={s}
                    onClick={() => updateStatus(o.id, s)}
                    className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Mark “{s}”
                  </button>
                ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
