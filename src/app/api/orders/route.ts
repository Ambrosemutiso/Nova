import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Order from '@/app/models/orders';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  await dbConnect();

  const { searchParams } = new URL(req.url);

  const userId = searchParams.get('userId');
  const page = Number(searchParams.get('page') || 1);
  const limit = Number(searchParams.get('limit') || 10);

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
  }

  // 🔐 HARD RULE: USER SEES ONLY PAID ORDERS
  const query: any = {
    userId: new mongoose.Types.ObjectId(userId),
    status: 'paid',
  };

  const totalOrders = await Order.countDocuments(query);

  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .select(
      '_id createdAt items totalAmount deliveryFee trackingNumber customerInfo'
    )
    .lean();

  return NextResponse.json({
    orders,
    totalPages: Math.ceil(totalOrders / limit),
    currentPage: page,
  });
}
