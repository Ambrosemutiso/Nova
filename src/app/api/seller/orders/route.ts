// /api/seller/orders.ts
import { NextRequest, NextResponse } from 'next/server';
import Order from '@/app/models/orders';
import { dbConnect } from '@/lib/dbConnect';

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

    /**
     * ✅ Order-level filter:
     * - status MUST be paid
     * - must contain items for this seller
     * - fulfillment mode remains seller
     */
    const allOrders = await Order.find({
      status: 'paid',
      'items.sellerId': sellerId,
      'items.fulfillmentMode': 'seller',
    }).lean();

    /**
     * ✅ Item-level filter:
     * - return ONLY the seller’s items
     */
    const sellerOrders = allOrders
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

    return NextResponse.json(
      { orders: sellerOrders },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error fetching seller orders:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
