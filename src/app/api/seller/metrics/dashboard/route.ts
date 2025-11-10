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
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const currentYear = new Date().getFullYear();

    // -------------------------------
    // 🧾 1️⃣ Monthly Sales (12 months)
    // -------------------------------
    const monthlyOrders = await Order.aggregate([
      { $match: { "items.sellerId": sellerObjectId } },
      { $unwind: "$items" },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          sales: { $sum: "$items.price" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    const salesData = months.map((m) => {
      const found = monthlyOrders.find((x) => x._id.month === m);
      return {
        month: m,
        sales: found?.sales || 0,
        orders: found?.orders || 0,
      };
    });

    // -------------------------------
    // 💰 2️⃣ Total Orders + Revenue
    // -------------------------------
    const totalOrders = await Order.countDocuments({ "items.sellerId": sellerObjectId });
    const totalSalesAgg = await Order.aggregate([
      { $unwind: "$items" },
      { $match: { "items.sellerId": sellerObjectId } },
      { $group: { _id: null, total: { $sum: "$items.price" } } },
    ]);
    const totalRevenue = totalSalesAgg[0]?.total || 0;

    // -------------------------------
    // 👀 3️⃣ Visits + Bounce Rate (Simulated / placeholder)
    // -------------------------------
    const totalVisits = Math.round(totalOrders * (10 + Math.random() * 4)); // visits proportional to orders
    const bounceRate = Math.round(40 + Math.random() * 10); // between 40–50%

    // helper to build 12-month sparkline from actual or simulated data
    const makeSeries = (data: number[]) => {
      if (data.length === 12) return data.map((v, i) => ({ name: i + 1, value: v }));
      const avg = data.reduce((a, b) => a + b, 0) / (data.length || 1);
      return months.map((m) => ({
        name: m,
        value: Math.round(avg * (0.7 + Math.random() * 0.6)),
      }));
    };

    const stats = [
      {
        id: "orders",
        title: "Total Orders",
        value: totalOrders.toLocaleString(),
        change: "+8%",
        icon: "ShoppingCart",
        trend: "up",
        series: makeSeries(salesData.map((x) => x.orders)),
      },
      {
        id: "sales",
        title: "Total Sales",
        value: `Ksh ${totalRevenue.toLocaleString()}`,
        change: "+5%",
        icon: "DollarSign",
        trend: "up",
        series: makeSeries(salesData.map((x) => x.sales)),
      },
      {
        id: "visits",
        title: "Total Visits",
        value: totalVisits.toLocaleString(),
        change: "+3%",
        icon: "Eye",
        trend: "up",
        series: makeSeries(Array(12).fill(totalVisits / 12)),
      },
      {
        id: "bounce",
        title: "Bounce Rate",
        value: `${bounceRate}%`,
        change: "-2%",
        icon: "BarChart3",
        trend: "down",
        series: makeSeries(Array(12).fill(bounceRate)),
      },
    ];

    // -------------------------------
    // 🍩 4️⃣ Order Status Breakdown
    // -------------------------------
    const statusAgg = await Order.aggregate([
      { $match: { "items.sellerId": sellerObjectId } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.status",
          count: { $sum: 1 },
        },
      },
    ]);
    const donutData = statusAgg.map((s) => ({
      name: s._id || "Unknown",
      value: s.count,
    }));

    // -------------------------------
    // 🏆 5️⃣ Top Seller
    // -------------------------------
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
        percentageAchieved: Math.round(
          (topSellerAgg[0].revenue / (totalRevenue || 1)) * 100
        ),
      };
    }

    // -------------------------------
    // 📦 6️⃣ Active Products
    // -------------------------------
    const totalProducts = await Product.countDocuments({ sellerId });
    const activeProducts = await Product.countDocuments({
      sellerId,
      quantity: { $gt: 0 },
    });
    const activePercent = totalProducts
      ? Math.round((activeProducts / totalProducts) * 100)
      : 0;

    const summary = [
      {
        label: "Active Products",
        value: activeProducts,
        percent: activePercent,
        color: "#3b82f6",
      },
    ];

    // -------------------------------
    // ✅ Final Response
    // -------------------------------
    return NextResponse.json({
      stats,
      salesData,
      donutData,
      summary,
      topSeller,
    });
  } catch (error: any) {
    console.error("Dashboard metrics error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
