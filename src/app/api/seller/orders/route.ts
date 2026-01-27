// /api/seller/orders.ts
import { NextRequest, NextResponse } from 'next/server';
import Order from '@/app/models/orders';
import { dbConnect } from '@/lib/dbConnect';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { sellerId } = await req.json();

    if (!sellerId) {
      return NextResponse.json(
        { error: 'Seller ID is required' },
        { status: 400 }
      );
    }

    const sellerObjectId = new mongoose.Types.ObjectId(sellerId);

    /**
     * ✅ Correct MongoDB query using $elemMatch
     * - Order must be PAID
     * - Same item must match sellerId + fulfillmentMode
     */
    const orders = await Order.find({
      status: 'paid',
      items: {
        $elemMatch: {
          sellerId: sellerObjectId,
          fulfillmentMode: 'seller',
        },
      },
    })
      .sort({ createdAt: -1 })
      .lean();

    /**
     * ✅ Reduce items to ONLY this seller
     */
    const sellerOrders = orders
      .map((order: any) => {
        const sellerItems = order.items.filter(
          (item: any) =>
            item.sellerId?.toString() === sellerId &&
            item.fulfillmentMode === 'seller'
        );

        return {
          ...order,
          items: sellerItems,
        };
      })
      .filter((order) => order.items.length > 0);

    return NextResponse.json({ orders: sellerOrders }, { status: 200 });
  } catch (error) {
    console.error('❌ Error fetching seller orders:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
