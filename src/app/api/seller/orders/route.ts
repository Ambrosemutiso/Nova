// /api/seller/orders.ts
import { NextRequest, NextResponse } from 'next/server';
import Order from '@/app/models/orders';
import { dbConnect } from '@/lib/dbConnect';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { sellerId } = await req.json();

    if (!sellerId) {
      return NextResponse.json({ error: 'Seller ID is required' }, { status: 400 });
    }

    // Find all orders that contain items belonging to this seller AND fulfillmentMode = 'seller'
    const allOrders = await Order.find({
      'items.sellerId': sellerId,
      'items.fulfillmentMode': 'seller'
    }).lean();

    // Filter each order to only include items that match both sellerId and fulfillmentMode
    const sellerOrders = allOrders
      .map((order) => {
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
      .filter((order) => order.items.length > 0); // Only return orders with valid seller items

    return NextResponse.json({ orders: sellerOrders }, { status: 200 });
  } catch (error) {
    console.error('❌ Error fetching seller orders:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
