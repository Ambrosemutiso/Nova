'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  images: string[];
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  deliveryFee: number;
  createdAt: string;
  status: string;
  customerInfo: {
    firstName: string;
    lastName: string;
    phone: string;
    city: string;
  };
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const router = useRouter();

  const fetchOrders = async (page = 1, status = statusFilter, query = search) => {
    setLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        toast.error('Please log in first');
        router.push('/login');
        return;
      }

      const res = await fetch(`/api/orders/user?userId=${userId}&page=${page}&status=${status}&search=${query}`);
      const data = await res.json();

      if (res.ok) {
        setOrders(data.orders || []);
        setTotalPages(data.totalPages || 1);
      } else {
        toast.error(data.message || 'Failed to fetch orders.');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders(1, statusFilter, search);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-white py-24 px-4 md:px-10"
    >
      <h1 className="text-3xl font-bold text-orange-600 mb-6">My Orders</h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex items-center border rounded-lg overflow-hidden w-full md:w-1/2">
          <input
            type="text"
            placeholder="Search by product or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-grow px-4 py-2 outline-none"
          />
          <button type="submit" className="bg-orange-600 text-white px-4 py-2 hover:bg-orange-700 transition">
            <Search className="w-5 h-5" />
          </button>
        </form>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border px-4 py-2 rounded-lg text-gray-700"
        >
          <option value="All">All Orders</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Delivered">Delivered</option>
        </select>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin w-8 h-8 text-orange-600" />
        </div>
      ) : orders.length === 0 ? (
        <p className="text-center text-gray-500 italic py-20">No orders found.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="border rounded-xl p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="flex flex-wrap justify-between mb-3">
                <div>
                  <p className="text-sm text-gray-500">
                    Order ID: <span className="font-medium text-gray-700">{order._id}</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Date: <span className="font-medium text-gray-700">{new Date(order.createdAt).toLocaleString()}</span>
                  </p>
                </div>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${
                    order.status === 'Paid'
                      ? 'bg-green-100 text-green-700'
                      : order.status === 'Pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : order.status === 'Cancelled'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <div className="border-t pt-3 space-y-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 border-b pb-3">
                    <img
                      src={item.images?.[0] || '/placeholder.png'}
                      alt={item.name}
                      className="w-16 h-16 rounded object-cover"
                    />
                    <div className="flex-grow">
                      <p className="font-semibold text-gray-800">{item.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      <p className="text-sm text-gray-500">Ksh {(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4">
                <div>
                  <p className="text-sm text-gray-500">
                    Delivery: <span className="font-medium">{order.customerInfo.city}</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Customer: {order.customerInfo.firstName} {order.customerInfo.lastName}
                  </p>
                </div>
                <p className="font-bold text-lg text-orange-600">
                  Total: Ksh {order.totalAmount.toLocaleString()}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-10 gap-3">
          <button
            onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-4 py-2 border rounded-lg ${
              currentPage === 1
                ? 'text-gray-400 border-gray-200'
                : 'text-orange-600 border-orange-400 hover:bg-orange-50'
            }`}
          >
            Previous
          </button>
          <span className="text-gray-600 font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 border rounded-lg ${
              currentPage === totalPages
                ? 'text-gray-400 border-gray-200'
                : 'text-orange-600 border-orange-400 hover:bg-orange-50'
            }`}
          >
            Next
          </button>
        </div>
      )}
    </motion.div>
  );
}
