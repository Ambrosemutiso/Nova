import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Transaction from "@/app/models/sellerTransaction";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { sellerId, filter } = await req.json();

    const now = new Date();
    let rangeStart = new Date();

    if (filter === "week") rangeStart.setDate(now.getDate() - 7);
    else if (filter === "month") rangeStart.setMonth(now.getMonth() - 1);
    else rangeStart.setMonth(now.getMonth() - 3); // default 3 months

    const sales = await Transaction.aggregate([
      {
        $match: {
          sellerId,
          type: "credit",
          status: "success",
          date: { $gte: rangeStart },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          amount: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Format chart data for Recharts
    const chartData = sales.map((s) => ({
      date: s._id,
      sales: s.amount,
    }));

    return NextResponse.json({ chartData });
  } catch (error) {
    console.error("Chart Data Error:", error);
    return NextResponse.json({ error: "Failed to load chart data" }, { status: 500 });
  }
}
