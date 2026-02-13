import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/dbConnect";
import PaymentIntent from "@/app/models/paymentIntent";
import Wallet from "@/app/models/wallet";
import Order from "@/app/models/orders";
import { initiateSTKPush } from "@/lib/mpesa"; // ✅ changed

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const {
      phone,
      method,
      amount,
      userId,
      purpose,
      refId,
      items,
      deliveryFee,
      county,
      town,
    } = await req.json();

    if (!phone || !amount || !userId || !method || !purpose || !refId) {
      return NextResponse.json(
        { message: "Missing required payment fields" },
        { status: 400 }
      );
    }

    let normalizedRefId: string;

    /* ===============================
       💰 WALLET
    ================================ */
    if (purpose === "wallet") {
      let wallet = await Wallet.findOne({ userId: refId });

      if (!wallet) {
        wallet = await Wallet.create({
          userId: new mongoose.Types.ObjectId(refId),
          balance: 0,
        });
      }

      normalizedRefId = wallet._id.toString();
    }

    /* ===============================
       📆 INSTALLMENT
    ================================ */
    else if (purpose === "installment-monthly") {
      normalizedRefId = refId;
    }

    /* ===============================
       📆 SHOP-UPGRADE
    ================================ */
    else if (purpose === "shop-upgrade") {
      normalizedRefId = refId;
    }

    /* ===============================
       🛒 ORDER
    ================================ */
    else if (purpose === "order") {
      if (!items || !county || !town) {
        return NextResponse.json(
          { message: "Missing order details" },
          { status: 400 }
        );
      }

      const order = await Order.create({
        userId,
        items,
        deliveryFee,
        totalAmount: amount,
        customerInfo: { county, town, phone },
        paymentStatus: "pending",
      });

      normalizedRefId = order._id.toString();
    }

    /* ===============================
       ❌ INVALID PURPOSE
    ================================ */
    else {
      return NextResponse.json(
        { message: "Invalid payment purpose" },
        { status: 400 }
      );
    }

    /* ===============================
       💳 CREATE PAYMENT INTENT
    ================================ */
    const paymentIntent = await PaymentIntent.create({
      userId,
      amount,
      method,
      purpose,
      refId: normalizedRefId,
      status: "pending",
    });

    /* ===============================
       📲 NCBA STK PUSH
    ================================ */
    if (method === "mpesa") {
      const stk = await initiateSTKPush({
        phone,
        amount,
        accountReference: `PAY-${paymentIntent._id}`,
      });

      // 🔥 NCBA returns TransactionID
      if (!stk?.transactionId) {
        paymentIntent.status = "failed";
        await paymentIntent.save();

        return NextResponse.json(
          { message: "Failed to initiate STK push" },
          { status: 500 }
        );
      }

      // ✅ Store NCBA TransactionID
      paymentIntent.transactionId = stk.transactionId;
      await paymentIntent.save();
    }

    return NextResponse.json({
      success: true,
      paymentIntentId: paymentIntent._id,
      refId: normalizedRefId,
    });
  } catch (error) {
    console.error("[PAYMENT INITIATE ERROR]", error);
    return NextResponse.json(
      { message: "Payment initiation failed" },
      { status: 500 }
    );
  }
}
