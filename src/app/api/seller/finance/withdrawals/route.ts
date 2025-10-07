import { NextResponse, NextRequest } from "next/server";
import {dbConnect} from "@/lib/dbConnect";
import WithdrawRequest from "@/app/models/withdrawRequest";

export async function POST(req: NextRequest) {
  await dbConnect();
  const { sellerId } = await req.json();
  const withdrawals = await WithdrawRequest.find({ sellerId }).sort({ date: -1 });
  return NextResponse.json({ withdrawals });
}
