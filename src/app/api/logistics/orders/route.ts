import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Order from '@/app/models/orders';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status'); // e.g. ?status=Pending

    // ✅ Base query: Only include orders with items fulfilled by company
    const query: any = {
      'items.fulfillmentMode': 'company',
    };

    // ✅ Optional filter by item status
    if (status && status !== 'all') {
      query['items.status'] = status;
    }

    // ✅ Fetch filtered orders
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    console.error('Error fetching logistics orders:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
