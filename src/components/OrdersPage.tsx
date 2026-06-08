'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, Search, Truck, PackageCheck, Calendar,
  SlidersHorizontal, X, ShieldCheck, RotateCcw,
  MapPin, Hash, Clock, ChevronDown, ChevronUp,
  Star, ArrowRight, Zap, Package
} from 'lucide-react';
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
  {
    key: 'processing',
    title: 'Order Placed',
    description: 'Confirmed & being packed',
    icon: Package,
  },
  {
    key: 'out_for_delivery',
    title: 'On the Way',
    description: 'Your package is en route',
    icon: Truck,
  },
  {
    key: 'delivered',
    title: 'Delivered',
    description: 'Successfully received',
    icon: PackageCheck,
  },
];

// ─── Trust signals shown in the page header ─────────────────────────────────
const TRUST_SIGNALS = [
  { icon: ShieldCheck,  label: 'Buyer Protection',  sub: 'On every order',      color: 'from-emerald-500 to-teal-500' },
  { icon: RotateCcw,    label: '7-Day Returns',      sub: 'No questions asked',  color: 'from-blue-500 to-indigo-500' },
  { icon: Truck,        label: 'Real-time Tracking', sub: 'Live order updates',  color: 'from-orange-500 to-amber-500' },
  { icon: Zap,          label: 'Fast Resolution',    sub: '< 24hr support',      color: 'from-violet-500 to-purple-500' },
];

