import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { dbConnect } from '@/lib/dbConnect';
import Order from '@/app/models/orders';
import Seller from '@/app/models/seller';

interface SellerItem {
  price: number;
  quantity: number;
  sellerId: mongoose.Types.ObjectId | string;
  status?: string;
}

interface OrderDoc {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  status: string;
  items: SellerItem[];
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get('sellerId');

    if (!sellerId) {
      return NextResponse.json({ error: 'Seller ID is required' }, { status: 400 });
    }

    // ✅ Fetch all orders for this seller
    const sellerOrders = (await Order.find({
      'items.sellerId': sellerId,
    }).lean()) as unknown as OrderDoc[];

    if (!sellerOrders.length) {
      return NextResponse.json({
        message: 'No orders found for this seller',
        awards: [],
      });
    }

    // --- Step 1: Calculate key performance stats ---
    let totalSales = 0;
    let deliveredCount = 0;
    let pendingCount = 0;
    let cancelledCount = 0;

    for (const order of sellerOrders) {
      const sellerItems = order.items.filter(
        (item) => String(item.sellerId) === String(sellerId)
      );

      const orderTotal = sellerItems.reduce(
        (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
        0
      );

      totalSales += orderTotal;

      for (const item of sellerItems) {
        if (item.status === 'Delivered') deliveredCount++;
        if (item.status === 'Pending') pendingCount++;
        if (item.status === 'Cancelled') cancelledCount++;
      }
    }

    const totalOrders = sellerOrders.length;
    const deliveryRate =
      totalOrders > 0 ? (deliveredCount / totalOrders) * 100 : 0;
    const cancelRate =
      totalOrders > 0 ? (cancelledCount / totalOrders) * 100 : 0;

    // --- Step 2: Award Logic ---
    const awards: { title: string; description: string; badge: string }[] = [];

    // 🎖️ Top Seller
    if (totalSales >= 100000) {
      awards.push({
        title: 'Top Seller Award',
        description: 'Awarded for achieving over KSh 100,000 in total sales.',
        badge: '🥇',
      });
    }

    // 🌟 Rising Star
    if (totalSales >= 20000 && totalSales < 100000) {
      awards.push({
        title: 'Rising Star',
        description: 'Recognized for impressive early growth in sales.',
        badge: '🌟',
      });
    }

    // 🚚 Best Delivery
    if (deliveryRate >= 90) {
      awards.push({
        title: 'Best Delivery Award',
        description: 'Maintained an excellent delivery success rate above 90%.',
        badge: '🚚',
      });
    }

    // ❤️ Customer Commitment
    if (pendingCount === 0 && cancelledCount === 0) {
      awards.push({
        title: 'Customer Commitment',
        description: 'All orders successfully fulfilled with zero pending or cancelled ones.',
        badge: '❤️',
      });
    }

    // 🔥 Consistency
    if (sellerOrders.length >= 50) {
      awards.push({
        title: 'Consistency Award',
        description: 'Awarded for completing over 50 orders successfully.',
        badge: '🔥',
      });
    }

    // --- Step 3: Attach basic seller info (optional) ---
    const seller = await Seller.findById(sellerId).select('name shopName').lean();

    return NextResponse.json(
      {
        seller: seller || { name: 'Unknown Seller' },
        stats: {
          totalSales,
          totalOrders,
          deliveredCount,
          pendingCount,
          cancelledCount,
          deliveryRate: deliveryRate.toFixed(1),
          cancelRate: cancelRate.toFixed(1),
        },
        awards,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Error in awards route:', error);
    return NextResponse.json(
      { error: 'Server error', details: error.message },
      { status: 500 }
    );
  }
}
