import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Order from '@/app/models/orders';

export async function GET(req: NextRequest) {
  await dbConnect();

  const orderId = req.nextUrl.searchParams.get('orderId');

  if (!orderId) {
    return NextResponse.json({ message: 'Missing order ID' }, { status: 400 });
  }

  const order = await Order.findById(orderId);
  if (!order) {
    return NextResponse.json({ message: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json({ status: order.status });
}
