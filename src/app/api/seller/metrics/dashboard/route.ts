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

    // --------------------------------------------------
    // 1️⃣ Monthly Sales + Completed Orders (DELIVERED + PAID)
    // --------------------------------------------------
    const monthlyAgg = await Order.aggregate([
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
    // 2️⃣ Product Views (monthly)
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
      const sales = monthlyAgg.find(x => x._id.month === m);
      const views = monthlyViews.find(x => x._id.month === m);

      return {
        month: m,
        sales: Number(sales?.sales) || 0,
        orders: Number(sales?.orders) || 0,
        views: Number(views?.views) || 0,
      };
    });

    // --------------------------------------------------
    // 3️⃣ Total Completed Orders + Revenue
    // --------------------------------------------------
    const totalsAgg = await Order.aggregate([
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
          orders: { $sum: 1 },
          revenue: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
        },
      },
    ]);

    const totalOrders = totalsAgg[0]?.orders || 0;
    const totalRevenue = totalsAgg[0]?.revenue || 0;

    // --------------------------------------------------
    // 4️⃣ Order Item Status Breakdown (PAID ONLY)
    // --------------------------------------------------
    const statusAgg = await Order.aggregate([
      { $match: { status: "paid" } },
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
      name: s._id,
      value: s.count,
    }));

    // --------------------------------------------------
    // 5️⃣ Delivered vs Pending (ITEM-BASED)
    // --------------------------------------------------
    const delivered = statusAgg.find(s => s._id === "Delivered")?.count || 0;
    const pending = statusAgg.find(s => s._id === "Pending")?.count || 0;

    const totalRelevant = delivered + pending || 1;
    const deliveredPercent = Math.round((delivered / totalRelevant) * 100);

    const deliveredSummary = {
      label: "Orders Delivered",
      value: delivered,
      percent: deliveredPercent,
      color: "#10b981",
    };

    // --------------------------------------------------
    // 6️⃣ Seller Performance (Delivered Revenue)
    // --------------------------------------------------
    const sellerRevenue = totalRevenue;

    const topSellerAgg = await Order.aggregate([
      { $match: { status: "paid" } },
      { $unwind: "$items" },
      { $match: { "items.status": "Delivered" } },
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

    const sellerPerformance = {
      isTopSeller: topSellerId === sellerId,
      rank,
      revenue: sellerRevenue,
      nextTier,
      nextThreshold,
      progressPercent: Math.min(
        Math.round((sellerRevenue / nextThreshold) * 100),
        100
      ),
    };

    // --------------------------------------------------
    // 7️⃣ Followers + Products
    // --------------------------------------------------
    const seller = await Seller.findById(sellerId).select("followers");
    const followersCount = seller?.followers?.length || 0;

    const totalProducts = await Product.countDocuments({ sellerId });
    const activeProducts = await Product.countDocuments({
      sellerId,
      quantity: { $gt: 0 },
    });

    return NextResponse.json({
      salesData,
      donutData,
      summary: [
        {
          label: "Active Products",
          value: activeProducts,
          percent: totalProducts
            ? Math.round((activeProducts / totalProducts) * 100)
            : 0,
          color: "#3b82f6",
        },
        deliveredSummary,
      ],
      sellerPerformance,
      followersDonut: [
        { name: "Followers", value: followersCount },
        { name: "Remaining", value: Math.max(0, 100 - followersCount) },
      ],
      stats: [
        {
          id: "orders",
          title: "Completed Orders",
          value: totalOrders.toLocaleString(),
          icon: "ShoppingCart",
          trend: "up",
          change: "+8%",
          series: salesData.map(d => ({ v: d.orders })),
        },
        {
          id: "sales",
          title: "Total Sales",
          value: `Ksh ${totalRevenue.toLocaleString()}`,
          icon: "DollarSign",
          trend: "up",
          change: "+5%",
          series: salesData.map(d => ({ v: d.sales })),
        },
        {
          id: "visits",
          title: "Total Views",
          value: salesData.reduce((a, b) => a + b.views, 0).toLocaleString(),
          icon: "Eye",
          trend: "up",
          change: "+3%",
          series: salesData.map(d => ({ v: d.views })),
        },
      ],
    });
  } catch (err) {
    console.error("Dashboard metrics error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
