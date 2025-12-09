import mongoose, { Schema, Document } from "mongoose";

export interface InstallmentPaymentDoc extends Document {
  planId: string;
  amount: number;
  phone: string;
  status: "pending" | "success" | "failed";
  merchantRequestId?: string;
  checkoutRequestId?: string;
  mpesaReceipt?: string;
  resultCode?: string;
}

const InstallmentPaymentSchema = new Schema<InstallmentPaymentDoc>(
  {
    planId: { type: String, required: true },
    amount: { type: Number, required: true },
    phone: { type: String, required: true },

    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },

    merchantRequestId: { type: String },
    checkoutRequestId: { type: String },
    mpesaReceipt: { type: String },
    resultCode: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.InstallmentPayment ||
  mongoose.model("InstallmentPayment", InstallmentPaymentSchema);
