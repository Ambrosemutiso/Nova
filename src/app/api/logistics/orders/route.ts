import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Order from '@/app/models/orders';

export async function GET(req: NextRequest) {
  await dbConnect();

  const partnerId = req.headers.get('partner-id'); // assume passed for now
  if (!partnerId)
    return NextResponse.json({ error: 'Missing partner ID' }, { status: 400 });

  const orders = await Order.find({ logisticsPartner: partnerId }).lean();
  return NextResponse.json(orders);
}
