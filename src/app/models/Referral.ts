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
  name: { type: String }, // Seller’s name
  shopName: { type: String }, // Seller’s shop
  plan: {
    type: String,
    enum: ['basic', 'premium', 'free'],
    required: true,
  },
  commission: { type: Number, required: true },

  // 👇 Status flags for payout tracking
  status: {
    type: String,
    enum: ['Pending', 'Paid', 'Rejected'],
    default: 'Pending',
  },

  // 👇 Optional audit fields
  date: { type: Date, default: Date.now },
  paidAt: { type: Date },
  verifiedBy: { type: String }, // optional admin user who approved payout
});

const Referral =
  mongoose.models.Referral || mongoose.model('Referral', referralSchema);

export default Referral;
