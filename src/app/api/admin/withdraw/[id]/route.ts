import { NextRequest, NextResponse } from "next/server";
import WithdrawRequest from "@/app/models/withdrawRequest";
import {dbConnect} from "@/lib/dbConnect";
import { initiateB2CPayment } from "@/lib/mpesab2c";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {

  try {
    await dbConnect();
    const { status } = await req.json();

    const request = await WithdrawRequest.findById(params.id);
    if (!request) return NextResponse.json({ message: "Not Found" }, { status: 404 });

    if (status === "approved") {
      const mpesa = await initiateB2CPayment(request.phoneNumber, request.amount);
      request.status = "approved";
      await request.save();
      return NextResponse.json({ message: "Approved & B2C initiated", mpesa });
    }

    if (status === "rejected") {
      request.status = "rejected";
      await request.save();
      return NextResponse.json({ message: "Withdrawal rejected" });
    }

    return NextResponse.json({ message: "Invalid status" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
