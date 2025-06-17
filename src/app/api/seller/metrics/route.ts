import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Order from '@/app/models/orders';
import Product from '@/app/models/product';

export async function POST(req: NextRequest) {
  await dbConnect();
  const { sellerId } = await req.json();

  if (!sellerId) {
    return NextResponse.json({ error: 'Missing sellerId' }, { status: 400 });
  }

  try {
    const activeProducts = await Product.countDocuments({
      sellerId,
      quantity: { $gt: 0 },
    });

    const sellerProducts = await Product.find({ sellerId }).select('_id');

    const sellerProductNames = sellerProducts.map((p) => p.name);

    const orders = await Order.find({
      'items.name': { $in: sellerProductNames },
    });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((acc, order) => acc + (order.paidAmount || 0), 0);

    return NextResponse.json({
      totalOrders,
      totalRevenue,
      activeProducts,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Failed to load metrics' }, { status: 500 });
  }
}
