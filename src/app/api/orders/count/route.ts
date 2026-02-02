import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Order from '@/app/models/orders';

// POST /api/orders/count
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { sellerId } = await req.json();
    if (!sellerId) {
      return NextResponse.json(
        { message: 'sellerId is required' },
        { status: 400 }
      );
    }

    const count = await Order.countDocuments({
      status: 'paid', // ✅ order must be paid
      items: {
        $elemMatch: {
          sellerId,
          status: { $ne: 'Delivered' }, // ✅ pending / in-progress
        },
      },
    });

    return NextResponse.json({ count });
  } catch (err) {
    console.error('❌ Error counting seller orders:', err);
    return NextResponse.json(
      { message: 'Failed to count orders' },
      { status: 500 }
    );
  }
}
