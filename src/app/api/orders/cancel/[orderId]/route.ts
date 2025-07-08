import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Order from '@/app/models/orders';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  await dbConnect();

  const { orderId } = params;

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    if (order.status === 'Cancelled') {
      return NextResponse.json({ message: 'Order already cancelled' }, { status: 400 });
    }

    // Only cancel if not already delivered/paid
    if (order.status === 'Delivered' || order.status === 'Paid') {
      return NextResponse.json(
        { message: 'Delivered or paid orders cannot be cancelled' },
        { status: 400 }
      );
    }

    order.status = 'Cancelled';
    await order.save();

    return NextResponse.json({ message: 'Order cancelled successfully' });
  } catch (err) {
    console.error('Cancel order error:', err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
