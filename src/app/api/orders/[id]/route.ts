import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Order from '@/app/models/orders';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        await dbConnect();
        const order = await Order.findById(id).lean() as {
            status: string;
            _id: string;
            mpesaReceiptNumber?: string;
            paidAmount?: number;
            paidPhone?: string;
        } | null;

    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      status: order.status,
      orderId: order._id,
      mpesaReceiptNumber: order.mpesaReceiptNumber || null,
      paidAmount: order.paidAmount || null,
      paidPhone: order.paidPhone || null,
    });
  } catch (err) {
    console.error('❌ Error fetching order:', err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
