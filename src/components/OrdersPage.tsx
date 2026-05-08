'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Search, Truck, PackageCheck, Calendar, SlidersHorizontal, X } from 'lucide-react';
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
  trackingNumber: string;
  createdAt: string;
  status?: string;
  customerInfo?: {
    name?: string;
    phoneNumber?: string;
    county?: string;
    town?: string;
  };
}

const DELIVERY_STEPS = [
  { key: 'processing', title: 'Processing', description: 'Your order is being prepared' },
  { key: 'out_for_delivery', title: 'Out for delivery', description: 'Your package is on the way' },
  { key: 'delivered', title: 'Delivered', description: 'Order delivered successfully' },
];

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

  // ✅ Controls whether the advanced filter panel is visible on mobile
  const [showFilters, setShowFilters] = useState(false);

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) { toast.error('Please log in first'); return; }

      const params = new URLSearchParams({
        userId,
        page: page.toString(),
        status: statusFilter,
        search,
      });
      if (fromDate) params.append('from', fromDate);
      if (toDate) params.append('to', toDate);

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

  useEffect(() => { fetchOrders(); }, [statusFilter, currentPage]);
  useEffect(() => {
    const interval = setInterval(() => setTimeTrigger((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => { fetchOrders(currentPage); }, [timeTrigger]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchOrders(1); };
  const handleDateFilter = () => { setShowFilters(false); fetchOrders(1); };
  const handleClearFilters = () => {
    setFromDate(''); setToDate(''); setStatusFilter('All'); fetchOrders(1);
  };

  const getOrderDeliveryStage = (order: Order) => {
    if (order.items.every((i) => i.status === 'Delivered'))
      return { label: 'Delivered', color: 'text-gray-500', icon: <PackageCheck className="w-4 h-4" /> };
    if (order.trackingNumber)
      return { label: 'Out for delivery', color: 'text-orange-600', icon: <Truck className="w-4 h-4" /> };
    return { label: 'Processing', color: 'text-orange-500', pulse: true };
  };

  const getDeliveryStepIndex = (order: Order) => {
    if (order.items.every((i) => i.status === 'Delivered')) return 2;
    if (order.trackingNumber) return 1;
    return 0;
  };

  const hasActiveFilters = fromDate || toDate || statusFilter !== 'All';

  return (
    <motion.div
      key={timeTrigger}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-white py-24 px-4 md:px-10"
    >
      {/* ── FILTERS ─────────────────────────────────────────── */}
      <div className="mb-8 space-y-3">

        {/* Row 1: Search + filter toggle (mobile) / full controls (desktop) */}
        <div className="flex items-center gap-2">

          {/* Search — always visible, full width on mobile */}
          <form
            onSubmit={handleSearch}
            className="flex items-center border rounded-lg overflow-hidden flex-1 shadow-sm"
          >
            <input
              type="text"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-grow px-4 py-2 outline-none text-sm min-w-0"
            />
            <button
              type="submit"
              className="bg-orange-600 text-white px-4 py-2 hover:bg-orange-700 transition flex-shrink-0"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* ✅ Mobile: single "Filters" toggle button — keeps navbar unaffected */}
          <button
            onClick={() => setShowFilters((p) => !p)}
            className={`md:hidden flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium flex-shrink-0 transition
              ${showFilters || hasActiveFilters
                ? 'bg-orange-600 text-white border-orange-600'
                : 'text-orange-600 border-orange-300 hover:bg-orange-50'
              }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="bg-white text-orange-600 text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center ml-0.5">
                !
              </span>
            )}
          </button>

          {/* ✅ Desktop: status select inline with search */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="hidden md:block border px-3 py-2 rounded-lg text-gray-700 shadow-sm text-sm flex-shrink-0"
          >
            <option value="All">All Orders</option>
            <option value="Pending">Processing</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>

        {/* ✅ Desktop date filters — always visible on md+ */}
        <div className="hidden md:flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-orange-600 flex-shrink-0" />
            <span className="text-gray-500 whitespace-nowrap">From</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border rounded-lg px-2 py-1.5 text-gray-600 text-sm"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border rounded-lg px-2 py-1.5 text-gray-600 text-sm"
            />
          </div>
          <button
            onClick={handleDateFilter}
            className="bg-orange-600 text-white px-4 py-1.5 rounded-lg hover:bg-orange-700 transition text-sm"
          >
            Apply
          </button>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition"
            >
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>

        {/* ✅ Mobile expandable filter panel — slides in below search row */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-orange-50 border border-orange-100 rounded-xl p-4 space-y-3 overflow-hidden"
          >
            {/* Status on mobile */}
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1 block">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border px-3 py-2 rounded-lg text-gray-700 text-sm bg-white"
              >
                <option value="All">All Orders</option>
                <option value="Pending">Processing</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>

            {/* Date range on mobile — stacked vertically */}
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1 block">From date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-gray-600 text-sm bg-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1 block">To date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-gray-600 text-sm bg-white"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleDateFilter}
                className="flex-1 bg-orange-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition"
              >
                Apply Filters
              </button>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="flex items-center justify-center gap-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
                >
                  <X className="w-3.5 h-3.5" /> Clear
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* ── ORDERS ──────────────────────────────────────────── */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin w-8 h-8 text-orange-600" />
        </div>
      ) : orders.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-gray-500 italic py-20">
          <Player autoplay loop src="https://assets5.lottiefiles.com/packages/lf20_qh5z2fdq.json" style={{ height: '300px', width: '300px' }} />
          <p>No orders found for your filters.</p>
        </motion.div>
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => {
            const deliveryStage = getOrderDeliveryStage(order);
            const stepIndex = getDeliveryStepIndex(order);
            return (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="border border-orange-100 bg-orange-50/20 rounded-xl p-5 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex flex-wrap justify-between mb-3 items-start gap-2">
                  <div>
                    <p className="text-sm text-gray-500">
                      Order ID: <span className="font-medium text-gray-700">{order._id.slice(0, 8)}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Tracking: <span className="font-medium text-gray-700">{order.trackingNumber || '—'}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Date: <span className="font-medium text-gray-700">{new Date(order.createdAt).toLocaleString()}</span>
                    </p>
                    {order.customerInfo && (
                      <p className="text-sm text-gray-500">
                        Delivery: {order.customerInfo.county}, {order.customerInfo.town}
                      </p>
                    )}
                  </div>
                  <div className={`flex items-center gap-2 font-medium text-sm ${deliveryStage.color}`}>
                    {deliveryStage.pulse && <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />}
                    {deliveryStage.icon}
                    <span>{deliveryStage.label}</span>
                  </div>
                </div>

                <DeliveryTimeline currentStep={stepIndex} />

                <div className="border-t pt-3 space-y-4 mt-4">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 border-b pb-3 last:border-b-0">
                      <img
                        src={item.images?.[0] || '/placeholder.png'}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover border border-orange-100 flex-shrink-0"
                      />
                      <div className="flex-grow min-w-0">
                        <p className="font-semibold text-gray-800 truncate">{item.name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        <p className="text-sm text-gray-500">Ksh {(item.price * item.quantity).toLocaleString()}</p>
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

      {/* ── PAGINATION ───────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-10 gap-3">
          <button
            onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-4 py-2 border rounded-lg text-sm ${
              currentPage === 1 ? 'text-gray-400 border-gray-200' : 'text-orange-600 border-orange-400 hover:bg-orange-50'
            }`}
          >
            Previous
          </button>
          <span className="text-gray-600 font-medium text-sm">Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 border rounded-lg text-sm ${
              currentPage === totalPages ? 'text-gray-400 border-gray-200' : 'text-orange-600 border-orange-400 hover:bg-orange-50'
            }`}
          >
            Next
          </button>
        </div>
      )}
    </motion.div>
  );
}

function DeliveryTimeline({ currentStep }: { currentStep: number }) {
  return (
    <div className="mt-5">
      <div className="flex items-start justify-between relative">
        <div className="absolute top-3 left-0 right-0 h-[2px] bg-gray-200" />
        {DELIVERY_STEPS.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          return (
            <div key={step.key} className="relative z-10 flex-1 text-center px-1">
              <div className={`mx-auto w-4 h-4 rounded-full transition ${
                isCompleted ? 'bg-green-500' : isActive ? 'bg-orange-500 animate-pulse' : 'bg-gray-300'
              }`} />
              <p className={`mt-2 text-xs font-medium leading-tight ${
                isCompleted || isActive ? 'text-gray-800' : 'text-gray-400'
              }`}>{step.title}</p>
              <p className="text-xs text-gray-400 max-w-[100px] mx-auto hidden sm:block">{step.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}