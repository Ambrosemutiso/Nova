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

    // Find orders that contain items with this sellerId
    const allOrders = await Order.find({ 'items.sellerId': sellerId }).lean();

    // Filter items per seller inside each order
    const sellerOrders = allOrders.map((order) => {
      const sellerItems = order.items.filter((item: any) =>
        item.sellerId?.toString() === sellerId
      );

      return {
        ...order,
        items: sellerItems,
      };
    }).filter(order => order.items.length > 0); // Only return orders with items from this seller

    return NextResponse.json({ orders: sellerOrders });
  } catch (error) {
    console.error('Error fetching seller orders:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
