import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema({
  affiliateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Affiliate',
    required: true,
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true,
  },
  name: { type: String }, 
  shopName: { type: String }, 
  plan: {
    type: String,
    enum: ['basic', 'premium', 'free'],
    required: true,
  },
  commission: { type: Number, required: true },

  status: {
    type: String,
    enum: ['Pending', 'Paid', 'Rejected'],
    default: 'Pending',
  },

  date: { type: Date, default: Date.now },
  paidAt: { type: Date },
  verifiedBy: { type: String }, 
});

const Referral =
  mongoose.models.Referral || mongoose.model('Referral', referralSchema);

export default Referral;
