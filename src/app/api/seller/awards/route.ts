import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/dbConnect";
import Order from "@/app/models/orders";
import Seller from "@/app/models/seller";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get("sellerId");

    if (!sellerId) {
      return NextResponse.json({ error: "Seller ID is required" }, { status: 400 });
    }

    const sellerObjectId = new mongoose.Types.ObjectId(sellerId);

    // --------------------------------------------------
    // 1️⃣ Aggregate PAID + DELIVERED seller items
    // --------------------------------------------------
    const sellerAgg = await Order.aggregate([
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
          totalSales: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
          deliveredCount: { $sum: 1 },
        },
      },
    ]);

    const totalSales = sellerAgg[0]?.totalSales || 0;
    const deliveredCount = sellerAgg[0]?.deliveredCount || 0;

    // --------------------------------------------------
    // 2️⃣ Total orders (paid orders containing seller items)
    // --------------------------------------------------
    const totalOrders = await Order.countDocuments({
      status: "paid",
      "items.sellerId": sellerObjectId,
    });

    const deliveryRate =
      totalOrders > 0 ? (deliveredCount / totalOrders) * 100 : 0;

    // --------------------------------------------------
    // 3️⃣ Award logic (STRICT & REAL)
    // --------------------------------------------------
    const awards: { title: string; description: string; badge: string }[] = [];

    if (totalSales >= 100_000) {
      awards.push({
        title: "Top Seller Award",
        description: "Achieved over KSh 100,000 in paid & delivered sales.",
        badge: "🥇",
      });
    }

    if (totalSales >= 20_000 && totalSales < 100_000) {
      awards.push({
        title: "Rising Star",
        description: "Strong growth from completed and paid orders.",
        badge: "🌟",
      });
    }

    if (deliveryRate >= 90 && deliveredCount >= 10) {
      awards.push({
        title: "Best Delivery",
        description: "90%+ delivery success on paid orders.",
        badge: "🚚",
      });
    }

    if (deliveredCount >= 50) {
      awards.push({
        title: "Consistency Award",
        description: "50+ completed deliveries.",
        badge: "🔥",
      });
    }

    // --------------------------------------------------
    // 4️⃣ Dynamic Leaderboard (Top 10)
    // --------------------------------------------------
    const leaderboard = await Order.aggregate([
      { $match: { status: "paid" } },
      { $unwind: "$items" },
      { $match: { "items.status": "Delivered" } },
      {
        $group: {
          _id: "$items.sellerId",
          sales: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
        },
      },
      { $sort: { sales: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "sellers",
          localField: "_id",
          foreignField: "_id",
          as: "seller",
        },
      },
      { $unwind: "$seller" },
      {
        $project: {
          sellerId: "$_id",
          shopName: "$seller.shopName",
          name: "$seller.name",
          sales: 1,
        },
      },
    ]);

    // --------------------------------------------------
    // 5️⃣ Seller basic info
    // --------------------------------------------------
    const seller = await Seller.findById(sellerId)
      .select("name shopName")
      .lean();

    return NextResponse.json(
      {
        seller,
        stats: {
          totalSales,
          totalOrders,
          deliveredCount,
          deliveryRate: deliveryRate.toFixed(1),
        },
        awards,
        leaderboard,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Awards route error:", error);
    return NextResponse.json(
      { error: "Server error", details: error.message },
      { status: 500 }
    );
  }
}
