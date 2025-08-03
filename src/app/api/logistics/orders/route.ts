// /api/logistics/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Order from '@/app/models/orders';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status'); // Optional query filter: ?status=Pending

    // Fetch all orders if no status is specified
    const orders = status
      ? await Order.find({ 'items.status': status }).lean()
      : await Order.find({}).lean();

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    console.error('Error fetching logistics orders:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
