'use client';

import { useEffect, useState } from 'react';
import { CldImage } from 'next-cloudinary';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import { toast } from 'react-toastify';
import { NOVAXMAX_LOGO_BASE64 } from '@/lib/logoBase'

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


export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Delivered'>('All');
  const [cityFilter, setCityFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [selectedLabelOrder, setSelectedLabelOrder] = useState<Order | null>(null);
  const [qrSrc, setQrSrc] = useState<string | null>(null);
  const [barcodeSrc, setBarcodeSrc] = useState<string | null>(null);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [downloadStep, setDownloadStep] = useState<
  'starting' | 'barcode' | 'rendering' | 'finalizing'
>('starting');

  const pageSize = 5;

  // utils/logoBase64.ts

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
      })
      .catch((err) => console.error('Error loading orders:', err))
      .finally(() => setLoading(false));
  }, []);

  const getPublicId = (url: string) => {
    const regex = /\/upload\/(?:v\d+\/)?([^\.]+)/;
    const match = url.match(regex);
    return match ? match[1] : url;
  };

const maskPhone = (phone?: string) => {
  if (!phone) return 'N/A';
  if (phone.length !== 10) return phone;
  return phone.slice(0, 4) + '***' + phone.slice(-3);
};

  // ✅ Combined filtering logic (status, city, date, search)
const filteredOrders = orders.filter((order) => {
  const orderDate = new Date(order.createdAt);

  const matchesCity =
    cityFilter === 'All' ||
    order.customerInfo.county?.toLowerCase() === cityFilter.toLowerCase();

  const matchesSearch =
    searchTerm === '' ||
    order.customerInfo.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerInfo.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerInfo.phone.includes(searchTerm);

  const matchesDate =
    (!startDate || orderDate >= new Date(startDate)) &&
    (!endDate || orderDate <= new Date(endDate));

  /**
   * ✅ STATUS FILTER MOVED TO ITEM LEVEL
   */
  const matchesItemStatus =
    statusFilter === 'All' ||
    order.items.some((item) => item.status === statusFilter);

  return matchesCity && matchesSearch && matchesDate && matchesItemStatus;
});

  const paginatedOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize);

  const generateTrackingNumber = () => {
    const randomPart = Math.floor(100000000 + Math.random() * 900000000);
    return `TRK-${randomPart}`;
  };

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
          toast.error(json.message || 'Failed to update status');
        }
      } catch (err) {
        console.error('Error marking delivery:', err);
        toast.error('Something went wrong');
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
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a5',
    });

    const pageWidth = 148; // A5 width
    let y = 6;

    /* =========================
       🟧 HEADER
    ========================= */
    pdf.setFillColor(255, 128, 0);
    pdf.roundedRect(6, y, pageWidth - 12, 14, 3, 3, 'F');

    pdf.addImage(NOVAXMAX_LOGO_BASE64, 'PNG', 9, y + 3, 14, 8);

    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    pdf.text('DELIVERY LABEL', pageWidth - 9, y + 9, { align: 'right' });

    y += 20;

    /* =========================
       👤 CUSTOMER + ORDER META
    ========================= */
    pdf.setFillColor(248, 248, 248); // light grey background
    pdf.setDrawColor(220);
    pdf.roundedRect(6, y, pageWidth - 12, 26, 3, 3, 'FD');

    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Customer', 9, y + 6);
    pdf.text('Order', pageWidth / 2 + 2, y + 6);

    pdf.setFont('helvetica', 'normal');
    pdf.text(
      `Name: ${selectedLabelOrder.customerInfo.firstName} ${selectedLabelOrder.customerInfo.lastName}`,
      9,
      y + 11
    );
    pdf.text(
      `Phone: ${selectedLabelOrder.customerInfo.phone}`,
      9,
      y + 16
    );
    pdf.text(
      `Town: ${selectedLabelOrder.customerInfo.town || 'N/A'}`,
      9,
      y + 21
    );

    pdf.text(
      `Order ID: ${selectedLabelOrder._id.slice(-6)}`,
      pageWidth / 2 + 2,
      y + 11
    );
    pdf.text(
      `Tracking: ${selectedLabelOrder.trackingNumber}`,
      pageWidth / 2 + 2,
      y + 16
    );
    pdf.text(
      `Date: ${new Date(selectedLabelOrder.createdAt).toLocaleDateString()}`,
      pageWidth / 2 + 2,
      y + 21
    );

    y += 32;

    /* =========================
       📦 ORDER ITEMS
    ========================= */
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
      styles: {
        fontSize: 7,
        cellPadding: 1.5,
        overflow: 'linebreak',
        textColor: 20,
      },
      headStyles: {
        fillColor: [255, 237, 213], // soft orange tint
        textColor: 0,
        fontStyle: 'bold',
      },
    });

    y = (pdf as any).lastAutoTable.finalY + 4;

    /* =========================
       💰 TOTAL
    ========================= */
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(0, 0, 0);
    pdf.text(
      `TOTAL: Ksh ${selectedLabelOrder.totalAmount.toLocaleString()}`,
      pageWidth - 6,
      y,
      { align: 'right' }
    );

    y += 6;

    /* =========================
       🚚 TRACKING ZONE
    ========================= */
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

