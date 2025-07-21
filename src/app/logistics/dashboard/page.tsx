'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

type Order = {
  _id: string;
  customerName: string;
  deliveryAddress: string;
  deliveryStatus: string;
  items: { name: string; quantity: number }[];
};

export default function LogisticsDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    try {
      const res = await axios.get('/api/logistics/assigned-orders'); // your API
      setOrders(res.data);
    } catch (err) {
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await axios.patch('/api/orders/update-delivery-status', {
        orderId,
        status,
      });
      fetchOrders(); // refresh
    } catch (err) {
      console.error('Failed to update');
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Assigned Orders</h1>
      {orders.length === 0 ? (
        <p>No orders assigned yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="border p-4 rounded shadow">
              <p><strong>Customer:</strong> {order.customerName}</p>
              <p><strong>Address:</strong> {order.deliveryAddress}</p>
              <p><strong>Status:</strong> {order.deliveryStatus}</p>

              <div className="mt-2 flex space-x-2">
                {['picked', 'in-transit', 'delivered'].map((status) => (
                  <button
                    key={status}
                    onClick={() => updateStatus(order._id, status)}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                  >
                    Mark as {status}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
