// app/models/walletTransaction.ts
import mongoose, { Schema, Types, Model } from 'mongoose';

export interface IWalletTransaction {
  _id: Types.ObjectId;
  walletId: Types.ObjectId;
  userId: Types.ObjectId;

  type: 'credit' | 'debit';
  purpose: 'wallet' | 'order' | 'installment-deposit' | 'installment-monthly' | 'withdrawal';

  status: 'pending' | 'paid' | 'failed';

  amount: number;
  balanceAfter: number;

  label: string;
  reference?: string; 

  createdAt: Date;
  updatedAt: Date;
}

const WalletTransactionSchema = new Schema<IWalletTransaction>(
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

    purpose: {
      type: String,
      enum: [
        'wallet',
        'order',
        'installment-deposit',
        'installment-monthly',
        'withdrawal',
      ],
      required: true,
    },

    status: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'paid',
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    balanceAfter: {
      type: Number,
      required: true,
      min: 0,
    },

    label: {
      type: String,
      required: true,
      trim: true,
    },

    reference: {
      type: String,
      index: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

/* ===============================
   🔐 SAFETY: PREVENT DOUBLE CREDIT
================================ */
WalletTransactionSchema.index(
  { reference: 1, type: 1 },
  { unique: true, sparse: true }
);

const WalletTransaction: Model<IWalletTransaction> =
  mongoose.models.WalletTransaction ||
  mongoose.model<IWalletTransaction>(
    'WalletTransaction',
    WalletTransactionSchema
  );

export default WalletTransaction;
