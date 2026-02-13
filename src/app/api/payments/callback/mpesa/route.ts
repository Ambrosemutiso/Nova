import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import PaymentIntent from "@/app/models/paymentIntent";
import Order from "@/app/models/orders";
import Installment from "@/app/models/InstallmentOrder";
import Wallet from "@/app/models/wallet";
import WalletTransaction from "@/app/models/walletTransaction";
import { querySTK } from "@/lib/mpesa";
import { notifyClient } from "@/lib/paymentStream";

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const { paymentIntentId } = await req.json();

    const paymentIntent = await PaymentIntent.findById(paymentIntentId);

    if (!paymentIntent || !paymentIntent.transactionId) {
      return NextResponse.json(
        { message: "Payment not found" },
        { status: 404 }
      );
    }

    // 🔎 Query NCBA
    const result = await querySTK(paymentIntent.transactionId);

    if (result.status === "FAILED") {
      paymentIntent.status = "failed";
      await paymentIntent.save();

      notifyClient(paymentIntent._id.toString(), {
        status: "failed",
      });

      return NextResponse.json({ status: "failed" });
    }

    if (result.status !== "SUCCESS") {
      return NextResponse.json({ status: "pending" });
    }

    // ✅ Idempotency
    if (paymentIntent.status === "paid") {
      return NextResponse.json({ status: "paid" });
    }

    paymentIntent.status = "paid";
    await paymentIntent.save();

    /* ===============================
       BUSINESS LOGIC
    ================================ */

    switch (paymentIntent.purpose) {

      case "installment-monthly": {
        const inst = await Installment.findById(paymentIntent.refId);
        if (!inst) break;

        const paidAmount =
          Number(inst.paidAmount ?? 0) + Number(paymentIntent.amount ?? 0);

        const isCompleted = paidAmount >= inst.totalAmount;

        await Installment.findByIdAndUpdate(paymentIntent.refId, {
          paidAmount,
          status: isCompleted ? "completed" : inst.status,
        });

        break;
      }

      case "wallet": {
        const wallet = await Wallet.findById(paymentIntent.refId);
        if (!wallet) break;

        wallet.balance += paymentIntent.amount;
        await wallet.save();

        await WalletTransaction.create({
          walletId: wallet._id,
          userId: wallet.userId,
          type: "credit",
          purpose: "wallet",
          status: "paid",
          amount: paymentIntent.amount,
          label: "Wallet top-up",
          reference: paymentIntent.transactionId,
          balanceAfter: wallet.balance,
        });

        break;
      }

            case 'order': {
        await Order.findByIdAndUpdate(
          paymentIntent.refId,
          {
            status: 'paid',
            paymentInfo: {
              method: 'mpesa',
              receipt: paymentIntent.transactionId,
              paidAt: new Date(),
            },
          },
        );
        break;
      }

case 'shop-upgrade': {
  const Seller = (await import('@/app/models/seller')).default;

  const seller = await Seller.findById(paymentIntent.refId);
  if (!seller) break;

  const amount = paymentIntent.amount;

  let newPlan: 'basic' | 'premium' = 'basic';

  if (amount >= 3000 || (seller.shop?.plan === 'basic' && amount >= 1700)) {
    newPlan = 'premium';
  }

  const now = new Date();
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  await Seller.findByIdAndUpdate(seller._id, {
    $set: {
      'shop.isActive': true,
      'shop.activatedAt': now,
      'shop.expiresAt': expiresAt,
      'shop.plan': newPlan,
    },
    $inc: {
      'shop.amountPaid': amount,
    },
  });

  break;
}
    }

    notifyClient(paymentIntent._id.toString(), {
      status: "paid",
      amount: paymentIntent.amount,
    });

    return NextResponse.json({ status: "paid" });
  } catch (err) {
    console.error("[NCBA STATUS ERROR]", err);
    return NextResponse.json(
      { message: "Status check failed" },
      { status: 500 }
    );
  }
}
