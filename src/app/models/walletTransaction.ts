import mongoose, { Schema, Types, Model } from 'mongoose';

export interface IWalletTransaction {
  _id: Types.ObjectId;
  walletId: Types.ObjectId;
  amount: number;
  type: 'credit' | 'debit';
  purpose:
    | 'order'
    | 'wallet'
    | 'refund'
    | 'installment-deposit'
    | 'installment-monthly';
  refId: string;
  status: 'pending' | 'paid' | 'failed';
  processed: boolean;
  balanceBefore: number;
  balanceAfter: number;
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

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    type: {
      type: String,
      enum: ['credit', 'debit'],
      required: true,
      index: true,
    },

    purpose: {
      type: String,
      enum: [
        'order',
        'wallet',
        'refund',
        'installment-deposit',
        'installment-monthly',
      ],
      required: true,
    },

    refId: {
      type: String,
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
      index: true,
    },

    processed: {
      type: Boolean,
      default: false,
      index: true,
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

const WalletTransaction: Model<IWalletTransaction> =
  mongoose.models.WalletTransaction ||
  mongoose.model<IWalletTransaction>(
    'WalletTransaction',
    WalletTransactionSchema
  );

export default WalletTransaction;
