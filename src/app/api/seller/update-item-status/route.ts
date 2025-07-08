// File: app/api/seller/update-item-status/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Order from '@/app/models/orders';

export async function PATCH(req: NextRequest) {
  await dbConnect();
  const { orderId, itemName, newStatus } = await req.json();

  if (!orderId || !itemName || !newStatus) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Update the status of the matching item in the order
    let updated = false;
    for (const item of order.items) {
      if (item.name === itemName) {
        item.status = newStatus;
        updated = true;
      }
    }

    if (!updated) {
      return NextResponse.json({ error: 'Item not found in order' }, { status: 404 });
    }

    await order.save();
    return NextResponse.json({ success: true, message: 'Item status updated successfully' });
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({ error: 'Failed to update item status' }, { status: 500 });
  }
}
