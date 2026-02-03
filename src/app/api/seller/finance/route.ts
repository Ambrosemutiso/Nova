// /api/seller/finance/metrics.ts
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Order from '@/app/models/orders';
import User from '@/app/models/user';
import mongoose from 'mongoose';

interface SellerItem {
  price: number;
  quantity: number;
  sellerId: mongoose.Types.ObjectId | string;
  status: 'Pending' | 'Delivered' | 'Cancelled';
}

interface OrderDoc {
  _id: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  status: 'pending' | 'paid' | 'failed';
  createdAt: Date;
  items: SellerItem[];
  paymentMethod?: string;
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { sellerId } = await req.json();

    if (!sellerId) {
      return NextResponse.json({ error: 'Seller ID is required' }, { status: 400 });
    }

    const orders = (await Order.find({
      'items.sellerId': sellerId,
    }).lean()) as unknown as OrderDoc[];

    let totalSales = 0;
    let netEarnings = 0;
    let pendingPayouts = 0;
    let platformFees = 0;

    const transactions: any[] = [];
    const monthlyData: Record<string, { sales: number; payouts: number }> = {};

    for (const order of orders) {
      const sellerItems = order.items.filter(
        item => item.sellerId.toString() === sellerId && item.status !== 'Cancelled'
      );

      if (!sellerItems.length) continue;

      const deliveredItems = sellerItems.filter(item => item.status === 'Delivered');

      const sellerItemsTotal = sellerItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const deliveredTotal = deliveredItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const fee = deliveredTotal * 0.1;
      const earnings = deliveredTotal - fee;

      // Only count PAID orders
      if (order.status === 'paid') {
        totalSales += sellerItemsTotal;
        netEarnings += earnings;
        platformFees += fee;
      } else {
        pendingPayouts += earnings;
      }

      const month = new Date(order.createdAt).toLocaleString('default', { month: 'short' });
      if (!monthlyData[month]) monthlyData[month] = { sales: 0, payouts: 0 };

      monthlyData[month].sales += sellerItemsTotal;
      if (order.status === 'paid') {
        monthlyData[month].payouts += earnings;
      }

      // 🧍 Get buyer name safely
      let buyerName = 'Unknown Buyer';
      if (order.userId) {
        const buyer = (await User.findById(order.userId).select('name').lean()) as
          | { name?: string }
          | null;
        if (buyer?.name) buyerName = buyer.name;
      }

      transactions.push({
        date: order.createdAt,
        orderId: order._id.toString(),
        buyer: buyerName,
        amount: sellerItemsTotal,
        status:
          order.status === 'paid' && deliveredItems.length
            ? 'Completed'
            : 'Pending',
        method: order.paymentMethod || 'M-Pesa',
      });
    }

    const chart = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      sales: data.sales,
      payouts: data.payouts,
    }));

    return NextResponse.json(
      {
        summary: {
          totalSales,
          netEarnings,
          pendingPayouts,
          platformFees,
        },
        chart,
        transactions,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in finance metrics API:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
