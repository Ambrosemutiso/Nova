'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CldImage } from 'next-cloudinary';
import { toast } from 'react-toastify';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  images: string[];
  status?: string;
}

interface Order {
  _id: string;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
    deliveryInstructions?: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

export default function LogisticsOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  const [statusFilter, setStatusFilter] =
    useState<'All' | 'Pending' | 'Delivered'>('All');

  const [itemNameFilter, setItemNameFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [selectedDeliveryOrder, setSelectedDeliveryOrder] =
    useState<Order | null>(null);

  const pageSize = 5;

  // 🔒 Check authentication
  useEffect(() => {
    const token = localStorage.getItem('logisticsToken');

    if (!token) {
      router.replace('/logistics/auth');
      return;
    }

    setAuthChecked(true);
  }, [router]);

  // 📦 Load orders AFTER auth check
  useEffect(() => {
    if (!authChecked) return;

    const token = localStorage.getItem('logisticsToken');
    if (!token) return;

    setLoading(true);

    fetch('/api/logistics/orders', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (res.status === 401) {
          toast.error('Session expired. Please login again.');
          localStorage.removeItem('logisticsToken');
          router.replace('/logistics/auth');
          return;
        }

        const data = await res.json();
        setOrders(data.orders || []);
        setTotalPages(Math.ceil((data.orders?.length || 0) / pageSize));
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading orders:', err);
        setLoading(false);
      });
  }, [authChecked, router]);

  const logout = () => {
    localStorage.removeItem('logisticsToken');
    toast.success('Logged out');
    router.replace('/logistics/auth');
  };

  // ☁ Extract Cloudinary public ID
  const getPublicId = (url: string) => {
    const regex = /\/upload\/(?:v\d+\/)?([^\.]+)/;
    const match = url.match(regex);
    return match ? match[1] : url;
  };

  // 🚚 Mark item delivered (token required)
  const markItemDelivered = async (orderId: string, itemName: string) => {
    const token = localStorage.getItem('logisticsToken');
    if (!token) return;

    try {
      const res = await fetch('/api/logistics/update-item-status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId,
          itemName,
          newStatus: 'Delivered',
        }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        toast.success('Item marked as delivered');

        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId
              ? {
                  ...order,
                  items: order.items.map((item) =>
                    item.name === itemName
                      ? { ...item, status: 'Delivered' }
                      : item
                  ),
                }
              : order
          )
        );
      } else {
        toast.error(json.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Error marking delivery:', err);
      toast.error('Something went wrong.');
    }
  };

  // FILTERS -----------------------------------

  const filteredItems = (items: OrderItem[]) => {
    let filtered =
      statusFilter === 'All'
        ? items
        : items.filter((it) => it.status === statusFilter);

    if (itemNameFilter.trim()) {
      filtered = filtered.filter((it) =>
        it.name.toLowerCase().includes(itemNameFilter.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredOrders = orders
    .filter((order) => {
      const d = new Date(order.createdAt);
      const inRange =
        (!startDate || new Date(startDate) <= d) &&
        (!endDate || d <= new Date(endDate));
      return inRange;
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  const paginated = filteredOrders.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  if (!authChecked) return <div className="p-10">Checking session...</div>;

  return (
    <div className="px-6 pt-28 pb-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-orange-500">
          Logistics Dashboard – All Orders
        </h1>

        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
        >
          Logout
        </button>
      </div>

      {/* FILTERS */}
      <div className="mb-4 flex gap-2 flex-wrap items-center">
        {['All', 'Pending', 'Delivered'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status as any)}
            className={`px-3 py-1 rounded ${
              statusFilter === status
                ? 'bg-orange-500 text-white'
                : 'bg-gray-200'
            }`}
          >
            {status}
          </button>
        ))}

        <input
          type="text"
          placeholder="Filter by item name"
          value={itemNameFilter}
          onChange={(e) => setItemNameFilter(e.target.value)}
          className="border px-2 py-1 rounded"
        />

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border px-2 py-1 rounded"
        />

        <span>-</span>

        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border px-2 py-1 rounded"
        />
      </div>

      {/* ORDERS */}
      {loading ? (
        <p>Loading orders...</p>
      ) : filteredOrders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <>
          <div className="space-y-6">
            {paginated.map((order) => {
              const visible = filteredItems(order.items).sort((a, b) =>
                a.name.localeCompare(b.name)
              );
              if (visible.length === 0) return null;

              return (
                <div
                  key={order._id}
                  className="bg-white p-4 rounded shadow border"
                >
                  <div className="mb-2">
                    <h2 className="text-lg font-semibold">
                      Order #{order._id.slice(-6)}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Status: {order.status} | Date:{' '}
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="text-sm text-gray-700">
                    Customer: {order.customerInfo.firstName}{' '}
                    {order.customerInfo.lastName} |{' '}
                    {order.customerInfo.phone}
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {visible.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 border p-2 rounded"
                      >
                        {item.images?.[0] ? (
                          <CldImage
                            src={getPublicId(item.images[0])}
                            alt={item.name}
                            width="100"
                            height="100"
                            crop="fill"
                            className="w-44 h-44 object-cover rounded"
                          />
                        ) : (
                          <div className="w-44 h-44 bg-gray-200 flex items-center justify-center text-gray-500 rounded">
                            No image
                          </div>
                        )}

                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
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
                    Subtotal: Ksh{' '}
                    {visible
                      .reduce(
                        (sum, it) => sum + it.price * it.quantity,
                        0
                      )
                      .toLocaleString()}
                  </div>

                  <div className="mt-2 text-right">
                    <button
                      onClick={() => {
                        setSelectedDeliveryOrder(order);
                        setShowDeliveryModal(true);
                      }}
                      className="text-sm text-orange-600 underline"
                    >
                      View Delivery Information
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* PAGINATION */}
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

      {/* DELIVERY INFO MODAL */}
      {showDeliveryModal && selectedDeliveryOrder && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white w-full max-w-md p-6 rounded shadow-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-600 text-xl"
              onClick={() => setShowDeliveryModal(false)}
            >
              ✕
            </button>

            <h2 className="text-lg font-semibold mb-4 text-orange-500">
              Delivery Info
            </h2>

            <p>
              <strong>Name:</strong>{' '}
              {selectedDeliveryOrder.customerInfo.firstName}{' '}
              {selectedDeliveryOrder.customerInfo.lastName}
            </p>

            <p>
              <strong>Phone:</strong>{' '}
              {selectedDeliveryOrder.customerInfo.phone}
            </p>

            <p>
              <strong>Email:</strong>{' '}
              {selectedDeliveryOrder.customerInfo.email}
            </p>

            <p>
              <strong>Address:</strong>{' '}
              {selectedDeliveryOrder.customerInfo.address || 'N/A'}
            </p>

            <p>
              <strong>City:</strong>{' '}
              {selectedDeliveryOrder.customerInfo.city || 'N/A'}
            </p>

            <p>
              <strong>Instructions:</strong>{' '}
              {selectedDeliveryOrder.customerInfo.deliveryInstructions ||
                'None'}
            </p>

            <div className="mt-4 text-right">
              <button
                onClick={() => setShowDeliveryModal(false)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
