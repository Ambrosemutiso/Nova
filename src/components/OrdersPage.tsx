'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, Search, Truck, PackageCheck, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { Player } from '@lottiefiles/react-lottie-player';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  images: string[];
  status?: 'Pending' | 'Out for delivery' | 'Delivered';
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  deliveryFee: number;
  createdAt: string;
  status?: string;
  customerInfo?: {
    name?: string;
    phoneNumber?: string;
    county?: string;
    town?: string;
  };
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [timeTrigger, setTimeTrigger] = useState(0);

  const router = useRouter();

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        toast.error('Please log in first');
        router.push('/login');
        return;
      }

      const params = new URLSearchParams({
        userId,
        page: page.toString(),
        status: statusFilter,
        search,
      });

      if (fromDate) params.append('from', fromDate);
      if (toDate) params.append('to', toDate);

      // ✅ Match the backend API route
      const res = await fetch(`/api/orders/user?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setOrders(data.orders || []);
        setTotalPages(data.totalPages || 1);
      } else {
        toast.error(data.message || 'Failed to fetch orders.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, currentPage]);

  useEffect(() => {
    const interval = setInterval(() => setTimeTrigger((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchOrders(currentPage);
  }, [timeTrigger]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders(1);
  };

  const handleDateFilter = () => {
    fetchOrders(1);
  };

  const getOrderDeliveryStage = (items: OrderItem[]) => {
    const statuses = items.map((i) => i.status || 'Pending');
    if (statuses.every((s) => s === 'Delivered'))
      return { label: 'Delivered', color: 'text-gray-500', icon: <PackageCheck className="w-4 h-4" /> };
    if (statuses.some((s) => s === 'Out for delivery'))
      return { label: 'Out for delivery', color: 'text-orange-600', icon: <Truck className="w-4 h-4" /> };
    return { label: 'Processing', color: 'text-green-600', pulse: true };
  };

  return (
    <motion.div
      key={timeTrigger}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-white py-24 px-4 md:px-10"
    >
      <h1 className="text-3xl font-bold text-orange-600 mb-8 border-b pb-2">
        My Orders
      </h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row flex-wrap items-center justify-between gap-4 mb-8">
        <form onSubmit={handleSearch} className="flex items-center border rounded-lg overflow-hidden w-full md:w-[40%] shadow-sm">
          <input
            type="text"
            placeholder="Search by product, county or town..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-grow px-4 py-2 outline-none"
          />
          <button
            type="submit"
            className="bg-orange-600 text-white px-4 py-2 hover:bg-orange-700 transition"
          >
            <Search className="w-5 h-5" />
          </button>
        </form>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border px-4 py-2 rounded-lg text-gray-700 shadow-sm"
          >
            <option value="All">All Orders</option>
            <option value="Pending">Processing</option>
            <option value="Out for delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
          </select>

          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-600" />
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border rounded-lg px-2 py-1 text-gray-600"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border rounded-lg px-2 py-1 text-gray-600"
            />
            <button
              onClick={handleDateFilter}
              className="bg-orange-600 text-white px-3 py-1 rounded-lg hover:bg-orange-700 transition"
            >
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Orders */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin w-8 h-8 text-orange-600" />
        </div>
      ) : orders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-gray-500 italic py-20"
        >
        <Player
          autoplay
          loop
          src="https://assets5.lottiefiles.com/packages/lf20_qh5z2fdq.json"
          style={{ height: '300px', width: '300px' }}
        />
          <p>No orders found for your filters.</p>
        </motion.div>
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => {
            const deliveryStage = getOrderDeliveryStage(order.items);
            return (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="border border-orange-100 bg-orange-50/20 rounded-xl p-5 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex flex-wrap justify-between mb-3 items-center">
                  <div>
                    <p className="text-sm text-gray-500">
                      Order ID:{' '}
                      <span className="font-medium text-gray-700">
                        {order._id.slice(0, 8)}
                      </span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Date:{' '}
                      <span className="font-medium text-gray-700">
                        {new Date(order.createdAt).toLocaleString()}
                      </span>
                    </p>
                    {order.customerInfo && (
                      <p className="text-sm text-gray-500">
                        Delivery: {order.customerInfo.county}, {order.customerInfo.town}
                      </p>
                    )}
                  </div>

                  <div className={`flex items-center gap-2 font-medium ${deliveryStage.color}`}>
                    {deliveryStage.pulse && (
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                    )}
                    {deliveryStage.icon}
                    <span>{deliveryStage.label}</span>
                  </div>
                </div>

                <div className="border-t pt-3 space-y-4">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 border-b pb-3">
                      <img
                        src={item.images?.[0] || '/placeholder.png'}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover border border-orange-100"
                      />
                      <div className="flex-grow">
                        <p className="font-semibold text-gray-800">{item.name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        <p className="text-sm text-gray-500">
                          Ksh {(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end items-center pt-4">
                  <p className="font-bold text-lg text-orange-600">
                    Total: Ksh {order.totalAmount?.toLocaleString() || 0}
                  </p>
                </div>
              </motion.div>
            );
          })}
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
