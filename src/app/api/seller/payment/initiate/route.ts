import { NextRequest, NextResponse } from "next/server";
import Seller from "@/app/models/seller";
import {dbConnect} from "@/lib/dbConnect";
import { initiateMpesaPush, initiateAirtelPush } from "@/lib/payments";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { sellerId, plan, method, phone, amount } = body;

    if (!sellerId || !plan || !method || !phone || !amount) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Call respective payment provider
    let txResult;
    if (method === "mpesa") {
      txResult = await initiateMpesaPush(phone, amount);
    } else if (method === "airtel") {
      txResult = await initiateAirtelPush(phone, amount);
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid payment method" },
        { status: 400 }
      );
    }

    if (!txResult.success) {
      return NextResponse.json(
        { success: false, error: txResult.error },
        { status: 500 }
      );
    }

    // Calculate expiry
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    // Update seller record
    const seller = await Seller.findByIdAndUpdate(
      sellerId,
      {
        $set: {
          "shop.isActive": true,
          "shop.plan": plan,
          "shop.amountPaid": amount,
          "shop.transactionId": txResult.transactionId,
          "shop.activatedAt": new Date(),
          "shop.expiresAt": expiryDate,
        },
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      transactionId: txResult.transactionId,
      shopExpiry: seller?.shop?.expiresAt,
    });
  } catch (error: any) {
    console.error("Payment error:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
