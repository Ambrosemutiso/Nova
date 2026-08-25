'use client';

import { useEffect, useState } from 'react';
import { CldImage } from 'next-cloudinary';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import { toast } from 'react-toastify';
import { NOVAXMAX_LOGO_BASE64 } from '@/lib/logoBase';
import {
  Search, Calendar, MapPin, Package, CheckCircle2, Clock,
  X, Download, QrCode, Loader2, ChevronLeft, ChevronRight,
  TrendingUp, PackageCheck, SlidersHorizontal, ImageOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  fulfillmentMode: string;
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
    town?: string;
    county?: string;
    deliveryInstructions?: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: string;
  trackingNumber?: string;
  createdAt: string;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  Pending:   { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-500' },
  Delivered: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
};

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Delivered'>('All');
  const [cityFilter, setCityFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [selectedLabelOrder, setSelectedLabelOrder] = useState<Order | null>(null);
  const [qrSrc, setQrSrc] = useState<string | null>(null);
  const [barcodeSrc, setBarcodeSrc] = useState<string | null>(null);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [downloadStep, setDownloadStep] = useState<'starting' | 'barcode' | 'rendering' | 'finalizing'>('starting');
  const [markingItem, setMarkingItem] = useState<string | null>(null);

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
      .then((data) => setOrders(data.orders || []))
      .catch((err) => console.error('Error loading orders:', err))
      .finally(() => setLoading(false));
  }, []);

  const getPublicId = (url: string) => {
    const match = url.match(/\/upload\/(?:v\d+\/)?([^.]+)/);
    return match ? match[1] : url;
  };

  const maskPhone = (phone?: string) => {
    if (!phone) return 'N/A';
    if (phone.length !== 10) return phone;
    return phone.slice(0, 4) + '***' + phone.slice(-3);
  };

  // ── Filtering (unchanged logic) ─────────────────────────────────────────────
  const filteredOrders = orders.filter((order) => {
    const orderDate = new Date(order.createdAt);
    const matchesCity = cityFilter === 'All' || order.customerInfo.county?.toLowerCase() === cityFilter.toLowerCase();
    const matchesSearch = searchTerm === '' ||
      order.customerInfo.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerInfo.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerInfo.phone.includes(searchTerm);
    const matchesDate = (!startDate || orderDate >= new Date(startDate)) && (!endDate || orderDate <= new Date(endDate));
    const matchesItemStatus = statusFilter === 'All' || order.items.some((item) => item.status === statusFilter);
    return matchesCity && matchesSearch && matchesDate && matchesItemStatus;
  });

  const paginatedOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize);
  const totalFilteredPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));

  // ── Stats ────────────────────────────────────────────────────────────────────
  const allItems = orders.flatMap(o => o.items);
  const pendingCount = allItems.filter(i => (i.status || 'Pending') === 'Pending').length;
  const deliveredCount = allItems.filter(i => i.status === 'Delivered').length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  const generateTrackingNumber = () => `TRK-${Math.floor(100000000 + Math.random() * 900000000)}`;

  const getOrCreateTrackingNumber = async (order: Order) => {
    if (order.trackingNumber) return order.trackingNumber;
    const newTracking = generateTrackingNumber();
    try {
      await fetch('/api/seller/orders/tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order._id, trackingNumber: newTracking }),
      });
    } catch (error) {
      console.error('Error saving tracking number:', error);
    }
    return newTracking;
  };

  const markItemDelivered = async (orderId: string, itemName: string) => {
    setMarkingItem(`${orderId}-${itemName}`);
    try {
      const res = await fetch('/api/logistics/update-item-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, itemName, newStatus: 'Delivered' }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success('Item marked as delivered');
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId
              ? { ...order, items: order.items.map((item) => item.name === itemName ? { ...item, status: 'Delivered' } : item) }
              : order
          )
        );
      } else {
        toast.error(json.message || 'Failed to update status');
      }
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setMarkingItem(null);
    }
  };

  const handleViewLabel = async (order: Order) => {
    const trackingNumber = await getOrCreateTrackingNumber(order);
    const qrData = await QRCode.toDataURL(`https://novaxmax.com/orders?tracking=${trackingNumber}`);
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, trackingNumber, { format: 'CODE128', width: 2, height: 50 });
    const barcodeData = canvas.toDataURL('image/png');
    setQrSrc(qrData);
    setBarcodeSrc(barcodeData);
    setSelectedLabelOrder({ ...order, trackingNumber });
    setShowLabelModal(true);
  };

  const handleDownloadLabelPDF = async () => {
    if (!selectedLabelOrder || !qrSrc || !barcodeSrc) {
      toast.error('Label data not ready');
      return;
    }
    setDownloadingPDF(true);
    setDownloadStep('starting');
    await new Promise(r => setTimeout(r, 300));

    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });
      const pageWidth = 148;
      let y = 6;

      pdf.setFillColor(255, 128, 0);
      pdf.roundedRect(6, y, pageWidth - 12, 14, 3, 3, 'F');
      pdf.addImage(NOVAXMAX_LOGO_BASE64, 'PNG', 9, y + 3, 14, 8);
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(13);
      pdf.text('DELIVERY LABEL', pageWidth - 9, y + 9, { align: 'right' });
      y += 20;

      pdf.setFillColor(248, 248, 248);
      pdf.setDrawColor(220);
      pdf.roundedRect(6, y, pageWidth - 12, 26, 3, 3, 'FD');
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Customer', 9, y + 6);
      pdf.text('Order', pageWidth / 2 + 2, y + 6);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Name: ${selectedLabelOrder.customerInfo.firstName} ${selectedLabelOrder.customerInfo.lastName}`, 9, y + 11);
      pdf.text(`Phone: ${selectedLabelOrder.customerInfo.phone}`, 9, y + 16);
      pdf.text(`Town: ${selectedLabelOrder.customerInfo.town || 'N/A'}`, 9, y + 21);
      pdf.text(`Order ID: ${selectedLabelOrder._id.slice(-6)}`, pageWidth / 2 + 2, y + 11);
      pdf.text(`Tracking: ${selectedLabelOrder.trackingNumber}`, pageWidth / 2 + 2, y + 16);
      pdf.text(`Date: ${new Date(selectedLabelOrder.createdAt).toLocaleDateString()}`, pageWidth / 2 + 2, y + 21);
      y += 32;

      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.text('Order Items', 6, y);
      y += 3;

      setDownloadStep('rendering');
      await new Promise(r => setTimeout(r, 400));

      autoTable(pdf, {
        startY: y,
        margin: { left: 6, right: 6 },
        head: [['Item', 'Qty', 'Subtotal']],
        body: selectedLabelOrder.items.map(item => [
          item.name.length > 40 ? item.name.slice(0, 40) + '…' : item.name,
          item.quantity.toString(),
          `Ksh ${(item.price * item.quantity).toLocaleString()}`,
        ]),
        theme: 'grid',
        styles: { fontSize: 7, cellPadding: 1.5, overflow: 'linebreak', textColor: 20 },
        headStyles: { fillColor: [255, 237, 213], textColor: 0, fontStyle: 'bold' },
      });

      y = (pdf as any).lastAutoTable.finalY + 4;

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`TOTAL: Ksh ${selectedLabelOrder.totalAmount.toLocaleString()}`, pageWidth - 6, y, { align: 'right' });
      y += 6;

      pdf.setFillColor(245, 247, 250);
      pdf.roundedRect(6, y, pageWidth - 12, 32, 3, 3, 'F');
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Tracking Number', 9, y + 6);
      pdf.setFont('helvetica', 'bold');
      pdf.text(selectedLabelOrder.trackingNumber!, 9, y + 11);

      setDownloadStep('barcode');
      await new Promise(r => setTimeout(r, 400));

      pdf.addImage(barcodeSrc, 'PNG', 9, y + 15, 70, 10);
      pdf.addImage(qrSrc, 'PNG', pageWidth - 30, y + 12, 18, 18);
      y += 36;

      const pageHeight = pdf.internal.pageSize.getHeight();
      const footerY = pageHeight - 48;

      pdf.setFillColor(250, 250, 250);
      pdf.setDrawColor(220);
      pdf.roundedRect(6, footerY, pageWidth - 12, 42, 3, 3, 'FD');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.setTextColor(0);
      pdf.text('Delivery Instructions', 9, footerY + 6);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      const deliveryInstruction = selectedLabelOrder.customerInfo.deliveryInstructions || 'Handle package with care. Deliver only to the named recipient.';
      pdf.text(pdf.splitTextToSize(deliveryInstruction, pageWidth - 20), 9, footerY + 11);

      pdf.setFont('helvetica', 'bold');
      pdf.text('Company Information', pageWidth / 2, footerY + 6);
      pdf.setFont('helvetica', 'normal');
      pdf.text([
        'NovaXmax Technologies Ltd', 'Nairobi, Kenya', 'Website: www.novaxmax.com',
        'Email: support@novaxmax.com', 'Customer Care: +254 798 437 508',
      ], pageWidth / 2, footerY + 11);

      pdf.setFont('helvetica', 'bold');
      pdf.text('Terms & Conditions', 9, footerY + 25);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6.5);
      pdf.text([
        '• Goods must be inspected upon delivery.',
        '• NovaXmax is not liable after successful handover.',
        '• Refused deliveries may attract return charges.',
        '• Report damages within 24 hours.',
      ], 9, footerY + 30);

      pdf.setFontSize(6);
      pdf.setTextColor(120);
      pdf.text(`© ${new Date().getFullYear()} NovaXmax Ltd`, pageWidth / 2, pageHeight - 4, { align: 'center' });

      setDownloadStep('finalizing');
      await new Promise(r => setTimeout(r, 500));
      pdf.save(`NovaXmax_Label_${selectedLabelOrder._id.slice(-6)}.pdf`);

      setTimeout(() => {
        setDownloadingPDF(false);
        setShowLabelModal(false);
        toast.success('Delivery label downloaded');
      }, 900);
    } catch (err) {
      toast.error('Failed to generate PDF');
      setDownloadingPDF(false);
      setDownloadStep('starting');
    }
  };

  const cities = Array.from(new Set(orders.map((o) => o.customerInfo.county).filter(Boolean)));
  const activeFilterCount = [cityFilter !== 'All', !!searchTerm, !!startDate, !!endDate].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4">

        {/* Page header */}
        <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
          <div>
            <p className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.15em] mb-1">Seller Hub</p>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none">
              Orders<span className="text-orange-500">.</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1.5">
              {loading ? 'Loading…' : `${filteredOrders.length} order${filteredOrders.length !== 1 ? 's' : ''} found`}
            </p>
          </div>
        </div>

        {/* Stats strip */}
        {!loading && orders.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Pending Items',   value: pendingCount,   icon: Clock,        color: 'from-amber-500 to-orange-500' },
              { label: 'Delivered Items', value: deliveredCount, icon: PackageCheck, color: 'from-emerald-500 to-teal-500' },
              { label: 'Total Revenue',   value: `Ksh ${(totalRevenue/1000).toFixed(1)}k`, icon: TrendingUp, color: 'from-blue-500 to-indigo-500' },
            ].map(({ label, value, icon: Icon, color }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3"
              >
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={15} className="text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">{label}</p>
                  <p className="text-lg font-black text-gray-800 leading-tight">{value}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Filter bar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex gap-1.5">
              {(['All', 'Pending', 'Delivered'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    statusFilter === status
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-600'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <div className="relative flex-1 min-w-[180px]">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search name or phone…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all"
              />
            </div>

            <button
              onClick={() => setShowFilters(p => !p)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                showFilters || activeFilterCount > 0 ? 'bg-orange-50 text-orange-600 border border-orange-200' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <SlidersHorizontal size={12} /> Filters
              {activeFilterCount > 0 && (
                <span className="bg-orange-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{activeFilterCount}</span>
              )}
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-100">
                  <div className="relative">
                    <MapPin size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                      value={cityFilter}
                      onChange={(e) => setCityFilter(e.target.value)}
                      className="appearance-none bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-3 py-2 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400/30 cursor-pointer"
                    >
                      <option value="All">All Cities</option>
                      {cities.map((city) => <option key={city} value={city!}>{city}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={12} className="text-gray-400" />
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400/30" />
                    <span className="text-xs text-gray-400">to</span>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400/30" />
                  </div>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={() => { setCityFilter('All'); setSearchTerm(''); setStartDate(''); setEndDate(''); }}
                      className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X size={11} /> Clear
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Orders list */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center">
              <Loader2 size={20} className="text-orange-500 animate-spin" />
            </div>
            <p className="text-sm text-gray-400">Loading orders…</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Package size={24} className="text-gray-300" />
            </div>
            <h3 className="text-base font-bold text-gray-600 mb-1">No orders found</h3>
            <p className="text-sm text-gray-400">Try adjusting your filters.</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {paginatedOrders.map((order, orderIdx) => {
                const visibleItems = Array.isArray(order.items)
                  ? statusFilter === 'All' ? order.items : order.items.filter((item) => item.status === statusFilter)
                  : [];
                const subtotal = visibleItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
                const overallStatus = order.items.every(i => i.status === 'Delivered') ? 'Delivered' : 'Pending';
                const style = STATUS_STYLES[overallStatus];

                return (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: orderIdx * 0.05 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                  >
                    <div className={`flex items-center justify-between px-5 py-3 ${style.bg} border-b border-gray-100`}>
                      <div className="flex items-center gap-3">
                        <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${style.bg} ${style.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                          {overallStatus}
                        </span>
                        <p className="text-sm font-bold text-gray-700">Order #{order._id.slice(-6)}</p>
                        <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <button
                        onClick={() => handleViewLabel(order)}
                        className="flex items-center gap-1.5 text-xs font-bold text-white bg-gray-900 hover:bg-gray-800 px-3 py-1.5 rounded-full transition-colors"
                      >
                        <QrCode size={12} /> Label
                      </button>
                    </div>

                    <div className="px-5 py-3 flex items-center gap-2 text-xs text-gray-500 border-b border-gray-50">
                      <span className="font-semibold text-gray-700">{order.customerInfo.firstName} {order.customerInfo.lastName}</span>
                      <span className="text-gray-300">·</span>
                      <span>{maskPhone(order.customerInfo.phone)}</span>
                      {order.customerInfo.county && (
                        <>
                          <span className="text-gray-300">·</span>
                          <span className="flex items-center gap-1"><MapPin size={10} />{order.customerInfo.town ? `${order.customerInfo.town}, ` : ''}{order.customerInfo.county}</span>
                        </>
                      )}
                    </div>

                    <div className="px-5 py-4 space-y-3">
                      {visibleItems.map((item, i) => {
                        const itemKey = `${order._id}-${item.name}`;
                        const isMarking = markingItem === itemKey;
                        return (
                          <div key={i} className="flex items-center gap-3 bg-gray-50 hover:bg-orange-50/40 rounded-xl p-3 transition-colors">
                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-gray-100 flex-shrink-0">
                              {item.images?.length > 0 ? (
                                <CldImage src={getPublicId(item.images[0])} alt={item.name} width="100" height="100" crop="fill" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center"><ImageOff size={16} className="text-gray-300" /></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                              <p className="text-xs text-gray-500 mt-0.5">Qty {item.quantity} · Ksh {item.price.toLocaleString()}</p>
                              <span className={`inline-flex items-center gap-1 mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                item.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                {item.status === 'Delivered' ? <CheckCircle2 size={9} /> : <Clock size={9} />}
                                {item.status || 'Pending'}
                              </span>
                            </div>
                            {item.status !== 'Delivered' && (
                              <button
                                onClick={() => markItemDelivered(order._id, item.name)}
                                disabled={isMarking}
                                className="flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 px-3 py-2 rounded-xl transition-colors disabled:opacity-60 flex-shrink-0"
                              >
                                {isMarking ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                                {isMarking ? '...' : 'Deliver'}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="px-5 py-3 bg-gray-50/60 border-t border-gray-100 flex justify-between items-center">
                      <span className="text-xs text-gray-400 font-medium">Subtotal</span>
                      <span className="font-black text-orange-600">Ksh {subtotal.toLocaleString()}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:border-orange-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <span className="text-xs text-gray-500 font-medium px-2">Page {page} of {totalFilteredPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalFilteredPages))}
                disabled={page === totalFilteredPages}
                className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:border-orange-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </>
        )}
      </div>

      {/* PDF generation overlay */}
      <AnimatePresence>
        {downloadingPDF && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4 w-[300px]"
            >
              <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center">
                <Loader2 size={20} className="text-orange-500 animate-spin" />
              </div>
              <h2 className="text-sm font-bold text-gray-800">Preparing Delivery Label</h2>
              <p className="text-xs text-gray-500 text-center">
                {downloadStep === 'starting' && 'Initializing label…'}
                {downloadStep === 'barcode' && 'Preparing barcode & tracking…'}
                {downloadStep === 'rendering' && 'Rendering order information…'}
                {downloadStep === 'finalizing' && 'Finalizing PDF download…'}
              </p>
              <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-orange-400 rounded-full"
                  animate={{
                    width: downloadStep === 'starting' ? '20%' : downloadStep === 'rendering' ? '55%' : downloadStep === 'barcode' ? '80%' : '100%',
                  }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Label modal */}
      <AnimatePresence>
        {showLabelModal && selectedLabelOrder && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/55 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowLabelModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 12 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="relative bg-gradient-to-br from-orange-500 to-amber-500 px-6 pt-6 pb-5 text-center">
                <button
                  onClick={() => setShowLabelModal(false)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                >
                  <X size={15} />
                </button>
                <img src="/Logo.png" alt="NovaXmax" className="h-10 object-contain mx-auto mb-2 brightness-0 invert" />
                <h2 className="text-lg font-black text-white">Delivery Label</h2>
                <p className="text-xs text-orange-100 mt-0.5">Order #{selectedLabelOrder._id.slice(-6)}</p>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Customer Information</p>
                  <div className="grid grid-cols-2 gap-2.5 text-sm">
                    <div><p className="text-[10px] text-gray-400">Name</p><p className="font-semibold text-gray-800">{selectedLabelOrder.customerInfo.firstName} {selectedLabelOrder.customerInfo.lastName}</p></div>
                    <div><p className="text-[10px] text-gray-400">Phone</p><p className="font-semibold text-gray-800">{selectedLabelOrder.customerInfo.phone}</p></div>
                    <div><p className="text-[10px] text-gray-400">County</p><p className="font-semibold text-gray-800">{selectedLabelOrder.customerInfo.county || 'N/A'}</p></div>
                    <div><p className="text-[10px] text-gray-400">Town</p><p className="font-semibold text-gray-800">{selectedLabelOrder.customerInfo.town || 'N/A'}</p></div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Order Items</p>
                  <div className="space-y-2">
                    {selectedLabelOrder.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-xs bg-white rounded-xl px-3 py-2">
                        <span className="font-medium text-gray-700 truncate flex-1">{item.name}</span>
                        <span className="text-gray-400 mx-2">×{item.quantity}</span>
                        <span className="font-bold text-gray-800">Ksh {(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Tracking Information</p>
                  <p className="text-sm font-mono font-bold text-gray-800 mb-1">{selectedLabelOrder.trackingNumber}</p>
                  <p className="text-sm font-black text-orange-600">Total: Ksh {selectedLabelOrder.totalAmount.toLocaleString()}</p>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
                    {barcodeSrc && <img src={barcodeSrc} alt="Barcode" className="h-10" />}
                    {qrSrc && <img src={qrSrc} alt="QR Code" className="h-14 w-14 rounded-lg" />}
                  </div>
                </div>

                <button
                  onClick={handleDownloadLabelPDF}
                  className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-2xl transition-colors shadow-md shadow-orange-200"
                >
                  <Download size={15} /> Download PDF Label
                </button>

                <p className="text-center text-[11px] text-gray-400">© {new Date().getFullYear()} NovaXmax. All rights reserved.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}