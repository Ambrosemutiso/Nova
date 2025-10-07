import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Transaction from "@/app/models/sellerTransaction";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { sellerId } = await req.json();

    const transactions = await Transaction.find({ sellerId })
      .sort({ date: -1 })
      .limit(20)
      .lean();

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("Transaction Fetch Error:", error);
    return NextResponse.json({ error: "Failed to load transactions" }, { status: 500 });
  }
}
