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
}

interface OrderDoc {
  _id: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  status?: string;
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

    const allOrders = (await Order.find({
      'items.sellerId': sellerId,
    }).lean()) as unknown as OrderDoc[];

    let totalSales = 0;
    let netEarnings = 0;
    let pendingPayouts = 0;
    let platformFees = 0;

    const transactions: any[] = [];
    const monthlyData: Record<string, { sales: number; payouts: number }> = {};

    for (const order of allOrders) {
      const sellerItems = order.items.filter(
        (item: SellerItem) => item.sellerId?.toString() === sellerId
      );

      if (sellerItems.length === 0) continue;

      const orderTotal = sellerItems.reduce(
        (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
        0
      );

      totalSales += orderTotal;

      const fee = orderTotal * 0.1; // assume 10% platform fee
      const earnings = orderTotal - fee;

      platformFees += fee;
      netEarnings += earnings;

      if (order.status !== 'Delivered') {
        pendingPayouts += earnings;
      }

      const month = new Date(order.createdAt).toLocaleString('default', { month: 'short' });
      if (!monthlyData[month]) monthlyData[month] = { sales: 0, payouts: 0 };
      monthlyData[month].sales += orderTotal;
      monthlyData[month].payouts += order.status === 'Delivered' ? earnings : 0;

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
        orderId: order._id ? order._id.toString() : '',
        buyer: buyerName,
        amount: orderTotal,
        status: order.status === 'Delivered' ? 'Completed' : 'Pending',
        method: order.paymentMethod || 'M-Pesa',
      });
    }

    const chart = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      sales: data.sales,
      payouts: data.payouts,
    }));

    const summary = {
      totalSales,
      netEarnings,
      pendingPayouts,
      platformFees,
    };

    return NextResponse.json({ summary, chart, transactions }, { status: 200 });
  } catch (error) {
    console.error('Error in finance metrics API:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
