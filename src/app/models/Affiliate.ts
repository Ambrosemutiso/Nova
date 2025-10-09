import mongoose from 'mongoose';

const affiliateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phoneNumber: { type: String, required: true },
  password: { type: String, required: true },

  // 👇 Optional: link profile image if desired
  image: { type: String, default: null },

  // 👇 Performance stats
  totalEarnings: { type: Number, default: 0 },
  pendingPayouts: { type: Number, default: 0 },
  referredSellers: { type: Number, default: 0 },

  // 👇 To quickly reference sellers this affiliate verified
  referredSellerIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seller',
    },
  ],

  // 👇 Account status fields
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  joinedAt: { type: Date, default: Date.now },
});

const Affiliate =
  mongoose.models.Affiliate || mongoose.model('Affiliate', affiliateSchema);

export default Affiliate;
