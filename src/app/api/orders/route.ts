//app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Order from '@/app/models/orders';

export async function PATCH(req: NextRequest) {
  await dbConnect();

  try {
    const { orderId, status } = await req.json();

    if (!['Processing', 'Delivered'].includes(status)) {
      return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    order.status = status;
    await order.save();

    return NextResponse.json({ message: 'Order status updated' });
  } catch (error) {
    console.error('Order update error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
