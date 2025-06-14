'use client';

import { useState } from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
import { useOrders } from '@/app/hooks/useOrder';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

type OrderType = {
  _id: string;
  createdAt: string;
  paidAmount: number;
  mpesaReceiptNumber?: string;
  paidPhone?: string;
  status: string;
};


export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [sort] = useState('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);
  const { orders, totalPages, loading } = useOrders(page, sort, order);

  const toggleSortOrder = () => {
    setOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

 const generateReceipt = async (order: OrderType) => {
  const doc = new jsPDF();

  // Add header background
  doc.setFillColor(255, 204, 0);
  doc.rect(0, 0, 210, 25, 'F');

  // Company logo
  const logoUrl = '/Logo.png';
  const logo = await getImageBase64(logoUrl);
  if (logo) {
    doc.addImage(logo, 'PNG', 15, 5, 30, 15);
  }

  // Header text
  doc.setFontSize(18);
  doc.setTextColor(0);
  doc.text('Official Payment Receipt', 105, 15, { align: 'center' });

  // QR code generation
  const qrText = `Order ID: ${order._id}\nAmount: Ksh ${order.paidAmount}\nStatus: ${order.status}`;
  const qrImage = await QRCode.toDataURL(qrText);

  // Draw border box
  doc.setDrawColor(100);
  doc.setLineWidth(0.5);
  doc.rect(10, 30, 190, 150);

  // Order details
  doc.setFontSize(12);
  doc.setTextColor(50);
  doc.text(`Order ID:`, 20, 45);
  doc.setTextColor(0);
  doc.text(order._id, 60, 45);

  doc.setTextColor(50);
  doc.text(`Date:`, 20, 55);
  doc.setTextColor(0);
  doc.text(new Date(order.createdAt).toLocaleString(), 60, 55);

  doc.setTextColor(50);
  doc.text(`Amount Paid:`, 20, 65);
  doc.setTextColor(0);
  doc.text(`Ksh ${order.paidAmount.toFixed(2)}`, 60, 65);

  doc.setTextColor(50);
  doc.text(`Mpesa Receipt:`, 20, 75);
  doc.setTextColor(0);
  doc.text(order.mpesaReceiptNumber || '-', 60, 75);

  doc.setTextColor(50);
  doc.text(`Phone Number:`, 20, 85);
  doc.setTextColor(0);
  doc.text(order.paidPhone || '-', 60, 85);

  doc.setTextColor(50);
  doc.text(`Order Status:`, 20, 95);
  doc.setTextColor(0);
  doc.text(order.status.charAt(0).toUpperCase() + order.status.slice(1), 60, 95);

  // Add QR Code
  doc.setTextColor(50);
  doc.text(`Scan for Order Info`, 20, 110);
  doc.addImage(qrImage, 'PNG', 20, 115, 50, 50);

  // Footer
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text('Thank you for your purchase!', 105, 190, { align: 'center' });
  doc.text('Contact support@gmail.com for assistance.', 105, 195, { align: 'center' });

  doc.save(`receipt-${order._id}.pdf`);
};
 

  const getImageBase64 = (url: string): Promise<string | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = function () {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  };

  const filteredOrders = Array.isArray(orders)
    ? orders.filter((order) =>
        statusFilter === 'all' ? true : order.status === statusFilter
      )
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-12 h-12 border-4 border-orange-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="px-6 pt-28 pb-10">
      <h1 className="text-2xl font-bold mb-4">My Orders</h1>

      <div className="flex justify-between items-center mb-4">
        <button
          onClick={toggleSortOrder}
          className="px-3 py-1 bg-blue-500 text-white rounded"
        >
          Sort: {order.toUpperCase()}
        </button>
      </div>

      <div className="mb-4">
        <label className="mr-2 font-medium">Filter by status:</label>
        {['all', 'processing', 'delivered'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1 mr-2 rounded ${
              statusFilter === status ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {!Array.isArray(orders) || orders.length === 0 ? (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-112px)] pt-20">
          <Player
            autoplay
            loop
            src="https://assets5.lottiefiles.com/packages/lf20_qh5z2fdq.json"
            style={{ height: '300px', width: '300px' }}
          />
          <p className="mt-4 text-lg text-orange-700">No orders to display yet</p>
          <button
            onClick={() => setPage(1)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-2">Date</th>
                  <th className="p-2">Amount</th>
                  <th className="p-2">Receipt</th>
                  <th className="p-2">Phone</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="border-t">
                    <td className="p-2">{new Date(order.createdAt).toLocaleString()}</td>
                    <td className="p-2">Ksh {order.paidAmount}</td>
                    <td className="p-2">{order.mpesaReceiptNumber || '-'}</td>
                    <td className="p-2">{order.paidPhone || '-'}</td>
                    <td className="p-2 flex items-center gap-2">
                      {order.status === 'processing' && (
                        <span
                          className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping"
                          title="Processing"
                        ></span>
                      )}
                      {order.status === 'delivered' && (
                        <span
                          className="w-2.5 h-2.5 rounded-full bg-red-500"
                          title="Delivered"
                        ></span>
                      )}
                      {order.status}
                    </td>
<td className="p-2">
  <button
    onClick={() => {
      setSelectedOrder(order);
      setShowModal(true);
    }}
    className="text-green-600 hover:underline mr-2"
  >
    View
  </button>
  <button
    onClick={() => generateReceipt(order)}
    className="text-blue-500 hover:underline"
  >
    Download
  </button>
</td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
{showModal && selectedOrder && (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
    <div className="bg-white rounded-lg p-6 max-w-xl w-full relative">
      <button
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        onClick={() => setShowModal(false)}
      >
        ✕
      </button>
      <h2 className="text-xl font-bold mb-4">Receipt Preview</h2>
      <div className="text-sm space-y-2">
        <p><strong>Order ID:</strong> {selectedOrder._id}</p>
        <p><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
        <p><strong>Amount Paid:</strong> Ksh {selectedOrder.paidAmount.toFixed(2)}</p>
        <p><strong>Mpesa Receipt:</strong> {selectedOrder.mpesaReceiptNumber || '-'}</p>
        <p><strong>Phone:</strong> {selectedOrder.paidPhone || '-'}</p>
        <p><strong>Status:</strong> {selectedOrder.status}</p>
      </div>
      <div className="mt-4 text-right">
        <button
          onClick={() => {
            generateReceipt(selectedOrder);
            setShowModal(false);
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Download PDF
        </button>
      </div>
    </div>
  </div>
)}

          {filteredOrders.length > 0 && (
            <div className="mt-4 text-right font-semibold">
              Total Spent: Ksh{' '}
              {filteredOrders.reduce((sum, order) => sum + order.paidAmount, 0)}
            </div>
          )}
        </>
      )}

      <div className="flex justify-between items-center mt-4">
        <button
          disabled={page <= 1}
          onClick={() => setPage((prev) => prev - 1)}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage((prev) => prev + 1)}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
