import mongoose from 'mongoose';

const WalletTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    type: {
      type: String,
      enum: ['credit', 'debit'],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    method: {
      type: String,
      enum: ['MPESA', 'N-PAY', 'WITHDRAW'],
      required: true,
    },

    reference: String, // orderId, mpesaReceipt, etc

    description: String,

    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Failed'],
      default: 'Completed',
    },
  },
  { timestamps: true }
);

export default mongoose.models.WalletTransaction ||
  mongoose.model('WalletTransaction', WalletTransactionSchema);
