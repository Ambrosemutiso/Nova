import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Order from '@/app/models/orders';
import Product from '@/app/models/product';
import Seller from '@/app/models/seller';

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

    const sellerProducts = await Product.find({ sellerId }).select('name');
    const sellerProductNames = sellerProducts.map((p) => p.name);

    const orders = await Order.find({
      'items.name': { $in: sellerProductNames },
    });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((acc, order) => acc + (order.paidAmount || 0), 0);

    // ✅ Filter orders by status
    const deliveredOrders = orders.filter((o) => o.status === 'Delivered').length;
    const cancelledOrders = orders.filter((o) => o.status === 'Cancelled').length;
    const pendingOrders = orders.filter((o) => o.status === 'Pending').length;
    const paidOrders = orders.filter((o) => o.status === 'Paid').length;

    // ✅ Get total followers
    const seller = await Seller.findById(sellerId).select('followers');
    const totalFollowers = seller?.followers?.length || 0;

    return NextResponse.json({
      totalOrders,
      totalRevenue,
      activeProducts,
      totalFollowers,
      deliveredOrders,
      cancelledOrders,
      pendingOrders,
      paidOrders,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Failed to load metrics' }, { status: 500 });
  }
}
