import mongoose, { Schema, Types } from 'mongoose';

const WalletTransactionSchema = new Schema(
  {
    walletId: {
      type: Schema.Types.ObjectId,
      ref: 'Wallet',
      required: true,
      index: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ['credit', 'debit'],
      required: true,
    },

    source: {
      type: String,
      enum: ['payment', 'order', 'refund', 'admin'],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentIntentId: {
      type: Schema.Types.ObjectId,
      ref: 'PaymentIntent',
      index: true,
    },

    refId: {
      type: String,
    },

    status: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },

    balanceBefore: {
      type: Number,
      required: true,
    },

    balanceAfter: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.WalletTransaction ||
  mongoose.model('WalletTransaction', WalletTransactionSchema);
