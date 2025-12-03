import { NextResponse } from "next/server";
import WithdrawRequest from "@/app/models/withdrawRequest";
import {dbConnect} from "@/lib/dbConnect";

export async function GET() {
  try {
    await dbConnect();
    const requests = await WithdrawRequest.find().populate("sellerId");
    return NextResponse.json(requests);
  } catch (error: any) {
    console.error("Error fetching withdrawal requests:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
