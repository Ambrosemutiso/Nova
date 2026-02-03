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
    // ===== Seller & Product Info =====
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

    const seller = await Seller.findById(sellerId).select('followers');
    const totalFollowers = seller?.followers?.length || 0;

    // ===== Order Metrics =====
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((acc, order) => acc + (order.paidAmount || 0), 0);
    const deliveredOrders = orders.filter((o) => o.status === 'Delivered').length;
    const cancelledOrders = orders.filter((o) => o.status === 'Cancelled').length;
    const pendingOrders = orders.filter((o) => o.status === 'pending').length;
    const paidOrders = orders.filter((o) => o.status === 'paid').length;

    // ===== Finance Metrics =====
    let subtotalRevenue = 0;
    for (const order of orders) {
      for (const item of order.items) {
        if (sellerProductNames.includes(item.name) && item.status === 'Delivered') {
          subtotalRevenue += item.price * item.quantity;
        }
      }
    }

    // Example fee and payout logic
    const platformFeeRate = 0.05;
    const platformFees = subtotalRevenue * platformFeeRate;
    const netEarnings = subtotalRevenue - platformFees;
    const pendingPayouts = orders
      .filter((o) => o.status === 'pending')
      .reduce((acc, o) => acc + (o.paidAmount || 0), 0);

    // ===== Monthly Chart Data =====
    const chartData = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(2000, i).toLocaleString('default', { month: 'short' }),
      revenue: 0,
      activeProducts: new Set<string>(),
      payouts: 0,
    }));

    for (const order of orders) {
      const month = new Date(order.createdAt).getMonth();
      for (const item of order.items) {
        if (sellerProductNames.includes(item.name)) {
          if (item.status === 'Delivered') {
            chartData[month].revenue += item.price * item.quantity;
            chartData[month].payouts += item.price * item.quantity * (1 - platformFeeRate);
          }
          chartData[month].activeProducts.add(item.name);
        }
      }
    }

    const formattedChartData = chartData.map((data) => ({
      month: data.month,
      sales: data.revenue,
      payouts: data.payouts,
      activeProducts: data.activeProducts.size,
    }));

    // ===== Response =====
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
      platformFees,
      netEarnings,
      pendingPayouts,
      chartData: formattedChartData,
    });
  } catch (error) {
    console.error('Metrics error:', error);
    return NextResponse.json({ error: 'Failed to load metrics' }, { status: 500 });
  }
}
