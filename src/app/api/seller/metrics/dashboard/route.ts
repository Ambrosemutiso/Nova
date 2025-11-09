import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Order from "@/app/models/orders";
import Seller from "@/app/models/seller";
import Product from "@/app/models/product";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { sellerId } = await req.json();
    if (!sellerId)
      return NextResponse.json({ error: "Missing sellerId" }, { status: 400 });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // ---------- Fetch Orders ----------
    const sellerOrders = await Order.find({ sellerId });

    // ---------- Totals ----------
    const totalOrders = sellerOrders.length;
    const totalRevenue = sellerOrders.reduce((sum, o) => sum + o.totalPrice, 0);
    const totalVisits = sellerOrders.reduce((sum, o) => sum + (o.views || 0), 0);

    // ---------- Orders by Month ----------
    const ordersThisMonth = sellerOrders.filter(o => o.createdAt >= startOfMonth);

    const visitsThisMonth = ordersThisMonth.reduce((sum, o) => sum + (o.views || 0), 0);

    // ---------- Revenue ----------
    const revenueThisMonth = ordersThisMonth.reduce((sum, o) => sum + o.totalPrice, 0);
    const revenueThisYear = sellerOrders
      .filter(o => o.createdAt >= startOfYear)
      .reduce((sum, o) => sum + o.totalPrice, 0);

    // ---------- Bounce Rate ----------
    const bounceRateThisMonth = visitsThisMonth
      ? Math.round(((visitsThisMonth - ordersThisMonth.length) / visitsThisMonth) * 100)
      : 0;

    // ---------- Helper ----------
    const getChange = (current: number, previous: number) => {
      if (previous === 0) return "N/A";
      return `${(((current - previous) / previous) * 100).toFixed(1)}%`;
    };

    // ---------- Daily Bounce Rate Series ----------
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const bounceSeries = Array.from({ length: daysInMonth }, (_, i) => {
      const dayStart = new Date(now.getFullYear(), now.getMonth(), i + 1);
      const dayEnd = new Date(now.getFullYear(), now.getMonth(), i + 2);
      const ordersOfDay = sellerOrders.filter(
        o => o.createdAt >= dayStart && o.createdAt < dayEnd
      );
      const visitsOfDay = ordersOfDay.reduce((sum, o) => sum + (o.views || 0), 0);
      const bounce = visitsOfDay
        ? Math.round(((visitsOfDay - ordersOfDay.length) / visitsOfDay) * 100)
        : 0;
      return { x: i + 1, v: bounce };
    });

    // ---------- Daily Sales & Visits Series ----------
    const dailySalesData = Array.from({ length: daysInMonth }, (_, i) => {
      const dayStart = new Date(now.getFullYear(), now.getMonth(), i + 1);
      const dayEnd = new Date(now.getFullYear(), now.getMonth(), i + 2);
      const ordersOfDay = sellerOrders.filter(
        o => o.createdAt >= dayStart && o.createdAt < dayEnd
      );
      const salesOfDay = ordersOfDay.reduce((sum, o) => sum + o.totalPrice, 0);
      const viewsOfDay = ordersOfDay.reduce((sum, o) => sum + (o.views || 0), 0);
      return { name: `${i + 1}`, sales: salesOfDay, views: viewsOfDay };
    });

    // ---------- Stats Cards ----------
    const stats = [
      {
        id: 1,
        title: "Total Orders",
        value: totalOrders,
        change: getChange(ordersThisMonth.length, 0), // previous month omitted for brevity
        icon: "ShoppingCart",
        trend: "up",
        series: ordersThisMonth.map((o, i) => ({ x: i + 1, v: o.totalPrice })),
      },
      {
        id: 2,
        title: "Total Sales",
        value: totalRevenue,
        change: getChange(revenueThisMonth, 0),
        icon: "DollarSign",
        trend: "up",
        series: ordersThisMonth.map((o, i) => ({ x: i + 1, v: o.totalPrice })),
      },
      {
        id: 3,
        title: "Total Visits",
        value: totalVisits,
        change: "N/A",
        icon: "Eye",
        trend: "up",
        series: ordersThisMonth.map((o, i) => ({ x: i + 1, v: o.views || 0 })),
      },
      {
        id: 4,
        title: "Bounce Rate",
        value: `${bounceRateThisMonth}%`,
        change: "N/A",
        icon: "BarChart3",
        trend: "down",
        series: bounceSeries,
      },
    ];

    // ---------- Order Status Donut ----------
    const statusCounts: Record<string, number> = {};
    sellerOrders.forEach(o => {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    });
    const donutData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

    // ---------- Active Products ----------
    const activeProductsThisMonth = await Product.countDocuments({
      sellerId,
      isActive: true,
      createdAt: { $gte: startOfMonth },
    });
    const activeProductsThisYear = await Product.countDocuments({
      sellerId,
      isActive: true,
      createdAt: { $gte: startOfYear },
    });

    const activeProducts = {
      month: activeProductsThisMonth,
      year: activeProductsThisYear,
      monthlyTarget: 100, // optional target
      yearlyTarget: 1000, // optional target
    };

    // ---------- Summary ----------
    const summary = [
      {
        label: "Monthly",
        value: revenueThisMonth,
        color: "#f97316",
        percent: Math.round(
          (revenueThisMonth / (sellerOrders[0]?.monthlyTarget || 100000)) * 100
        ),
        usd: revenueThisMonth,
      },
      {
        label: "Yearly",
        value: revenueThisYear,
        color: "#3b82f6",
        percent: Math.round(
          (revenueThisYear / (sellerOrders[0]?.yearlyTarget || 1000000)) * 100
        ),
        usd: revenueThisYear,
      },
    ];

    // ---------- Top Seller ----------
    const topSellerData = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfMonth }, status: "completed" } },
      { $group: { _id: "$sellerId", totalRevenue: { $sum: "$totalPrice" } } },
      { $sort: { totalRevenue: -1 } },
      { $limit: 1 },
    ]);

    let topSeller = null;
    if (topSellerData.length) {
      const seller = await Seller.findById(topSellerData[0]._id);
      const monthlyTarget = seller?.monthlyTarget || 300000;
      topSeller = {
        name: seller?.name || "Seller",
        revenue: topSellerData[0].totalRevenue,
        percentageAchieved: Math.round(
          (topSellerData[0].totalRevenue / monthlyTarget) * 100
        ),
      };
    }

    return NextResponse.json({
      stats,
      salesData: dailySalesData,
      donutData,
      summary,
      topSeller,
      activeProducts, // <-- included for frontend
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 });
  }
}
