import mongoose, { Schema, Types } from 'mongoose';

export interface IWallet {
  userId: Types.ObjectId;
  balance: number; // Nova Coins (NC)
  pinHash?: string; // bcrypt hash
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema = new Schema<IWallet>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      unique: true,
      required: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
    pinHash: {
      type: String,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Wallet ||
  mongoose.model<IWallet>('Wallet', WalletSchema);
