import mongoose, { Schema, Document } from 'mongoose';

export interface InstallmentDoc extends Document {
  buyerId: string;
  productId: string;
  sellerId: string;
  totalAmount: number;
  monthlyAmount: number;
  months: number;
  paidAmount: number; // ✅ ADD THIS
  status: 'active' | 'completed' | 'defaulted' | 'pending-deposit';
  depositPaid: boolean;

  createdAt: Date;
}

const InstallmentSchema = new Schema<InstallmentDoc>(
  {
    buyerId: { type: String, required: true },
    productId: { type: String, required: true },
    sellerId: { type: String, required: true },

    totalAmount: { type: Number, required: true },
    monthlyAmount: { type: Number, required: true },
    months: { type: Number, required: true },

    paidAmount: {
      type: Number,
      default: 0, // ✅ START FROM 0
    },

    status: {
      type: String,
      enum: ['active', 'completed', 'defaulted', 'pending-deposit'],
      default: 'pending-deposit',
    },

    depositPaid: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Installment ||
  mongoose.model<InstallmentDoc>('Installment', InstallmentSchema);
