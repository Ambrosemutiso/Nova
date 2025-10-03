import { NextResponse } from "next/server";
import {dbConnect} from "@/lib/dbConnect"; // adjust path
import Seller from "@/app/models/seller";   // your seller model

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();

    console.log("📩 M-Pesa Callback:", JSON.stringify(body, null, 2));

    const stkCallback = body.Body?.stkCallback;

    if (!stkCallback) {
      return NextResponse.json({ success: false, error: "Invalid callback data" }, { status: 400 });
    }

    const resultCode = stkCallback.ResultCode;
    const resultDesc = stkCallback.ResultDesc;
    const checkoutRequestId = stkCallback.CheckoutRequestID;

    // 🔹 Transaction successful
    if (resultCode === 0) {
      const metadata = stkCallback.CallbackMetadata?.Item || [];
      const phoneItem = metadata.find((item: any) => item.Name === "PhoneNumber");
      const amountItem = metadata.find((item: any) => item.Name === "Amount");
      const mpesaCodeItem = metadata.find((item: any) => item.Name === "MpesaReceiptNumber");

      const phone = phoneItem?.Value;
      const amount = amountItem?.Value;
      const receipt = mpesaCodeItem?.Value;

      console.log(`✅ Payment confirmed for ${phone}, amount: ${amount}, receipt: ${receipt}`);

      // 🔹 Find seller by phone number
      const seller = await Seller.findOne({ phone });
      if (seller) {
        seller.plan = "premium"; // or "basic" depending on amount
        seller.planActivatedAt = new Date();
        seller.paymentInfo = {
          receipt,
          amount,
          checkoutRequestId,
          gateway: "mpesa",
        };
        await seller.save();
      }

      return NextResponse.json({
        success: true,
        message: "Payment processed and seller upgraded",
      });
    }

    // 🔹 Payment failed
    console.log(`❌ Payment failed: ${resultDesc}`);
    return NextResponse.json(
      { success: false, error: resultDesc },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("Callback error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