export default function MyOrdersPage() {
  const [orders, setOrders]           = useState<Order[]>([]);
  const [loading, setLoading]         = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch]           = useState('');
  const [fromDate, setFromDate]       = useState('');
  const [toDate, setToDate]           = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [timeTrigger, setTimeTrigger] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) { toast.error('Please log in first'); return; }

      const params = new URLSearchParams({ userId, page: page.toString(), status: statusFilter, search });
      if (fromDate) params.append('from', fromDate);
      if (toDate)   params.append('to', toDate);

      const res  = await fetch(`/api/orders/user?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setOrders(data.orders || []);
        setTotalPages(data.totalPages || 1);
      } else {
        toast.error(data.message || 'Failed to fetch orders.');
      }
    } catch (err) {
      toast.error('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [statusFilter, currentPage]);
  useEffect(() => {
    const id = setInterval(() => setTimeTrigger(t => t + 1), 60000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => { fetchOrders(currentPage); }, [timeTrigger]);

  const handleSearch     = (e: React.FormEvent) => { e.preventDefault(); fetchOrders(1); };
  const handleDateFilter = () => { setShowFilters(false); fetchOrders(1); };
  const handleClearFilters = () => { setFromDate(''); setToDate(''); setStatusFilter('All'); fetchOrders(1); };
  const hasActiveFilters   = !!(fromDate || toDate || statusFilter !== 'All');

  const getDeliveryStage = (order: Order) => {
    if (order.items.every(i => i.status === 'Delivered'))
      return { label: 'Delivered',         step: 2, variant: 'delivered' as const };
    if (order.trackingNumber)
      return { label: 'Out for Delivery',  step: 1, variant: 'transit'   as const };
    return   { label: 'Processing',        step: 0, variant: 'processing' as const };
  };

  const stageStyles = {
    processing: { bg: 'bg-amber-50',   border: 'border-amber-200',  text: 'text-amber-700',  dot: 'bg-amber-500',   badge: 'bg-amber-100 text-amber-800'  },
    transit:    { bg: 'bg-orange-50',  border: 'border-orange-200', text: 'text-orange-700', dot: 'bg-orange-500',  badge: 'bg-orange-100 text-orange-800' },
    delivered:  { bg: 'bg-emerald-50', border: 'border-emerald-200',text: 'text-emerald-700',dot: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-800'},
  };

  return (
    <div className="min-h-screen bg-[#f8f7f4] py-24 px-4 md:px-8 lg:px-12">

      {/* ── Page hero ──────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
          <div>
            <p className="text-xs font-bold text-orange-500 uppercase tracking-[0.15em] mb-1">My Account</p>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-none">
              Your Orders<span className="text-orange-500">.</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1.5">
              {orders.length > 0 ? `${orders.length} order${orders.length !== 1 ? 's' : ''} found` : 'Track and manage all your purchases'}
            </p>
          </div>
          {orders.length > 0 && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 bg-white border border-emerald-200 rounded-2xl px-4 py-2.5 shadow-sm"
            >
              <ShieldCheck size={16} className="text-emerald-500" />
              <span className="text-xs font-semibold text-emerald-700">All orders protected</span>
            </motion.div>
          )}
        </div>

        {/* Trust signal strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {TRUST_SIGNALS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 + 0.2 }}
              className="bg-white rounded-2xl p-3 flex items-center gap-3 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center flex-shrink-0`}>
                <t.icon size={15} className="text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-800 leading-tight">{t.label}</p>
                <p className="text-[10px] text-gray-400 truncate">{t.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Filters ────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6"
      >
        <div className="flex items-center gap-2">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-orange-400 focus-within:border-orange-400 transition-all">
            <Search size={15} className="ml-3 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search by product, order ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
            />
            <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 text-xs font-bold transition flex-shrink-0">
              Search
            </button>
          </form>

          {/* Status pills — desktop */}
          <div className="hidden md:flex items-center gap-1.5">
            {['All', 'Pending', 'Delivered'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  statusFilter === s
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-600'
                }`}
              >
                {s === 'Pending' ? 'Processing' : s}
              </button>
            ))}
          </div>

          {/* Filter toggle — mobile */}
          <button
            onClick={() => setShowFilters(p => !p)}
            className={`md:hidden flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
              showFilters || hasActiveFilters
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-600'
            }`}
          >
            <SlidersHorizontal size={14} />
            {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
          </button>
        </div>

        {/* Desktop date filters */}
        <div className="hidden md:flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
          <Calendar size={14} className="text-orange-500" />
          <span className="text-xs text-gray-500 font-medium">Date range:</span>
          <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 focus:ring-2 focus:ring-orange-400 outline-none" />
          <span className="text-xs text-gray-400">→</span>
          <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 focus:ring-2 focus:ring-orange-400 outline-none" />
          <button onClick={handleDateFilter} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition">
            Apply
          </button>
          {hasActiveFilters && (
            <button onClick={handleClearFilters} className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition font-medium">
              <X size={12} /> Clear all
            </button>
          )}
        </div>

        {/* Mobile filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="pt-3 mt-3 border-t border-gray-100 space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Status</label>
                  <div className="flex gap-2 flex-wrap">
                    {['All', 'Pending', 'Delivered'].map(s => (
                      <button key={s} onClick={() => setStatusFilter(s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${statusFilter === s ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                        {s === 'Pending' ? 'Processing' : s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">From</label>
                    <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-2 py-2 text-xs outline-none focus:ring-2 focus:ring-orange-400" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">To</label>
                    <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-2 py-2 text-xs outline-none focus:ring-2 focus:ring-orange-400" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleDateFilter} className="flex-1 bg-orange-500 text-white py-2 rounded-xl text-xs font-bold hover:bg-orange-600 transition">Apply Filters</button>
                  {hasActiveFilters && (
                    <button onClick={handleClearFilters} className="px-4 py-2 border border-gray-200 rounded-xl text-xs text-gray-500 hover:bg-gray-50 transition">Clear</button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Orders list ────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center">
              <Loader2 className="w-7 h-7 text-orange-500 animate-spin" />
            </div>
            <div className="absolute -inset-1 rounded-2xl border-2 border-orange-200 animate-ping opacity-40" />
          </div>
          <p className="text-sm text-gray-400 font-medium">Loading your orders…</p>
        </div>
      ) : orders.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <Player autoplay loop src="https://assets5.lottiefiles.com/packages/lf20_qh5z2fdq.json"
            style={{ height: '240px', width: '240px', margin: '0 auto' }} />
          <h3 className="text-lg font-bold text-gray-700 mt-4">No orders found</h3>
          <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or start shopping</p>
          <button
            onClick={() => window.location.href = '/'}
            className="mt-5 inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold transition shadow-md shadow-orange-200"
          >
            Browse Products <ArrowRight size={14} />
          </button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, orderIdx) => {
            const stage     = getDeliveryStage(order);
            const styles    = stageStyles[stage.variant];
            const isExpanded = expandedOrder === order._id;
            const itemCount  = order.items.reduce((sum, i) => sum + i.quantity, 0);

            return (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: orderIdx * 0.06, duration: 0.35 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* ── Card header bar ───────────────────────────────── */}
                <div className={`px-5 py-3 flex items-center justify-between ${styles.bg} border-b ${styles.border}`}>
                  <div className="flex items-center gap-2.5">
                    <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${styles.badge}`}>
                      {stage.variant === 'processing' && <span className={`w-1.5 h-1.5 rounded-full ${styles.dot} animate-pulse`} />}
                      {stage.variant === 'transit'    && <Truck size={10} />}
                      {stage.variant === 'delivered'  && <PackageCheck size={10} />}
                      {stage.label}
                    </span>
                    <span className="text-[11px] text-gray-400 font-medium hidden sm:block">
                      Updated {new Date(order.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-700">
                      Ksh <span className="text-base text-orange-600">{order.totalAmount?.toLocaleString()}</span>
                    </span>
                    <button
                      onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                      className="w-7 h-7 rounded-lg bg-white/70 hover:bg-white flex items-center justify-center text-gray-500 hover:text-orange-500 transition border border-white"
                    >
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {/* ── Card body ─────────────────────────────────────── */}
                <div className="px-5 py-4">

                  {/* Meta row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    <div className="flex items-start gap-2">
                      <Hash size={12} className="text-gray-300 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Order ID</p>
                        <p className="text-xs font-bold text-gray-700 font-mono">{order._id.slice(0, 10).toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Truck size={12} className="text-gray-300 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Tracking</p>
                        <p className="text-xs font-bold text-gray-700 font-mono">{order.trackingNumber || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock size={12} className="text-gray-300 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Placed</p>
                        <p className="text-xs font-bold text-gray-700">{new Date(order.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>
                    {order.customerInfo?.county && (
                      <div className="flex items-start gap-2">
                        <MapPin size={12} className="text-gray-300 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Deliver to</p>
                          <p className="text-xs font-bold text-gray-700">{order.customerInfo.town}, {order.customerInfo.county}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Delivery timeline */}
                  <DeliveryTimeline currentStep={stage.step} variant={stage.variant} />

                  {/* Item preview (collapsed) */}
                  {!isExpanded && (
                    <div className="mt-4 flex items-center gap-3">
                      <div className="flex -space-x-2">
                        {order.items.slice(0, 3).map((item, i) => (
                          <div key={i} className="w-10 h-10 rounded-xl border-2 border-white bg-gray-100 overflow-hidden flex-shrink-0 shadow-sm">
                            <img src={item.images?.[0] || '/placeholder.png'} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="w-10 h-10 rounded-xl border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 flex-shrink-0">
                            +{order.items.length - 3}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-700 truncate">{order.items[0].name}{order.items.length > 1 ? ` + ${order.items.length - 1} more` : ''}</p>
                        <p className="text-xs text-gray-400">{itemCount} item{itemCount !== 1 ? 's' : ''} · Ksh {order.totalAmount?.toLocaleString()}</p>
                      </div>
                      <button
                        onClick={() => setExpandedOrder(order._id)}
                        className="ml-auto flex items-center gap-1 text-xs text-orange-500 font-semibold hover:text-orange-600 transition flex-shrink-0"
                      >
                        Details <ArrowRight size={12} />
                      </button>
                    </div>
                  )}

                  {/* Expanded items */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
                          {order.items.map((item, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 hover:bg-orange-50/50 transition-colors group"
                            >
                              <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm flex-shrink-0">
                                <img src={item.images?.[0] || '/placeholder.png'} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-800 text-sm truncate">{item.name}</p>
                                <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-sm font-bold text-gray-800">Ksh {(item.price * item.quantity).toLocaleString()}</p>
                                <p className="text-[10px] text-gray-400">@ Ksh {item.price.toLocaleString()} each</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        {/* Order total breakdown */}
                        <div className="mt-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-100 p-4">
                          <div className="flex justify-between items-center text-sm mb-2">
                            <span className="text-gray-500">Subtotal</span>
                            <span className="font-semibold text-gray-700">Ksh {(order.totalAmount - (order.deliveryFee || 0)).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm mb-3">
                            <span className="text-gray-500">Delivery fee</span>
                            <span className={`font-semibold ${order.deliveryFee === 0 ? 'text-emerald-600' : 'text-gray-700'}`}>
                              {order.deliveryFee === 0 ? 'FREE' : `Ksh ${order.deliveryFee?.toLocaleString()}`}
                            </span>
                          </div>
                          <div className="border-t border-orange-200 pt-3 flex justify-between items-center">
                            <span className="font-black text-gray-800">Total Paid</span>
                            <span className="font-black text-xl text-orange-600">Ksh {order.totalAmount?.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Buyer protection note */}
                        <div className="mt-3 flex items-center gap-2 px-3 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                          <ShieldCheck size={14} className="text-emerald-500 flex-shrink-0" />
                          <p className="text-xs text-emerald-700 font-medium">This order is covered by NovaXmax Buyer Protection. <span className="underline cursor-pointer">Learn more</span></p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Pagination ──────────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-10 gap-2">
          <button
            onClick={() => currentPage > 1 && setCurrentPage(p => p - 1)}
            disabled={currentPage === 1}
            className="px-5 py-2.5 rounded-xl border text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-orange-300"
          >
            ← Prev
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-9 h-9 rounded-xl text-sm font-bold transition ${
                  currentPage === p
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                    : 'text-gray-500 hover:bg-orange-50 hover:text-orange-600'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={() => currentPage < totalPages && setCurrentPage(p => p + 1)}
            disabled={currentPage === totalPages}
            className="px-5 py-2.5 rounded-xl border text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-orange-300"
          >
            Next →
          </button>
        </div>
      )}

      {/* ── Bottom trust strip ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400 border-t border-gray-100 pt-8"
      >
        {[
          { icon: ShieldCheck, text: '100% Secure Checkout' },
          { icon: RotateCcw,   text: 'Easy 7-Day Returns' },
          { icon: Star,        text: '4.8★ Customer Rating' },
          { icon: Truck,       text: 'Nationwide Delivery' },
        ].map(({ icon: Icon, text }, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <Icon size={13} className="text-orange-400" />
            <span className="font-medium">{text}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Delivery Timeline component ──────────────────────────────────────────────
function DeliveryTimeline({ currentStep, variant }: { currentStep: number; variant: 'processing' | 'transit' | 'delivered' }) {
  const activeColor = variant === 'delivered' ? 'bg-emerald-500' : 'bg-orange-500';
  const lineColor   = variant === 'delivered' ? 'bg-emerald-400' : 'bg-orange-400';

  return (
    <div className="relative flex items-start justify-between pt-1">
      {/* Progress line background */}
      <div className="absolute top-4 left-[5%] right-[5%] h-[2px] bg-gray-200 rounded-full" />

      {/* Active progress line */}
      <motion.div
        className={`absolute top-4 left-[5%] h-[2px] rounded-full ${lineColor}`}
        initial={{ width: '0%' }}
        animate={{ width: currentStep === 0 ? '0%' : currentStep === 1 ? '50%' : '90%' }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
      />

      {DELIVERY_STEPS.map((step, i) => {
        const isCompleted = i < currentStep;
        const isActive    = i === currentStep;
        const Icon        = step.icon;

        return (
          <div key={step.key} className="relative z-10 flex flex-col items-center flex-1 px-1">
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.12 + 0.2, type: 'spring', stiffness: 300 }}
              className={`
                w-8 h-8 rounded-xl flex items-center justify-center transition-all shadow-sm
                ${isCompleted ? `${activeColor} shadow-md` : ''}
                ${isActive    ? `${activeColor} shadow-lg ring-4 ring-orange-200 ${variant === 'delivered' ? 'ring-emerald-200' : ''}` : ''}
                ${!isCompleted && !isActive ? 'bg-gray-200' : ''}
              `}
            >
              {isActive && variant !== 'delivered' ? (
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              ) : (
                <Icon size={14} className={isCompleted || isActive ? 'text-white' : 'text-gray-400'} />
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12 + 0.35 }}
              className="text-center mt-2"
            >
              <p className={`text-[11px] font-bold leading-tight ${isCompleted || isActive ? 'text-gray-800' : 'text-gray-400'}`}>
                {step.title}
              </p>
              <p className="text-[9px] text-gray-400 mt-0.5 hidden sm:block leading-tight max-w-[80px] mx-auto">
                {step.description}
              </p>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}