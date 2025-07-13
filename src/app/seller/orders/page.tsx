'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { toast, ToastContainer } from 'react-toastify';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image: string;
  status?: string;
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
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Delivered'>('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const pageSize = 5;

  useEffect(() => {
    const storedUser = localStorage.getItem('sellerUser');
    if (!storedUser) return;

    const seller = JSON.parse(storedUser);
    setLoading(true);

    fetch('/api/seller/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sellerId: seller._id }),
    })
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders || []);
        setTotalPages(Math.ceil((data.orders?.length || 0) / pageSize));
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading orders:', err);
        setLoading(false);
      });
  }, []);

  const markItemDelivered = async (orderId: string, itemName: string) => {
    try {
      const res = await fetch('/api/seller/update-item-status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          itemName,
          newStatus: 'Delivered',
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toast.success('Item marked as delivered! ✅');

        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId
              ? {
                  ...order,
                  items: order.items.map((item) =>
                    item.name === itemName ? { ...item, status: 'Delivered' } : item
                  ),
                }
              : order
          )
        );
      } else {
        toast.error(json.message || 'Failed to update item status');
      }
    } catch (err) {
      console.error('Update error:', err);
      toast.error('Something went wrong');
    }
  };

  const filteredItems = (items: OrderItem[]) =>
    statusFilter === 'All' ? items : items.filter((item) => item.status === statusFilter);

  const paginatedOrders = orders.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="p-4 md:p-6">
      <ToastContainer />
      <h1 className="text-2xl font-bold text-orange-600 mb-4">Seller Orders</h1>

      <div className="mb-4 flex gap-2">
        {['All', 'Pending', 'Delivered'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status as any)}
            className={`px-3 py-1 rounded ${
              statusFilter === status ? 'bg-orange-500 text-white' : 'bg-gray-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <>
          <div className="space-y-6">
            {paginatedOrders.map((order) => {
              const visibleItems = filteredItems(order.items);
              if (visibleItems.length === 0) return null;

              return (
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
                    Customer: {order.customerInfo.firstName} {order.customerInfo.lastName} |{' '}
                    {order.customerInfo.phone}
                  </div>
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {visibleItems.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 border p-2 rounded"
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="rounded object-cover border"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{item.name}</p>
                          <p className="text-sm">Qty: {item.quantity}</p>
                          <p className="text-sm">Ksh {item.price}</p>
                          <p className="text-xs text-gray-500">
                            Status:{' '}
                            <span className="font-semibold">
                              {item.status || 'Pending'}
                            </span>
                          </p>
                          {item.status !== 'Delivered' && (
                            <button
                              onClick={() =>
                                markItemDelivered(order._id, item.name)
                              }
                              className="mt-2 text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                            >
                              Mark as Delivered
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-right font-bold text-orange-600">
                    Total: Ksh {order.totalAmount.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          <div className="mt-8 flex justify-between items-center">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
