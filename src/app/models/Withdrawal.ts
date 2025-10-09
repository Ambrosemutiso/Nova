import mongoose, { Schema, models, model } from 'mongoose';

const WithdrawalSchema = new Schema(
  {
    affiliateId: {
      type: Schema.Types.ObjectId,
      ref: 'Affiliate',
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    method: {
      type: String,
      enum: ['mpesa', 'airtel'],
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    processedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Withdrawal = models.Withdrawal || model('Withdrawal', WithdrawalSchema);
export default Withdrawal;
