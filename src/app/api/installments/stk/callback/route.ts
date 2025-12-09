import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import InstallmentPayment from "@/app/models/InstallmentPayment";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();
    const callback = body?.Body?.stkCallback;

    const MerchantRequestID = callback.MerchantRequestID;
    const CheckoutRequestID = callback.CheckoutRequestID;
    const ResultCode = callback.ResultCode;
    const ResultDesc = callback.ResultDesc;

    const payment = await InstallmentPayment.findOne({
      checkoutRequestId: CheckoutRequestID,
    });

    if (!payment) {
      return NextResponse.json({ message: "Payment not found" });
    }

    //* SUCCESS
    if (ResultCode === 0) {
      const amount =
        callback.CallbackMetadata?.Item?.find(
          (item: any) => item.Name === "Amount"
        )?.Value || payment.amount;

      payment.status = "success";
      payment.amount = amount;
      payment.resultDesc = ResultDesc;
      await payment.save();
    }

    //* FAILED
    else {
      payment.status = "failed";
      payment.errorMessage = ResultDesc;
      await payment.save();
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("STK Callback Error:", err);
    return NextResponse.json({ error: true });
  }
}
