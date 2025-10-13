'use client';

import { useEffect, useState } from 'react';
import { CldImage } from 'next-cloudinary';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';

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
  trackingNumber?: string;
  createdAt: string;
}

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Delivered'>('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [selectedLabelOrder, setSelectedLabelOrder] = useState<Order | null>(null);
  const [qrSrc, setQrSrc] = useState<string | null>(null);
  const [barcodeSrc, setBarcodeSrc] = useState<string | null>(null);

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
      })
      .catch((err) => console.error('Error loading orders:', err))
      .finally(() => setLoading(false));
  }, []);

  const getPublicId = (url: string) => {
    const regex = /\/upload\/(?:v\d+\/)?([^\.]+)/;
    const match = url.match(regex);
    return match ? match[1] : url;
  };

  const maskPhone = (phone: string) => {
    if (phone.length !== 10) return phone;
    return phone.slice(0, 4) + '***' + phone.slice(-3);
  };

  const filteredItems = (items: OrderItem[]) =>
    statusFilter === 'All' ? items : items.filter((item) => item.status === statusFilter);

  const paginatedOrders = orders.slice((page - 1) * pageSize, page * pageSize);

  // Generate tracking number format
  const generateTrackingNumber = (orderId: string) => {
    const randomPart = Math.floor(100000000 + Math.random() * 900000000);
    return `TRK-${randomPart}`;
  };

  // 🔸 Persist and generate tracking number if missing
  const getOrCreateTrackingNumber = async (order: Order) => {
    if (order.trackingNumber) return order.trackingNumber;

    const newTracking = generateTrackingNumber(order._id);

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

  // Open label modal
  const handleViewLabel = async (order: Order) => {
    const trackingNumber = await getOrCreateTrackingNumber(order);
    const qrData = await QRCode.toDataURL(`https://novaxpress.com/track/${trackingNumber}`);

    const canvas = document.createElement('canvas');
    JsBarcode(canvas, trackingNumber, { format: 'CODE128', width: 2, height: 50 });
    const barcodeData = canvas.toDataURL('image/png');

    setQrSrc(qrData);
    setBarcodeSrc(barcodeData);
    setSelectedLabelOrder({ ...order, trackingNumber });
    setShowLabelModal(true);
  };

  // PDF download
  const handleDownloadLabelPDF = () => {
    if (!selectedLabelOrder || !qrSrc || !barcodeSrc) return;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a6' });

    pdf.setFontSize(14);
    pdf.text('Delivery Label', 15, 15);

    pdf.setFontSize(10);
    pdf.text(`Tracking: ${selectedLabelOrder.trackingNumber}`, 15, 25);
    pdf.text(`Order ID: ${selectedLabelOrder._id.slice(-6)}`, 15, 31);
    pdf.text(`Customer: ${selectedLabelOrder.customerInfo.firstName} ${selectedLabelOrder.customerInfo.lastName}`, 15, 37);
    pdf.text(`Phone: ${selectedLabelOrder.customerInfo.phone}`, 15, 43);
    pdf.text(`City: ${selectedLabelOrder.customerInfo.city || 'N/A'}`, 15, 49);
    pdf.text(`Address: ${selectedLabelOrder.customerInfo.address || 'N/A'}`, 15, 55);
    pdf.text(`Order Total: Ksh ${selectedLabelOrder.totalAmount}`, 15, 61);

    pdf.addImage(barcodeSrc, 'PNG', 15, 67, 70, 15);
    pdf.addImage(qrSrc, 'PNG', 90, 15, 30, 30);

    pdf.save(`Label_${selectedLabelOrder._id.slice(-6)}.pdf`);
  };

  return (
    <div className="md:ml-64 px-6 pt-28 pb-10">
      <h1 className="text-2xl font-bold text-orange-600 mb-4">Seller Orders</h1>

      <div className="mb-4 flex gap-2">
        {['All', 'Pending', 'Delivered'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status as any)}
            className={`px-3 py-1 rounded ${statusFilter === status ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}
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

      {/* Label Modal */}
      {showLabelModal && selectedLabelOrder && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative">
            <button
              className="absolute top-2 right-3 text-gray-500 text-lg"
              onClick={() => setShowLabelModal(false)}
            >
              ✕
            </button>

            <h2 className="text-lg font-semibold mb-3 text-orange-600">Order Label</h2>
            <div className="border p-4 rounded space-y-2 text-sm text-gray-700">
              <p><strong>Tracking:</strong> {selectedLabelOrder.trackingNumber}</p>
              <p><strong>Order ID:</strong> {selectedLabelOrder._id.slice(-6)}</p>
              <p><strong>Customer:</strong> {selectedLabelOrder.customerInfo.firstName} {selectedLabelOrder.customerInfo.lastName}</p>
              <p><strong>Phone:</strong> {selectedLabelOrder.customerInfo.phone}</p>
              <p><strong>Address:</strong> {selectedLabelOrder.customerInfo.address || 'N/A'}</p>
              <p><strong>City:</strong> {selectedLabelOrder.customerInfo.city || 'N/A'}</p>
              <p><strong>Total:</strong> Ksh {selectedLabelOrder.totalAmount}</p>

              <div className="flex justify-between items-center mt-4">
                {barcodeSrc && <img src={barcodeSrc} alt="Barcode" className="h-12" />}
                {qrSrc && <img src={qrSrc} alt="QR" className="h-20 w-20" />}
              </div>
            </div>

            <div className="text-right mt-4">
              <button
                onClick={handleDownloadLabelPDF}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
