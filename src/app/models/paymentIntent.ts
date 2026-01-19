// models/PaymentIntent.ts
import mongoose from 'mongoose';

const PaymentIntentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ['mpesa', 'airtel', 'npay'], required: true },

    purpose: {
      type: String,
      enum: [
        'order',
        'installment-deposit',
        'installment-monthly',
        'wallet',
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

    // ✅ MUST MATCH WHAT YOU USE
    checkoutRequestId: {
      type: String,
      index: true,
    },

    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

export default mongoose.models.PaymentIntent ||
  mongoose.model('PaymentIntent', PaymentIntentSchema);
