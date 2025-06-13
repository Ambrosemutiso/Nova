// hooks/useOrders.ts
import { useEffect, useState } from 'react';

interface Order {
  _id: string;
  status: string;
  paidAmount: number;
  paidPhone: string;
  mpesaReceiptNumber: string;
  createdAt: string;
}

interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  totalPages: number;
}

export function useOrders(page: number, sort: string, order: 'asc' | 'desc') {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
      if (!userId) return;

      setLoading(true);
      try {
        const res = await fetch(
          `/api/orders/user/${userId}?page=${page}&limit=5&sort=${sort}&order=${order}`
        );

        if (!res.ok) {
          throw new Error('Failed to fetch');
        }

        const data: Partial<OrdersResponse> = await res.json();

        if (Array.isArray(data.orders)) {
          setOrders(data.orders);
          setTotalPages(data.totalPages || 1);
        } else {
          setOrders([]);
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [page, sort, order]);

  return { orders, totalPages, loading };
}
