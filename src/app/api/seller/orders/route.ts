import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Order from '@/app/models/orders';

export async function PATCH(req: NextRequest) {
  await dbConnect();
  const body = await req.json();
  const { orderId, itemName, newStatus } = body;

  if (!orderId || !itemName || !newStatus) {
    return NextResponse.json({ error: 'Missing data' }, { status: 400 });
  }

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // Cast items array safely
    const items = order.items as {
      name: string;
      quantity: number;
      price: number;
      image: string;
      status?: string;
    }[];

    const item = items.find((item) => item.name === itemName);

    if (item) {
      item.status = newStatus;
      await order.save();
      return NextResponse.json({ success: true, message: 'Order item status updated' });
    } else {
      return NextResponse.json({ success: false, error: 'Item not found in order' }, { status: 404 });
    }
  } catch (err) {
    console.error('Error updating item status:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
