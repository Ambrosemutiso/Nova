import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Order from "@/app/models/orders";
import Seller from "@/app/models/seller";
import Product from "@/app/models/product";

interface SellerItem {
  name: string;
  quantity: number;
  price: number;
  images: string[];
  fulfillmentMode: string;
  sellerId: string;
  status: "Pending" | "Delivered" | "Cancelled";
  orderCreatedAt: Date;
  views?: number;
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { sellerId } = await req.json();
    if (!sellerId) {
      return NextResponse.json({ error: "Missing sellerId" }, { status: 400 });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const startOfLastYear = new Date(now.getFullYear() - 1, 0, 1);
    const endOfLastYear = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    // ---------- Fetch seller's delivered items via aggregation ----------
    const statsData = await Order.aggregate([
      { $match: { status: "Paid" } },
      { $unwind: "$items" },
      {
        $match: {
          "items.sellerId": sellerId,
          "items.status": "Delivered",
        },
      },
      {
        $project: {
          name: "$items.name",
          quantity: "$items.quantity",
          price: "$items.price",
          images: "$items.images",
          fulfillmentMode: "$items.fulfillmentMode",
          sellerId: "$items.sellerId",
          status: "$items.status",
          views: { $ifNull: ["$items.views", 0] },
          orderCreatedAt: "$createdAt",
        },
      },
    ]);

    // ---------- Helper functions ----------
    const getChange = (current: number, previous: number) =>
      previous === 0 ? "N/A" : `${(((current - previous) / previous) * 100).toFixed(1)}%`;

    const filterItems = (items: SellerItem[], start: Date, end?: Date) =>
      items.filter((item) => item.orderCreatedAt >= start && (!end || item.orderCreatedAt <= end));

    const ordersThisMonth = filterItems(statsData, startOfMonth);
    const ordersLastMonth = filterItems(statsData, startOfLastMonth, endOfLastMonth);
    const ordersThisYear = filterItems(statsData, startOfYear);
    const ordersLastYear = filterItems(statsData, startOfLastYear, endOfLastYear);

    // ---------- Totals ----------
    const totalOrders = statsData.length;
    const totalRevenue = statsData.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalVisits = statsData.reduce((sum, item) => sum + (item.views || 0), 0);

    const revenueThisMonth = ordersThisMonth.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const revenueLastMonth = ordersLastMonth.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const revenueThisYear = ordersThisYear.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const revenueLastYear = ordersLastYear.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const visitsThisMonth = ordersThisMonth.reduce((sum, item) => sum + (item.views || 0), 0);
    const visitsLastMonth = ordersLastMonth.reduce((sum, item) => sum + (item.views || 0), 0);

    const bounceRateThisMonth = visitsThisMonth
      ? Math.round(((visitsThisMonth - ordersThisMonth.length) / visitsThisMonth) * 100)
      : 0;
    const bounceRateLastMonth = visitsLastMonth
      ? Math.round(((visitsLastMonth - ordersLastMonth.length) / visitsLastMonth) * 100)
      : 0;

    // ---------- Daily Bounce Rate ----------
    const bounceSeries = Array.from({ length: daysInMonth }, (_, i) => {
      const dayStart = new Date(now.getFullYear(), now.getMonth(), i + 1);
      const dayEnd = new Date(now.getFullYear(), now.getMonth(), i + 2);
      const itemsOfDay = filterItems(statsData, dayStart, dayEnd);
      const dayVisits = itemsOfDay.reduce((sum, item) => sum + (item.views || 0), 0);
      const bounce = dayVisits ? Math.round(((dayVisits - itemsOfDay.length) / dayVisits) * 100) : 0;
      return { x: i + 1, v: bounce };
    });

    // ---------- Daily Sales & Visits ----------
    const dailySalesData = Array.from({ length: daysInMonth }, (_, i) => {
      const dayStart = new Date(now.getFullYear(), now.getMonth(), i + 1);
      const dayEnd = new Date(now.getFullYear(), now.getMonth(), i + 2);
      const itemsOfDay = filterItems(statsData, dayStart, dayEnd);
      const salesOfDay = itemsOfDay.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const viewsOfDay = itemsOfDay.reduce((sum, item) => sum + (item.views || 0), 0);
      return { name: `${i + 1}`, sales: salesOfDay, views: viewsOfDay };
    });

    // ---------- Stats Cards ----------
    const stats = [
      {
        id: 1,
        title: "Total Orders",
        value: totalOrders,
        change: getChange(ordersThisMonth.length, ordersLastMonth.length),
        icon: "ShoppingCart",
        trend: ordersThisMonth.length >= ordersLastMonth.length ? "up" : "down",
        series: ordersThisMonth.map((item, i) => ({ x: i + 1, v: item.price * item.quantity })),
      },
      {
        id: 2,
        title: "Total Sales",
        value: totalRevenue,
        change: getChange(revenueThisMonth, revenueLastMonth),
        icon: "DollarSign",
        trend: revenueThisMonth >= revenueLastMonth ? "up" : "down",
        series: ordersThisMonth.map((item, i) => ({ x: i + 1, v: item.price * item.quantity })),
      },
      {
        id: 3,
        title: "Total Visits",
        value: totalVisits,
        change: getChange(visitsThisMonth, visitsLastMonth),
        icon: "Eye",
        trend: visitsThisMonth >= visitsLastMonth ? "up" : "down",
        series: ordersThisMonth.map((item, i) => ({ x: i + 1, v: item.views || 0 })),
      },
      {
        id: 4,
        title: "Bounce Rate",
        value: `${bounceRateThisMonth}%`,
        change: getChange(bounceRateThisMonth, bounceRateLastMonth),
        icon: "BarChart3",
        trend: bounceRateThisMonth <= bounceRateLastMonth ? "up" : "down",
        series: bounceSeries,
      },
    ];

    // ---------- Order Status Donut ----------
    const statusCounts: Record<string, number> = {};
    statsData.forEach((item) => {
      statusCounts[item.status] = (statusCounts[item.status] || 0) + 1;
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
      monthlyTarget: 100,
      yearlyTarget: 1000,
    };

    // ---------- Revenue Summary ----------
    const summary = [
      {
        label: "Monthly",
        value: revenueThisMonth,
        color: "#f97316",
        percent: Math.round((revenueThisMonth / 100000) * 100),
        usd: revenueThisMonth,
      },
      {
        label: "Yearly",
        value: revenueThisYear,
        color: "#3b82f6",
        percent: Math.round((revenueThisYear / 1000000) * 100),
        usd: revenueThisYear,
      },
      {
        label: "Yearly",
        value: revenueLastYear,
        color: "#3b82f6",
        percent: Math.round((revenueThisYear / 1000000) * 100),
        usd: revenueLastYear,
      },
    ];

    // ---------- Top Seller ----------
    const topSellerData = await Order.aggregate([
      { $match: { status: "Paid", createdAt: { $gte: startOfMonth } } },
      { $unwind: "$items" },
      { $match: { "items.status": "Delivered" } },
      {
        $group: {
          _id: "$items.sellerId",
          totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
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
        percentageAchieved: Math.round((topSellerData[0].totalRevenue / monthlyTarget) * 100),
      };
    }

    return NextResponse.json({
      stats,
      salesData: dailySalesData,
      donutData,
      summary,
      topSeller,
      activeProducts,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 });
  }
}
