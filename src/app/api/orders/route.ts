import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Order from '@/models/orders';

export async function GET(req: NextRequest) {
  await dbConnect();

  const url = new URL(req.url);
  const userId = url.searchParams.get('userId');
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '10');
  const sort = url.searchParams.get('sort') || 'createdAt';
  const order = url.searchParams.get('order') === 'asc' ? 1 : -1;
  const status = url.searchParams.get('status');

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  const query: any = { userId };

  if (status && status !== 'all') {
    query.status = status;
  }

  const totalOrders = await Order.countDocuments(query);
  const totalPages = Math.ceil(totalOrders / limit);

  const orders = await Order.find(query)
    .sort({ [sort]: order })
    .skip((page - 1) * limit)
    .limit(limit)
    .select('_id createdAt status paymentInfo');

  return NextResponse.json({ orders, totalPages });
}
