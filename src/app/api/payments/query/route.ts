import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/dbConnect";
import PaymentIntent from "@/app/models/paymentIntent";
import { querySTK } from "@/lib/mpesa";
import { processPaymentSuccess } from "@/lib/processFullPayment";
import { notifyClient } from "@/lib/paymentStream";

export async function POST(req: NextRequest) {
  await dbConnect();

  const session = await mongoose.startSession();

  try {
    const { paymentIntentId } = await req.json();

    if (!paymentIntentId) {
      return NextResponse.json(
        { message: "paymentIntentId is required" },
        { status: 400 }
      );
    }

    const paymentIntent = await PaymentIntent.findById(paymentIntentId);

    if (!paymentIntent || !paymentIntent.transactionId) {
      return NextResponse.json(
        { message: "Payment not found" },
        { status: 404 }
      );
    }

    // 🔒 If already resolved, don't reprocess
    if (paymentIntent.status === "paid") {
      return NextResponse.json({ status: "paid" });
    }

    if (paymentIntent.status === "failed") {
      return NextResponse.json({ status: "failed" });
    }

    // 🔎 Query NCBA
    const result = await querySTK(paymentIntent.transactionId);

    if (!result || result.error) {
      return NextResponse.json({ status: "pending" });
    }

    /* ===============================
       ❌ FAILED
    ================================ */
    if (result.status === "FAILED") {
      paymentIntent.status = "failed";
      await paymentIntent.save();

      notifyClient(paymentIntent._id.toString(), {
        status: "failed",
      });

      return NextResponse.json({ status: "failed" });
    }

    /* ===============================
       ⏳ STILL PENDING
    ================================ */
    if (result.status !== "SUCCESS") {
      return NextResponse.json({ status: "pending" });
    }

    /* ===============================
       ✅ SUCCESS (ATOMIC TRANSACTION)
    ================================ */
    await session.withTransaction(async () => {
      const pi = await PaymentIntent.findById(paymentIntentId).session(session);

      if (!pi) throw new Error("PaymentIntent missing");

      // Double protection against race condition
      if (pi.status === "paid") return;

      pi.status = "paid";
      pi.updatedAt = new Date();
      await pi.save({ session });

      await processPaymentSuccess(pi, session);
    });

    notifyClient(paymentIntent._id.toString(), {
      status: "paid",
      amount: paymentIntent.amount,
    });

    return NextResponse.json({ status: "paid" });

  } catch (error) {
    console.error("[NCBA QUERY ERROR]", error);

    return NextResponse.json(
      { message: "Status check failed" },
      { status: 500 }
    );
  } finally {
    session.endSession();
  }
}