/* =========================
   🧾 PROFESSIONAL FOOTER
========================= */

const pageHeight = pdf.internal.pageSize.getHeight();
const footerY = pageHeight - 48;

// Footer background
pdf.setFillColor(250, 250, 250);
pdf.setDrawColor(220);
pdf.roundedRect(6, footerY, pageWidth - 12, 42, 3, 3, 'FD');

/* -------------------------
   🚚 DELIVERY INSTRUCTIONS
------------------------- */
pdf.setFont('helvetica', 'bold');
pdf.setFontSize(8);
pdf.setTextColor(0);
pdf.text('Delivery Instructions', 9, footerY + 6);

pdf.setFont('helvetica', 'normal');
pdf.setFontSize(7);

const deliveryInstruction =
  selectedLabelOrder.customerInfo.deliveryInstructions ||
  'Handle package with care. Deliver only to the named recipient.';

pdf.text(
  pdf.splitTextToSize(deliveryInstruction, pageWidth - 20),
  9,
  footerY + 11
);

/* -------------------------
   🏢 COMPANY DETAILS
------------------------- */
pdf.setFont('helvetica', 'bold');
pdf.text('Company Information', pageWidth / 2, footerY + 6);

pdf.setFont('helvetica', 'normal');

pdf.text(
  [
    'NovaXmax Technologies Ltd',
    'Nairobi, Kenya',
    'Website: www.novaxmax.com',
    'Email: support@novaxmax.com',
    'Customer Care: +254 798 437 508',
  ],
  pageWidth / 2,
  footerY + 11
);

/* -------------------------
   ⚖ TERMS & CONDITIONS
------------------------- */
pdf.setFont('helvetica', 'bold');
pdf.text('Terms & Conditions', 9, footerY + 25);

pdf.setFont('helvetica', 'normal');
pdf.setFontSize(6.5);

const terms = [
  '• Goods must be inspected upon delivery.',
  '• NovaXmax is not liable after successful handover.',
  '• Refused deliveries may attract return charges.',
  '• Report damages within 24 hours.',
];

pdf.text(
  terms,
  9,
  footerY + 30
);

/* -------------------------
   COPYRIGHT LINE
------------------------- */
pdf.setFontSize(6);
pdf.setTextColor(120);
pdf.text(
  `© ${new Date().getFullYear()} NovaXmax Ltd`,
  pageWidth / 2,
  pageHeight - 4,
  { align: 'center' }
);

setDownloadStep('finalizing');
await new Promise(r => setTimeout(r, 500));
pdf.save(`NovaXmax_Label_${selectedLabelOrder._id.slice(-6)}.pdf`);

