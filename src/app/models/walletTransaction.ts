import mongoose, { Schema, Types } from 'mongoose';

export interface IWalletTransaction {
  walletId: Types.ObjectId;
  type: 'credit' | 'debit';
  amount: number;
  purpose: 'wallet-topup' | 'withdrawal' | 'order-payment';
  refId?: string;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: Date;
}

const WalletTransactionSchema = new Schema<IWalletTransaction>(
  {
    walletId: {
      type: Schema.Types.ObjectId,
      ref: 'Wallet',
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
    purpose: {
      type: String,
      required: true,
    },
    refId: String,
    balanceBefore: Number,
    balanceAfter: Number,
  },
  { timestamps: true }
);

export default mongoose.models.WalletTransaction ||
  mongoose.model<IWalletTransaction>(
    'WalletTransaction',
    WalletTransactionSchema
  );
