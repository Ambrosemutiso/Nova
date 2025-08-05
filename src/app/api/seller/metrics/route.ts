import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Order from '@/app/models/orders';
import Product from '@/app/models/product';
import Seller from '@/app/models/seller';

export async function POST(req: NextRequest) {
  await dbConnect();
  const { sellerId, year } = await req.json();

  if (!sellerId) {
    return NextResponse.json({ error: 'Missing sellerId' }, { status: 400 });
  }

  const selectedYear = year || new Date().getFullYear();
  const startDate = new Date(`${selectedYear}-01-01`);
  const endDate = new Date(`${selectedYear + 1}-01-01`);

  try {
    const activeProducts = await Product.countDocuments({
      sellerId,
      quantity: { $gt: 0 },
    });

    const sellerProducts = await Product.find({ sellerId }).select('name');
    const sellerProductNames = sellerProducts.map((p) => p.name);

    const orders = await Order.find({
      'items.name': { $in: sellerProductNames },
      createdAt: { $gte: startDate, $lt: endDate },
    });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((acc, order) => acc + (order.paidAmount || 0), 0);

    const deliveredOrders = orders.filter((o) => o.status === 'Delivered').length;
    const cancelledOrders = orders.filter((o) => o.status === 'Cancelled').length;
    const pendingOrders = orders.filter((o) => o.status === 'Pending').length;
    const paidOrders = orders.filter((o) => o.status === 'Paid').length;

    let subtotalRevenue = 0;

    for (const order of orders) {
      for (const item of order.items) {
        if (
          sellerProductNames.includes(item.name) &&
          item.status === 'Delivered'
        ) {
          subtotalRevenue += item.price * item.quantity;
        }
      }
    }

    const seller = await Seller.findById(sellerId).select('followers');
    const totalFollowers = seller?.followers?.length || 0;

const chartData = Array.from({ length: 12 }, (_, i) => ({
  month: new Date(2000, i).toLocaleString('default', { month: 'short' }),
  revenue: 0,
  activeProducts: new Set<string>(), // temporarily store product names
}));

for (const order of orders) {
  const month = new Date(order.createdAt).getMonth();

  for (const item of order.items) {
    if (sellerProductNames.includes(item.name)) {
      // Track revenue
      if (item.status === 'Delivered') {
        chartData[month].revenue += item.price * item.quantity;
      }

      // Track active products by name
      chartData[month].activeProducts.add(item.name);
    }
  }
}

// Convert activeProducts from Set to count
const formattedChartData = chartData.map((data) => ({
  month: data.month,
  revenue: data.revenue,
  activeProducts: data.activeProducts.size,
}));


    return NextResponse.json({
      totalOrders,
      totalRevenue,
      subtotalRevenue,
      activeProducts,
      totalFollowers,
      deliveredOrders,
      cancelledOrders,
      pendingOrders,
      paidOrders,
      chartData: formattedChartData,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Failed to load metrics' }, { status: 500 });
  }
}
