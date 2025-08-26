import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import WithdrawRequest from "@/app/models/withdrawRequest";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const requests = await WithdrawRequest.find().populate(
      "sellerId",
      "name shopName email"
    );

    return NextResponse.json(requests, { status: 200 });
  } catch (error) {
    console.error("Error fetching withdrawal requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch withdrawal requests" },
      { status: 500 }
    );
  }
}
