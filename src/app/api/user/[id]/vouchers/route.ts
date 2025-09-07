import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Order from "@/app/models/orders";
import Voucher from "@/app/models/voucher";

export async function GET(req: Request) {
  await dbConnect();

  try {
    // get userId from query params
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // User orders count
    const userOrdersCount = await Order.countDocuments({ userId });

    // Find top customer (highest order count)
    const topUserAgg = await Order.aggregate([
      { $group: { _id: "$userId", totalOrders: { $sum: 1 } } },
      { $sort: { totalOrders: -1 } },
      { $limit: 1 },
    ]);

    const topUserId = topUserAgg[0]?._id.toString();
    const isTopCustomer = topUserId === userId.toString();

    // Total orders in system (for percentage progress)
    const totalOrders = await Order.countDocuments();
    const percentage =
      totalOrders > 0 ? Math.round((userOrdersCount / totalOrders) * 100) : 0;

    // User vouchers
    const vouchers = await Voucher.find({ userId, status: "active" });

    return NextResponse.json({
      ordersCount: userOrdersCount,
      percentage,
      isTopCustomer,
      vouchers,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
