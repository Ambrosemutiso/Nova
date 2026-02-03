import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Order from "@/app/models/orders";
import Product from "@/app/models/product";
import mongoose from "mongoose";
import Seller from '@/app/models/seller';

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

    // --------------------------------------------------
    // 1️⃣ Monthly Sales & Orders (PAID ONLY)
    // --------------------------------------------------
    const monthlyOrders = await Order.aggregate([
      {
        $match: {
          status: "paid",
          "items.sellerId": sellerObjectId,
        },
      },
      { $unwind: "$items" },
      {
        $match: {
          "items.sellerId": sellerObjectId,
          "items.status": { $ne: "Cancelled" },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          sales: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    // --------------------------------------------------
    // Product Views
    // --------------------------------------------------
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

    // --------------------------------------------------
    // 2️⃣ Total Orders & Revenue (PAID ONLY)
    // --------------------------------------------------
    const totalOrdersAgg = await Order.aggregate([
      { $match: { status: "paid", "items.sellerId": sellerObjectId } },
      { $unwind: "$items" },
      {
        $match: {
          "items.sellerId": sellerObjectId,
          "items.status": { $ne: "Cancelled" },
        },
      },
      { $count: "count" },
    ]);
    const totalOrders = totalOrdersAgg[0]?.count || 0;

    const totalRevenueAgg = await Order.aggregate([
      { $match: { status: "paid" } },
      { $unwind: "$items" },
      {
        $match: {
          "items.sellerId": sellerObjectId,
          "items.status": "Delivered",
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
        },
      },
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    // --------------------------------------------------
    // 3️⃣ Visits & Bounce Rate
    // --------------------------------------------------
    const totalVisits = salesData.reduce((sum, d) => sum + d.views, 0);
    const bounceRate = Math.round(40 + Math.random() * 10);

    const makeSeries = (arr: number[]) =>
      arr.map((v, i) => ({ name: i + 1, value: Number(v) || 0 }));

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

    // --------------------------------------------------
    // 4️⃣ Order Status Breakdown (PAID ONLY)
    // --------------------------------------------------
    const statusAgg = await Order.aggregate([
      { $match: { status: "paid", "items.sellerId": sellerObjectId } },
      { $unwind: "$items" },
      {
        $match: {
          "items.sellerId": sellerObjectId,
          "items.status": { $ne: "Cancelled" },
        },
      },
      {
        $group: {
          _id: "$items.status",
          count: { $sum: 1 },
        },
      },
    ]);

    const donutData = statusAgg.map(s => ({
      name: s._id || "Unknown",
      value: s.count,
    }));

    // --------------------------------------------------
    // 5️⃣ Delivered vs Pending (PAID ONLY)
    // --------------------------------------------------
    const deliveredOrders = await Order.countDocuments({
      status: "paid",
      "items.sellerId": sellerObjectId,
      "items.status": "Delivered",
    });

    const pendingOrders = await Order.countDocuments({
      status: "paid",
      "items.sellerId": sellerObjectId,
      "items.status": "Pending",
    });

    const totalRelevantOrders = deliveredOrders + pendingOrders || 1;
    const deliveredPercent = Math.round(
      (deliveredOrders / totalRelevantOrders) * 100
    );

    const deliveredSummary = {
      label: "Orders Delivered",
      value: deliveredOrders,
      percent: deliveredPercent,
      color: "#10b981",
      usd: "",
    };

    // --------------------------------------------------
    // 6️⃣ Seller Performance & Rank (PAID + DELIVERED)
    // --------------------------------------------------
    const sellerRevenueAgg = await Order.aggregate([
      { $match: { status: "paid" } },
      { $unwind: "$items" },
      {
        $match: {
          "items.sellerId": sellerObjectId,
          "items.status": "Delivered",
        },
      },
      {
        $group: {
          _id: null,
          revenue: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
        },
      },
    ]);
    const sellerRevenue = sellerRevenueAgg[0]?.revenue || 0;

    const topSellerAgg = await Order.aggregate([
      { $match: { status: "paid" } },
      { $unwind: "$items" },
      {
        $match: { "items.status": "Delivered" },
      },
      {
        $group: {
          _id: "$items.sellerId",
          revenue: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 1 },
    ]);

    const topSellerId = topSellerAgg[0]?._id?.toString();
    const topSellerRevenue = topSellerAgg[0]?.revenue || 0;
    const isTopSeller = topSellerId === sellerId;

    let rank = "Bronze";
    let nextTier = "Silver";
    let nextThreshold = 1_000_000;

    if (sellerRevenue >= 2_000_000) {
      rank = "Gold";
      nextTier = "Top Seller";
      nextThreshold = topSellerRevenue || 3_000_000;
    } else if (sellerRevenue >= 1_000_000) {
      rank = "Silver";
      nextTier = "Gold";
      nextThreshold = 2_000_000;
    }

    const progressPercent = Math.min(
      Math.round((sellerRevenue / nextThreshold) * 100),
      100
    );

    const sellerPerformance = {
      isTopSeller,
      rank,
      revenue: sellerRevenue,
      topSellerRevenue,
      nextTier,
      nextThreshold,
      progressPercent,
    };

        const seller = await Seller.findById(sellerId).select('followers');
        const totalFollowers = seller?.followers?.length || 0;

  const followersDonut = [
  { name: "Followers", value: totalFollowers },
  { name: "Remaining", value: Math.max(0, 100 - totalFollowers) }, // visual padding
];

    
    // --------------------------------------------------
    // 7️⃣ Active Products
    // --------------------------------------------------
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

    return NextResponse.json({
      stats,
      salesData,
      donutData,
      summary,
      activeProductsSummary: [deliveredSummary],
      sellerPerformance,
    });
  } catch (err) {
    console.error("Dashboard metrics error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
