import { NextResponse } from "next/server";
import {dbConnect} from "@/lib/dbConnect";
import Voucher from "@/app/models/voucher";
import Order from "@/app/models/orders";

export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const ordersCount = await Order.countDocuments({ userId });

  const totalOrders = await Order.countDocuments({});
  const percentage =
    totalOrders > 0 ? Math.round((ordersCount / totalOrders) * 100) : 0;

  const topCustomer = await Order.aggregate([
    { $group: { _id: "$userId", 
      totalOrders: { $sum: 1 } 
    } 
  },
    { $sort: { totalOrders: -1 }
   },
    { $limit: 1 },
  ]);
  const isTopCustomer =
    topCustomer.length > 0 && topCustomer[0]._id.toString() === userId;

  const vouchers = await Voucher.find({ userId, status: "active" });

  return NextResponse.json({
    ordersCount,
    percentage,
    isTopCustomer,
    vouchers,
  });
}