setTimeout(() => {
  setDownloadingPDF(false);
  setShowLabelModal(false); // ✅ auto close modal
  toast.success('Delivery label downloaded');
}, 900);
} catch (err) {
  console.error(err);
  toast.error('Failed to generate PDF');
  setDownloadingPDF(false);
  setDownloadStep('starting');
}
};

  // ✅ Extract available cities dynamically
  const cities = Array.from(new Set(orders.map((o) => o.customerInfo.county).filter(Boolean)));

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white first-letter:px-6 pt-28 pb-10">
      {/* Filters Row (non-intrusive) */}
      <div className="mb-6 flex flex-wrap gap-3 items-center">
        {/* Status Filter */}
        <div className="flex gap-2">
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

        {/* City Filter */}
        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1 text-sm"
        >
          <option value="All">All Cities</option>
          {cities.map((city) => (
            <option key={city} value={city!}>
              {city}
            </option>
          ))}
        </select>

        {/* Search Filter */}
        <input
          type="text"
          placeholder="Search name or phone"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1 text-sm"
        />

        {/* Date Range */}
        <div className="flex gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          />
        </div>
      </div>

      {/* Orders Display (untouched layout) */}
      {loading ? (
        <p>Loading orders...</p>
      ) : filteredOrders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <>
          <div className="space-y-6">
            {paginatedOrders.map((order) => {
              const visibleItems = Array.isArray(order.items)
              ? statusFilter === 'All'
              ? order.items
              : order.items.filter((item) => item.status === statusFilter)
              : [];

              return (
                <div key={order._id} className="bg-white p-4 rounded shadow border border-gray-100">
                  <div className="mb-2">
                    <h2 className="text-lg font-semibold">Order #{order._id.slice(-6)}</h2>
                    <p className="text-sm text-gray-500">Status: {order.status}</p>
                    <p className="text-sm text-gray-500">
                      Date: {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="text-sm text-gray-700">
                    Customer: {order.customerInfo.firstName} {order.customerInfo.lastName} |{' '}
                    {maskPhone(order.customerInfo.phone)}
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {visibleItems.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 border p-2 rounded">
                        {item.images?.length > 0 ? (
                          <CldImage
                            src={getPublicId(item.images[0])}
                            alt={item.name}
                            width="100"
                            height="100"
                            crop="fill"
                            className="w-44 h-44 object-cover rounded"
                          />
                        ) : (
                          <div className="w-44 h-44 bg-gray-200 text-gray-500 flex items-center justify-center rounded">
                            No image
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{item.name}</p>
                          <p className="text-sm">Qty: {item.quantity}</p>
                          <p className="text-sm">Ksh {item.price}</p>
                          <p className="text-xs text-gray-500">
                            Status:{' '}
                            <span className="font-semibold">{item.status || 'Pending'}</span>
                          </p>
                          {item.status !== 'Delivered' && (
                            <button
                              onClick={() => markItemDelivered(order._id, item.name)}
                              className="mt-2 text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                            >
                              Mark as Delivered
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex justify-between items-center">
                    <div className="font-bold text-orange-600">
                      Subtotal: Ksh{' '}
                      {visibleItems
                        .reduce((sum, item) => sum + item.price * item.quantity, 0)
                        .toLocaleString()}
                    </div>
                    <button
                      onClick={() => handleViewLabel(order)}
                      className="text-sm text-white bg-green-500 hover:bg-green-600 px-3 py-1 rounded shadow"
                    >
                      View Order Label
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="mt-8 flex justify-between items-center">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm">
              Page {page} of {Math.ceil(filteredOrders.length / pageSize)}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, Math.ceil(filteredOrders.length / pageSize)))}
              disabled={page === Math.ceil(filteredOrders.length / pageSize)}
              className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}

      {downloadingPDF && (
  <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center">
    <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center gap-5 w-[320px]">

      {/* Spinner */}
      <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>

      <h2 className="text-lg font-semibold text-gray-800">
        Preparing Delivery Label
      </h2>

      {/* Dynamic Progress */}
      <p className="text-sm text-gray-600 text-center transition-all duration-300">
        {downloadStep === 'starting' && 'Initializing label...'}
        {downloadStep === 'barcode' && 'Preparing barcode & tracking...'}
        {downloadStep === 'rendering' && 'Rendering order information...'}
        {downloadStep === 'finalizing' && 'Finalizing PDF download...'}
      </p>

      {/* Progress dots */}
      <div className="flex gap-2 mt-1">
        <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></span>
        <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce delay-150"></span>
        <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce delay-300"></span>
      </div>

    </div>
  </div>
)}

{showLabelModal && selectedLabelOrder && (
  <div className="fixed inset-0 z-[9999] bg-black bg-opacity-50 flex items-center justify-center backdrop-blur-sm transition-all">
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-xl p-6 relative overflow-hidden animate-fade-in">
      {/* Close Button */}
      <button
        className="absolute top-3 right-3 text-gray-400 hover:text-orange-500 text-xl transition"
        onClick={() => setShowLabelModal(false)}
      >
        ✕
      </button>

      {/* Company Header */}
      <div className="flex flex-col items-center border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
        <img
          src="/Logo.png"
          alt="NovaXmax Logo"
          className="h-14 object-contain mb-2 dark:invert"
        />
        <h2 className="text-xl font-semibold text-orange-600">
          NovaXmax Delivery Label
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          www.novaxmax.com | support@novaxmax.com
        </p>
      </div>

      {/* Customer Information */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-4">
        <h3 className="text-orange-600 font-semibold mb-2 text-sm uppercase">
          Customer Information
        </h3>
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 dark:text-gray-300">
          <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
            <strong>Name:</strong> {selectedLabelOrder.customerInfo.firstName}{' '}
            {selectedLabelOrder.customerInfo.lastName}
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
            <strong>Phone:</strong> {selectedLabelOrder.customerInfo.phone}
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
            <strong>County:</strong> {selectedLabelOrder.customerInfo.county || 'N/A'}
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
            <strong>Town:</strong> {selectedLabelOrder.customerInfo.town || 'N/A'}
          </div>
        </div>
      </div>

      {/* Items Section */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-4">
        <h3 className="text-orange-600 font-semibold mb-2 text-sm uppercase">
          Order Items
        </h3>
        <table className="w-full text-xs border-collapse border border-gray-200 dark:border-gray-700">
          <thead className="bg-orange-100 dark:bg-gray-800 text-orange-800 dark:text-gray-200">
            <tr>
              <th className="border px-2 py-1 text-left">Item</th>
              <th className="border px-2 py-1">Qty</th>
              <th className="border px-2 py-1">Price</th>
              <th className="border px-2 py-1">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {selectedLabelOrder.items.map((item, i) => (
              <tr key={i} className="hover:bg-orange-50 dark:hover:bg-gray-800 transition">
                <td className="border px-2 py-1">{item.name}</td>
                <td className="border px-2 py-1 text-center">{item.quantity}</td>
                <td className="border px-2 py-1 text-right">
                  Ksh {item.price.toLocaleString()}
                </td>
                <td className="border px-2 py-1 text-right">
                  Ksh {(item.price * item.quantity).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tracking Section */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-4 text-sm">
        <h3 className="text-orange-600 font-semibold mb-2 text-sm uppercase">
          Tracking Information
        </h3>
        <p><strong>Tracking Number:</strong> {selectedLabelOrder.trackingNumber}</p>
        <p><strong>Order ID:</strong> {selectedLabelOrder._id.slice(-6)}</p>
        <p><strong>Total:</strong> Ksh {selectedLabelOrder.totalAmount.toLocaleString()}</p>

        <div className="flex justify-between items-center mt-3 border-t border-gray-200 dark:border-gray-700 pt-3">
          {barcodeSrc && <img src={barcodeSrc} alt="Barcode" className="h-12" />}
          {qrSrc && <img src={qrSrc} alt="QR Code" className="h-16 w-16 rounded-md" />}
        </div>
      </div>

      {/* Footer */}
      <div className="text-right mt-4">
        <button
          onClick={handleDownloadLabelPDF}
          className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg shadow transition"
        >
          Download PDF
        </button>
      </div>

      <p className="text-center text-xs text-gray-500 mt-3">
        © {new Date().getFullYear()} NovaXmax. All rights reserved.
      </p>
    </div>
  </div>
)}

    </div>
  );
}
