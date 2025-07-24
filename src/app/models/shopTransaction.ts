// models/transaction.ts
import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
  phone: String,
  amount: Number,
  subscriptionType: { type: String, enum: ['basic', 'premium'], required: true },
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
  transactionId: String,
  mpesaReceiptNumber: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
