import { NextRequest, NextResponse } from 'next/server';
import Order from '@/app/models/orders';
import { dbConnect } from '@/lib/dbConnect';

export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();
    const { orderId, itemName, newStatus } = await req.json();

    const order = await Order.findById(orderId);
    if (!order) return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });

    // Find item and update status
    const item = order.items.find((item: any) => item.name === itemName);
    if (!item) return NextResponse.json({ success: false, message: 'Item not found' }, { status: 404 });

    item.status = newStatus;
    await order.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Item update error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
