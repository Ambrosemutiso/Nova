import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Transaction from "@/app/models/sellerTransaction";
import WithdrawRequest from "@/app/models/withdrawRequest";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { sellerId, filter } = await req.json();

    const dateFilter: any = {};
    const now = new Date();

    // Apply filter range
    if (filter === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      dateFilter.date = { $gte: weekAgo };
    } else if (filter === "month") {
      const monthAgo = new Date();
      monthAgo.setMonth(now.getMonth() - 1);
      dateFilter.date = { $gte: monthAgo };
    }

    const matchBase = { sellerId, status: "success", ...dateFilter };

    // Total Sales
    const totalSales = await Transaction.aggregate([
      { $match: { ...matchBase, type: "credit" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // Total Withdrawn
    const totalWithdrawn = await WithdrawRequest.aggregate([
      { $match: { sellerId, status: "approved", ...dateFilter } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // Pending Withdrawals
    const pending = await WithdrawRequest.aggregate([
      { $match: { sellerId, status: "pending", ...dateFilter } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    return NextResponse.json({
      totalSales: totalSales[0]?.total || 0,
      totalWithdrawn: totalWithdrawn[0]?.total || 0,
      pendingWithdrawals: pending[0]?.total || 0,
    });
  } catch (error) {
    console.error("Finance Summary Error:", error);
    return NextResponse.json({ error: "Failed to load summary" }, { status: 500 });
  }
}
