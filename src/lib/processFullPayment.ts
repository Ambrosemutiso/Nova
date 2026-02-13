import Order from "@/app/models/orders";
import Installment from "@/app/models/InstallmentOrder";
import Wallet from "@/app/models/wallet";
import WalletTransaction from "@/app/models/walletTransaction";
import { ClientSession } from "mongoose";

export async function processPaymentSuccess(
  paymentIntent: any,
  session: ClientSession
) {
  switch (paymentIntent.purpose) {
    case "order":
      await Order.findByIdAndUpdate(
        paymentIntent.refId,
        {
          status: "paid",
          paidAt: new Date(),
        },
        { session }
      );
      break;

    case "installment-monthly": {
      const inst = await Installment.findById(paymentIntent.refId).session(
        session
      );
      if (!inst) throw new Error("Installment not found");

      const paidAmount =
        Number(inst.paidAmount ?? 0) + Number(paymentIntent.amount ?? 0);

      const isCompleted = paidAmount >= inst.totalAmount;

      await Installment.findByIdAndUpdate(
        paymentIntent.refId,
        {
          paidAmount,
          status: isCompleted ? "completed" : inst.status,
        },
        { session }
      );

      break;
    }

    case "wallet": {
      const wallet = await Wallet.findById(paymentIntent.refId).session(
        session
      );
      if (!wallet) throw new Error("Wallet not found");

      wallet.balance += paymentIntent.amount;
      await wallet.save({ session });

      await WalletTransaction.create(
        [
          {
            walletId: wallet._id,
            userId: wallet.userId,
            type: "credit",
            purpose: "wallet",
            status: "paid",
            amount: paymentIntent.amount,
            label: "Wallet top-up",
            reference: paymentIntent.transactionId,
            balanceAfter: wallet.balance,
          },
        ],
        { session }
      );

      break;
    }

    default:
      throw new Error("Unknown payment purpose");
  }
}
