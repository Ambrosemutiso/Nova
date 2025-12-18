import { NextRequest, NextResponse } from 'next/server';
import Order from '@/app/models/orders';
import { dbConnect } from '@/lib/dbConnect';

export async function GET(req: NextRequest) {
  await dbConnect();

  const orderId = new URL(req.url).searchParams.get('orderId');

  if (!orderId) {
    return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
  }

  const order = await Order.findById(orderId);

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json({ status: order.status });
}
