import mongoose, { Schema, Document, Types } from 'mongoose';

export interface InstallmentDoc extends Document {
  buyerId: string;
  productId: string;
  sellerId: string;

  totalAmount: number;
  monthlyAmount: number;
  months: number;

  paidAmount: number;
  paidMonths: number;

  status: 'active' | 'completed' | 'defaulted' | 'pending-deposit';
  depositPaid: boolean;

  orderId?: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
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
      default: 0,
    },

    paidMonths: {
      type: Number,
      default: 0,
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

    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Installment ||
  mongoose.model<InstallmentDoc>('Installment', InstallmentSchema);
