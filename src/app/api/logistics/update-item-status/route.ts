import { NextResponse } from 'next/server';
import {dbConnect} from '@/lib/dbConnect';
import Order from '@/app/models/orders'; 

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { orderId, itemId, newStatus } = body;

    if (!orderId || !itemId || !newStatus) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();

    const order = await Order.findOne({ _id: orderId });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const itemIndex = order.items.findIndex((item: any) => item._id.toString() === itemId);

    if (itemIndex === -1) {
      return NextResponse.json({ error: 'Item not found in order' }, { status: 404 });
    }

    order.items[itemIndex].status = newStatus;

    await order.save();

    return NextResponse.json({ success: true, message: 'Item status updated successfully' });
  } catch (error) {
    console.error('Update item status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
