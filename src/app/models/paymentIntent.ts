import mongoose, { Schema, Types, Model } from 'mongoose';

export interface IPaymentIntent {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  amount: number;
  method: 'mpesa' | 'airtel' | 'npay';
  processed: boolean;
  purpose: 'order' | 'installment-deposit' | 'installment-monthly' | 'wallet' |'shop-upgrade';
  refId: string;
  status: 'pending' | 'paid' | 'failed';
  checkoutRequestId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentIntentSchema = new Schema<IPaymentIntent>(
  {
    userId: { type: Schema.Types.ObjectId, required: true },
    amount: { type: Number, required: true },

    method: {
      type: String,
      enum: ['mpesa', 'airtel', 'npay'],
      required: true,
    },
    processed: {
      type: Boolean,
      default: false,
    },
    purpose: {
      type: String,
      enum: [
        'order',
        'installment-deposit',
        'installment-monthly',
        'wallet',
        'shop-upgrade',
      ],
      required: true,
    },

    refId: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },

    checkoutRequestId: {
      type: String,
      index: true,
    },
  },
  { timestamps: true }
);

const PaymentIntent: Model<IPaymentIntent> =
  mongoose.models.PaymentIntent ||
  mongoose.model<IPaymentIntent>('PaymentIntent', PaymentIntentSchema);

export default PaymentIntent;
