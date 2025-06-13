// --- models/Transaction.ts ---
import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  phone: Number,
  amount: Number,
  merchantRequestId: String,
  checkoutRequestId: String,
  mpesaReceiptNumber: String,
  transactionDate: String,
  status: { type: String, default: 'Success' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
