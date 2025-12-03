import { NextResponse } from "next/server";
import Withdrawal from "@/app/models/withdrawRequest";
import {dbConnect} from "@/lib/dbConnect";
import { initiateB2CPayment } from "@/lib/mpesab2c";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();

    const { status } = await req.json();
    const withdrawal = await Withdrawal.findById(params.id);

    if (!withdrawal) {
      return NextResponse.json(
        { message: "Withdrawal request not found" },
        { status: 404 }
      );
    }

    // APPROVE → trigger B2C payment
    if (status === "Approved") {
      const mpesaResponse = await initiateB2CPayment(
        withdrawal.phone, // affiliate field
        withdrawal.amount
      );

      withdrawal.status = "Approved";
      withdrawal.processedAt = new Date();
      await withdrawal.save();

      return NextResponse.json({
        message: "Affiliate withdrawal approved and B2C initiated",
        mpesaResponse,
      });
    }

    // REJECT
    if (status === "Rejected") {
      withdrawal.status = "Rejected";
      withdrawal.processedAt = new Date();
      await withdrawal.save();

      return NextResponse.json({
        message: "Affiliate withdrawal rejected",
      });
    }

    return NextResponse.json(
      { message: "Invalid status" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Affiliate Withdraw Update Error:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
