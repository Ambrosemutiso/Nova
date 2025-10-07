import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller" },
  orderId: String,
  amount: Number,
  method: String,
  type: { type: String, enum: ["credit", "debit"], required: true },
  status: { type: String, enum: ["success", "pending", "failed"], default: "pending" },
  date: { type: Date, default: Date.now },
});

export default mongoose.models.Transaction || mongoose.model("Transaction", transactionSchema);
