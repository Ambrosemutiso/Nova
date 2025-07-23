import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Order from '@/app/models/orders';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();

  const orderId = params.id;
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { deliveryStatus: 'Delivered' },
      { new: true }
    ).lean();

    return NextResponse.json(updatedOrder);
  } catch (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
