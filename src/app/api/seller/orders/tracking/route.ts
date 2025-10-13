import { NextResponse, NextRequest } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Order from '@/app/models/orders';

export async function POST(req: NextRequest) {
  try {
    const { orderId, trackingNumber } = await req.json();

    if (!orderId || !trackingNumber) {
      return NextResponse.json(
        { message: 'Missing orderId or trackingNumber' },
        { status: 400 }
      );
    }

    await dbConnect();

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { trackingNumber },
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Tracking number saved successfully',
      order: updatedOrder,
    });
  } catch (error: unknown) {
    console.error('Tracking save error:', error);

    // Safely extract the message
    const message =
      error instanceof Error ? error.message : 'Unknown server error';

    return NextResponse.json(
      { message: 'Internal Server Error', error: message },
      { status: 500 }
    );
  }
}
