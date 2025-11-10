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
    if (!sellerId) return NextResponse.json({ error: "Missing sellerId" }, { status: 400 });

    const sellerObjectId = new mongoose.Types.ObjectId(sellerId);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    // -------------------------------
    // 1️⃣ Monthly Sales & Views
    // -------------------------------
    // Fetch orders
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

    // Fetch product views
    const monthlyViews = await Product.aggregate([
      { $match: { sellerId } },
      {
        $group: {
          _id: { month: { $month: "$updatedAt" } },
          views: { $sum: "$views" },
        },
      },
    ]);

    const salesData = months.map((m) => {
      const monthOrder = monthlyOrders.find(x => x._id.month === m);
      const monthView = monthlyViews.find(x => x._id.month === m);
      return {
        month: m,
        sales: Number(monthOrder?.sales) || 0,
        orders: Number(monthOrder?.orders) || 0,
        views: Number(monthView?.views) || 0,
      };
    });

    // -------------------------------
    // 2️⃣ Total Orders & Revenue
    // -------------------------------
    const totalOrders = await Order.countDocuments({ "items.sellerId": sellerObjectId });
    const totalRevenueAgg = await Order.aggregate([
      { $unwind: "$items" },
      { $match: { "items.sellerId": sellerObjectId } },
      { $group: { _id: null, total: { $sum: "$items.price" } } },
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    // -------------------------------
    // 3️⃣ Visits & Bounce Rate
    // -------------------------------
    const totalVisits = salesData.reduce((sum, d) => sum + d.views, 0); // sum of monthly views
    const bounceRate = Math.round(40 + Math.random() * 10); // 40–50% simulated

    // Helper for sparklines (12 months)
    const makeSeries = (arr: number[]) => arr.map((v, i) => ({ name: i + 1, value: Number(v) || 0 }));

    const stats = [
      {
        id: "orders",
        title: "Total Orders",
        value: totalOrders.toLocaleString(),
        change: "+8%",
        icon: "ShoppingCart",
        trend: "up",
        series: makeSeries(salesData.map(d => d.orders)),
      },
      {
        id: "sales",
        title: "Total Sales",
        value: `Ksh ${totalRevenue.toLocaleString()}`,
        change: "+5%",
        icon: "DollarSign",
        trend: "up",
        series: makeSeries(salesData.map(d => d.sales)),
      },
      {
        id: "visits",
        title: "Total Visits",
        value: totalVisits.toLocaleString(),
        change: "+3%",
        icon: "Eye",
        trend: "up",
        series: makeSeries(salesData.map(d => d.views)),
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
    // 4️⃣ Order Status Breakdown
    // -------------------------------
    const statusAgg = await Order.aggregate([
      { $match: { "items.sellerId": sellerObjectId } },
      { $unwind: "$items" },
      {
        $group: { _id: "$items.status", count: { $sum: 1 } },
      },
    ]);
    const donutData = statusAgg.map(s => ({ name: s._id || "Unknown", value: s.count }));


    // -------------------------------
// 7️⃣ Delivered vs Pending Summary
// -------------------------------
const deliveredOrders = await Order.countDocuments({
  "items.sellerId": sellerObjectId,
  "items.status": "Delivered",
});
const pendingOrders = await Order.countDocuments({
  "items.sellerId": sellerObjectId,
  "items.status": { $in: ["Pending", "Processing"] },
});
const totalRelevantOrders = deliveredOrders + pendingOrders || 1;

const deliveredPercent = Math.round((deliveredOrders / totalRelevantOrders) * 100);

const deliveredSummary = {
  label: "Orders Delivered",
  value: deliveredOrders,
  percent: deliveredPercent,
  color: "#10b981", // green for delivered
  usd: "",
};

    // -------------------------------
    // 5️⃣ Top Seller
    // -------------------------------
    const topSellerAgg = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: { _id: "$items.sellerId", revenue: { $sum: "$items.price" } },
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

    // -------------------------------
    // 6️⃣ Active Products
    // -------------------------------
    const totalProducts = await Product.countDocuments({ sellerId });
    const activeProducts = await Product.countDocuments({ sellerId, quantity: { $gt: 0 } });
    const activePercent = totalProducts ? Math.round((activeProducts / totalProducts) * 100) : 0;

    const summary = [
      { label: "Active Products", value: activeProducts, percent: activePercent, color: "#3b82f6" },
    ];

return NextResponse.json({
  stats,
  salesData,
  donutData,
  summary, // keep your active products
  activeProductsSummary: [deliveredSummary], // delivered orders minidonut
  topSeller,
});

  } catch (err) {
    console.error("Dashboard metrics error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
