import { NextRequest, NextResponse } from "next/server";
import WithdrawRequest from "@/app/models/withdrawRequest";
import { initiateB2CPayment } from "@/lib/mpesab2c";
import {dbConnect} from "@/lib/dbConnect";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();

    const { status } = await req.json();
    const request = await WithdrawRequest.findById(params.id);

    if (!request) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    if (status === "approved") {
      const mpesaResponse = await initiateB2CPayment(
        request.phoneNumber,
        request.amount
      );

      request.status = "approved";
      await request.save();

      return NextResponse.json({
        message: "Withdrawal approved & B2C initiated",
        mpesaResponse,
      });
    }

    if (status === "rejected") {
      request.status = "rejected";
      await request.save();

      return NextResponse.json({ message: "Withdrawal rejected" });
    }

    return NextResponse.json(
      { message: "Invalid status provided" },
      { status: 400 }
    );

  } catch (error: any) {
    console.error("Error processing withdrawal:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
