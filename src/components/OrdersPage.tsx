'use client';

import { useState, useEffect } from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
import { useOrders } from '@/app/hooks/useOrder';
import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import QRCode from 'qrcode';
import { OrderType } from '@/app/types/order';

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [sort] = useState('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState('all');
  const [userId, setUserId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);

  useEffect(() => {
    const storedId = localStorage.getItem('userId');
    setUserId(storedId);
  }, []);

  const { orders, totalPages, loading } = useOrders(page, sort, order, userId, statusFilter);

  const cancelOrder = async (orderId: string) => {
    const res = await fetch(`/api/orders/cancel/${orderId}`, { method: 'PATCH' });
    if (res.ok) {
      alert('Order cancelled successfully');
      setShowModal(false);
    } else {
      alert('Failed to cancel the order');
    }
  };

  const generateReceipt = async (order: OrderType) => {
    const doc = new jsPDF();
    doc.setFillColor(255, 204, 0);
    doc.rect(0, 0, 210, 25, 'F');

    const logoUrl = '/Logo.png';
    const logo = await getImageBase64(logoUrl);
    if (logo) {
      doc.addImage(logo, 'PNG', 15, 5, 30, 15);
    }

    doc.setFontSize(18);
    doc.setTextColor(0);
    doc.text('Nova Official Payment Receipt', 105, 15, { align: 'center' });

    const qrText = `Order ID: ${order._id}\nAmount: Ksh ${order.paymentInfo?.amount}\nStatus: ${order.status}`;
    const qrImage = await QRCode.toDataURL(qrText);

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Order ID: ${order._id}`, 10, 35);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`, 10, 42);
    doc.text(`Amount: Ksh ${order.paymentInfo?.amount?.toFixed(2) || '0.00'}`, 10, 49);
    doc.text(`Receipt: ${order.paymentInfo?.receipt || '-'}`, 10, 56);
    doc.text(`Phone: ${order.paymentInfo?.phone || '-'}`, 10, 63);
    doc.text(`Status: ${order.status}`, 10, 70);

    // Items table
    if (order.items?.length) {
      doc.text('Items:', 10, 80);
      const bodyData = await Promise.all(
        order.items.map(async (item) => [
          await getImageBase64(item.image),
          item.name,
          `${item.quantity} x ${item.price}`,
          `Ksh ${(item.quantity * item.price).toFixed(2)}`,
        ])
      );

      autoTable(doc, {
        startY: 85,
        head: [['Image', 'Item', 'Qty x Price', 'Subtotal']],
        body: bodyData.map(([img, name, qtyPrice, subtotal]) => [
          {
            content: '',
            styles: { cellWidth: 20, minCellHeight: 15 },
            didDrawCell: (data: any) => {
              if (img) {
                doc.addImage(img, 'PNG', data.cell.x + 1, data.cell.y + 1, 18, 13);
              }
            },
          },
          name,
          qtyPrice,
          subtotal,
        ]),
        styles: { fontSize: 10 },
        headStyles: { fillColor: [255, 204, 0] },
      });
    }

    doc.addImage(qrImage, 'PNG', 150, 35, 40, 40);

    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text('Thank you for your purchase!', 105, 280, { align: 'center' });
    doc.text('Contact info@Nova.co.ke for assistance.', 105, 285, { align: 'center' });

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-orange-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="px-6 pt-28 pb-10">
      <h1 className="text-2xl font-bold mb-4">My Orders</h1>

      <div className="mb-4 flex items-center justify-between">
        <div>
          <span className="mr-2">Filter:</span>
          {['all', 'Pending', 'Paid', 'Delivered', 'Cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 mr-2 rounded ${
                statusFilter === status ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        <span className="text-sm text-gray-600">Sort by {sort} ({order})</span>
      </div>

      {!orders || orders.length === 0 ? (
        <div className="flex flex-col items-center pt-20">
          <Player
            autoplay
            loop
            src="https://assets5.lottiefiles.com/packages/lf20_qh5z2fdq.json"
            style={{ height: '300px', width: '300px' }}
          />
          <p className="mt-4 text-lg text-orange-700">No orders to display yet</p>
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
                {orders.map((order: OrderType) => (
                  <tr key={order._id} className="border-t">
                    <td className="p-2">{new Date(order.createdAt).toLocaleString()}</td>
                    <td className="p-2">Ksh {order.paymentInfo?.amount ?? 0}</td>
                    <td className="p-2">{order.paymentInfo?.receipt ?? '-'}</td>
                    <td className="p-2">{order.paymentInfo?.phone ?? '-'}</td>
                    <td className="p-2">{order.status}</td>
                    <td className="p-2 space-x-2">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowModal(true);
                        }}
                        className="text-green-600 hover:underline"
                      >
                        View
                      </button>
                      <button
                        onClick={() => generateReceipt(order)}
                        className="text-blue-600 hover:underline"
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
              <div className="bg-white p-6 rounded shadow max-w-md w-full relative">
                <button onClick={() => setShowModal(false)} className="absolute top-2 right-2 text-gray-600">
                  ✕
                </button>
                <h2 className="text-lg font-semibold mb-2">Order Preview</h2>
                <p><strong>ID:</strong> {selectedOrder._id}</p>
                <p><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                <p><strong>Amount:</strong> Ksh {selectedOrder.paymentInfo?.amount?.toFixed(2)}</p>
                <p><strong>Receipt:</strong> {selectedOrder.paymentInfo?.receipt || '-'}</p>
                <p><strong>Phone:</strong> {selectedOrder.paymentInfo?.phone || '-'}</p>
                <p><strong>Status:</strong> {selectedOrder.status}</p>

                {selectedOrder.items?.length && (
                  <div className="mt-4">
                    <p className="font-semibold">Items:</p>
                    <ul className="list-disc pl-5 text-sm">
                      {selectedOrder.items.map((item, index) => (
                        <li key={index}>
                          {item.name} × {item.quantity} - Ksh {item.price}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-4 text-right space-x-2">
                  {selectedOrder.status === 'Pending' && (
                    <button
                      onClick={() => cancelOrder(selectedOrder._id)}
                      className="px-4 py-2 bg-red-500 text-white rounded"
                    >
                      Cancel Order
                    </button>
                  )}
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

          <div className="mt-6 flex justify-between">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
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
