// models/PaymentIntent.ts
import mongoose from 'mongoose';

const PaymentIntentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ['mpesa', 'airtel', 'npay'], required: true },

    purpose: {
      type: String,
      enum: ['order', 'installment-deposit', 'installment-monthly'],
      required: true,
    },

    refId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true, // orderId OR installmentId
    },

    status: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },

    checkoutRequestId: String,
  },
  { timestamps: true }
);

export default mongoose.models.PaymentIntent ||
  mongoose.model('PaymentIntent', PaymentIntentSchema);
