import mongoose from 'mongoose';

const sellerSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, unique: true },
  image: { type: String }, // You can still keep this if needed for profile
  logo: { type: String }, // NEW: logo for shop header
  banner: { type: String }, // NEW: banner image for shop header
  role: { type: String, enum: ['seller'], default: 'seller' },
  shopName: { type: String },
  isVerified: { type: Boolean, default: false }, // NEW: verification badge
  followers: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      followedAt: { type: Date },
    }
  ],
  shop: {
    isActive: { type: Boolean, default: false },
    activatedAt: { type: Date },
    expiresAt: { type: Date },
    amountPaid: { type: Number },
    transactionId: { type: String }
  },
  createdAt: { type: Date, default: Date.now },
});

const Seller = mongoose.models.Seller || mongoose.model('Seller', sellerSchema);
export default Seller;
