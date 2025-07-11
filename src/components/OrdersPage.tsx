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
  const order: 'asc' | 'desc' = 'desc';
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

  const getImageBase64 = (url: string): Promise<string | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = function () {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL('image/png');
          resolve(dataUrl);
        } catch (error) {
          console.error('Error converting image to base64:', error);
          resolve(null);
        }
      };
      img.onerror = (err) => {
        console.error('Failed to load image:', url, err);
        resolve(null);
      };
      const transformedUrl = url.includes('/upload/') ? url.replace('/upload/', '/upload/w_100/') : url;
      img.src = transformedUrl;
    });
  };

  const generateReceipt = async (order: OrderType, adminName = "Cate Ruguru, senior sales consultant") => {
    const doc = new jsPDF();

    doc.setFillColor(255, 204, 0);
    doc.rect(0, 0, 210, 25, 'F');
    const logoUrl = '/Logo.png';
    const logo = await getImageBase64(logoUrl);
    if (logo) doc.addImage(logo, 'PNG', 10, 5, 25, 15);

    doc.setFontSize(18);
    doc.setTextColor(0);
    doc.text('Nova Official Payment Receipt', 105, 15, { align: 'center' });

    let y = 35;
    doc.setFontSize(12);
    doc.text(`Order ID: ${order._id}`, 10, y);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`, 10, y += 7);
    doc.text(`Amount: Ksh ${order.paymentInfo?.amount?.toFixed(2) || '0.00'}`, 10, y += 7);
    doc.text(`Receipt: ${order.paymentInfo?.receipt || '-'}`, 10, y += 7);
    doc.text(`Phone: ${order.paymentInfo?.phone || '-'}`, 10, y += 7);
    doc.text(`Status: ${order.status}`, 10, y += 7);

    const qrText = `Order ID: ${order._id}\nAmount: Ksh ${order.paymentInfo?.amount}\nStatus: ${order.status}`;
    const qrImage = await QRCode.toDataURL(qrText);
    doc.addImage(qrImage, 'PNG', 170, 35, 30, 30);

    if (order.items?.length) {
      y += 15;
      doc.setFontSize(13);
      doc.text('Items:', 10, y);
      y += 5;

      const bodyData = await Promise.all(order.items.map(async item => {
        const image = await getImageBase64(item.image);
        const name = item.name ?? 'Unnamed Item';
        const qty = item.quantity ?? 0;
        const price = item.price ?? 0;
        const subtotal = qty * price;
        return [image, name, `${qty} x ${price.toFixed(2)}`, `Ksh ${subtotal.toFixed(2)}`];
      }));

      autoTable(doc, {
        startY: y,
        head: [['Image', 'Item', 'Qty x Price', 'Subtotal']],
        body: bodyData.map(([img, name, qtyPrice, subtotal]) => [
          {
            content: '',
            styles: { cellWidth: 20, minCellHeight: 20 },
            didDrawCell: (data: any) => {
              if (img) {
                doc.addImage(img, 'PNG', data.cell.x + 1, data.cell.y + 1, 18, 15);
              }
            }
          },
          name,
          qtyPrice,
          subtotal
        ]),
        styles: { fontSize: 10 },
        headStyles: { fillColor: [255, 204, 0] },
        theme: 'grid',
      });
    }

    const finalY = (doc as any).lastAutoTable?.finalY || y + 30;
    const delivery = order.deliveryFee ?? 0;
    const total = (order.items || []).reduce((acc, item) => acc + (item.quantity ?? 0) * (item.price ?? 0), 0) + delivery;

    doc.setFontSize(12);
    doc.text(`Delivery Fee: Ksh ${delivery.toFixed(2)}`, 10, finalY + 10);
    doc.text(`Total Amount: Ksh ${total.toFixed(2)}`, 10, finalY + 17);

    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text('Thank you for your purchase!', 105, 280, { align: 'center' });
    doc.text('Contact: info@Nova.co.ke | Location: Ronald Ngala Street, NRG Plaza', 105, 285, { align: 'center' });
    doc.text(`Served By: ${adminName}`, 105, 290, { align: 'center' });

    doc.save(`Nova-receipt-${order._id}.pdf`);
  };

  const renderStatusIcon = (status: string) => {
    if (status === 'Pending') {
      return <span className="inline-block w-2.5 h-2.5 mr-2 rounded-full bg-green-500 animate-ping"></span>;
    }
    if (status === 'Cancelled') {
      return <span className="inline-block w-2.5 h-2.5 mr-2 rounded-full bg-red-500"></span>;
    }
    if (status === 'Paid' || status === 'Delivered') {
      return <span className="inline-block text-green-600 mr-1">✔️</span>;
    }
    return null;
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
                statusFilter === status ? 'bg-orange-500 text-white' : 'bg-gray-200'
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
                    <td className="p-2 flex items-center">{renderStatusIcon(order.status)}{order.status}</td>
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
                        className="text-orange-600 hover:underline"
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
              <div className="bg-white p-6 rounded shadow max-w-2xl w-full relative">
                <button onClick={() => setShowModal(false)} className="absolute top-2 right-2 text-gray-600 text-xl">✕</button>
                <h2 className="text-lg font-semibold mb-4">Order Preview</h2>
                <div className="space-y-2">
                  <p><strong>ID:</strong> {selectedOrder._id}</p>
                  <p><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  <p><strong>Amount:</strong> Ksh {selectedOrder.paymentInfo?.amount?.toFixed(2)}</p>
                  <p><strong>Receipt:</strong> {selectedOrder.paymentInfo?.receipt || '-'}</p>
                  <p><strong>Phone:</strong> {selectedOrder.paymentInfo?.phone || '-'}</p>
                  <p><strong>Status:</strong> {selectedOrder.status}</p>
                </div>

                {selectedOrder?.items && selectedOrder.items.length > 0 && (
                  <div className="mt-6">
                    <p className="font-semibold mb-2">Items:</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border p-2 text-left">Image</th>
                            <th className="border p-2 text-left">Item</th>
                            <th className="border p-2 text-left">Qty</th>
                            <th className="border p-2 text-left">Price</th>
                            <th className="border p-2 text-left">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedOrder.items.map((item, index) => (
                            <tr key={index} className="border-t">
                              <td className="p-2">
                                <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded shadow" />
                              </td>
                              <td className="p-2">{item.name}</td>
                              <td className="p-2">{item.quantity}</td>
                              <td className="p-2">Ksh {item.price.toFixed(2)}</td>
                              <td className="p-2">Ksh {(item.quantity * item.price).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="font-semibold bg-gray-100">
                            <td colSpan={4} className="p-2 text-right">Total:</td>
                            <td className="p-2">
                              Ksh {selectedOrder.items.reduce((total, item) => total + item.quantity * item.price, 0).toFixed(2)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                <div className="mt-6 text-right space-x-2">
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
                    className="px-4 py-2 bg-orange-500 text-white rounded"
                  >
                    Download PDF
                  </button>
                </div>

                <div className="mt-4 text-sm text-gray-500 text-center">
                  Served by: <strong>Cate Ruguru</strong>, senior sales consultant
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
