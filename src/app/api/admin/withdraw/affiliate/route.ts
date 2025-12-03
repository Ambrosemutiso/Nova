import Withdrawal from "@/app/models/Withdrawal"; 
import {dbConnect} from "@/lib/dbConnect";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();

    const withdrawals = await Withdrawal.find()
      .populate("affiliateId")
      .sort({ createdAt: -1 });

    return NextResponse.json(withdrawals);
  } catch (error: any) {
    console.error("Affiliate Withdraw GET Error:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
