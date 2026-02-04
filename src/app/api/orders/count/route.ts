import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Order from "@/app/models/orders";
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

    // --------------------------------------------------
    // Completed vs Pending (ITEM-BASED)
    // --------------------------------------------------
    const statusAgg = await Order.aggregate([
      { $match: { status: "paid" } },
      { $unwind: "$items" },
      {
        $match: {
          "items.sellerId": sellerObjectId,
          "items.status": { $in: ["Delivered", "Pending"] },
        },
      },
      {
        $group: {
          _id: "$items.status",
          count: { $sum: 1 },
        },
      },
    ]);

    const delivered = statusAgg.find(s => s._id === "Delivered")?.count || 0;
    const pending = statusAgg.find(s => s._id === "Pending")?.count || 0;

    return NextResponse.json({
      deliveredOrders: delivered,
      pendingOrders: pending,
      totalActiveOrders: delivered + pending,
    });
  } catch (err) {
    console.error("Error counting orders:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
