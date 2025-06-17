'use client';

import { useEffect, useState } from 'react';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface Order {
  _id: string;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('sellerUser');
    if (!storedUser) return;
    const seller = JSON.parse(storedUser);

    fetch('/api/seller/orders', {
      method: 'POST',
      body: JSON.stringify({ sellerId: seller._id }),
    })
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders || []);
        setLoading(false);
      })
      .catch((err) => console.error('Error loading orders:', err));
  }, []);

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold text-orange-600 mb-4">Seller Orders</h1>
      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white p-4 rounded shadow border border-gray-100"
            >
              <div className="mb-2">
                <h2 className="text-lg font-semibold">Order #{order._id.slice(-6)}</h2>
                <p className="text-sm text-gray-500">Status: {order.status}</p>
                <p className="text-sm text-gray-500">
                  Date: {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-sm text-gray-700">
                Customer: {order.customerInfo.firstName} {order.customerInfo.lastName} | {order.customerInfo.phone}
              </div>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded object-cover border"
                    />
                    <div>
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <p className="text-sm">Qty: {item.quantity}</p>
                      <p className="text-sm">Ksh {item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-right font-bold text-orange-600">
                Total: Ksh {order.totalAmount.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
