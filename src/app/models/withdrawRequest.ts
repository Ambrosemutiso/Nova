import mongoose from 'mongoose';

const withdrawRequestSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ['mpesa', 'airtel'], required: true },
  phoneNumber: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.WithdrawRequest || mongoose.model('WithdrawRequest', withdrawRequestSchema);


