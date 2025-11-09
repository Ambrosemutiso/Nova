import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Order from "@/app/models/orders";
import Product from "@/app/models/product";
import Seller from "@/app/models/seller";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get("sellerId");
    if (!sellerId) {
      return NextResponse.json({ error: "Missing sellerId" }, { status: 400 });
    }

    const sellerObjectId = new mongoose.Types.ObjectId(sellerId);
    const currentYear = new Date().getFullYear();

    // 🧮 Monthly sales + views for full 12 months
    const monthlyData = await Order.aggregate([
      { $match: { "items.sellerId": sellerObjectId } },
      { $unwind: "$items" },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          sales: { $sum: "$items.price" },
          views: { $sum: { $multiply: [1, 1] } }, // placeholder for now
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const salesData = months.map((m) => {
      const match = monthlyData.find((d) => d._id.month === m);
      return { month: m, sales: match?.sales || 0, views: match?.views || 0 };
    });

    // ---------- 1️⃣ STATS CARDS ----------
    const totalOrders = await Order.countDocuments({ "items.sellerId": sellerObjectId });
    const totalSales = await Order.aggregate([
      { $unwind: "$items" },
      { $match: { "items.sellerId": sellerObjectId } },
      { $group: { _id: null, total: { $sum: "$items.price" } } },
    ]);
    const totalRevenue = totalSales[0]?.total || 0;

    // simulate metrics with sparkline (12 months)
    const makeSeries = (base: number) =>
      months.map((m) => ({
        name: m,
        value: Math.round(base * (0.7 + Math.random() * 0.6)),
      }));

    const stats = [
      {
        id: "orders",
        title: "Total Orders",
        value: totalOrders.toLocaleString(),
        change: "+8%",
        icon: "ShoppingCart",
        trend: "up",
        series: makeSeries(totalOrders / 12),
      },
      {
        id: "sales",
        title: "Total Sales",
        value: `Ksh ${totalRevenue.toLocaleString()}`,
        change: "+5%",
        icon: "DollarSign",
        trend: "up",
        series: makeSeries(totalRevenue / 12),
      },
      {
        id: "visits",
        title: "Total Visits",
        value: "18,250",
        change: "+3%",
        icon: "Eye",
        trend: "up",
        series: makeSeries(1500),
      },
      {
        id: "bounce",
        title: "Bounce Rate",
        value: "42%",
        change: "-2%",
        icon: "BarChart3",
        trend: "down",
        series: makeSeries(42),
      },
    ];

    // ---------- 2️⃣ ORDER STATUS DONUT ----------
    const allOrders = await Order.aggregate([
      { $match: { "items.sellerId": sellerObjectId } },
      { $unwind: "$items" },
      { $match: { "items.sellerId": sellerObjectId } },
      {
        $group: {
          _id: "$items.status",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const donutData = allOrders.map((s) => ({
      name: s._id || "Unknown",
      value: s.count,
    }));

    // ---------- 3️⃣ TOP SELLER ----------
    const topSellerAgg = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.sellerId",
          revenue: { $sum: "$items.price" },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 1 },
    ]);

    let topSeller = null;
    if (topSellerAgg.length > 0) {
      const seller = await Seller.findById(topSellerAgg[0]._id).select("name");
      topSeller = {
        name: seller?.name || "Top Seller",
        revenue: topSellerAgg[0].revenue,
        percentageAchieved: Math.round((topSellerAgg[0].revenue / (totalRevenue || 1)) * 100),
      };
    }

    // ---------- 4️⃣ ACTIVE PRODUCTS ----------
    const totalProducts = await Product.countDocuments({ sellerId });
    const activeProducts = await Product.countDocuments({ sellerId, active: true });
    const activePercent = totalProducts ? Math.round((activeProducts / totalProducts) * 100) : 0;

    const summary = [
      {
        label: "Active Products",
        value: activeProducts,
        percent: activePercent,
        color: "#3b82f6",
        usd: "",
      },
    ];

    // ---------- 5️⃣ FINAL RESPONSE ----------
    return NextResponse.json({
      stats,
      salesData: salesData.map((d) => ({
        sales: d.sales,
        views: d.views,
      })),
      donutData,
      summary,
      topSeller,
    });
  } catch (error: any) {
    console.error("Dashboard metrics error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
