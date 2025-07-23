import mongoose from 'mongoose';

const sellerSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  image: String,
  role: { type: String, enum: ['seller'], default: 'seller' },
  shopName: String,
  followers: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      followedAt: Date,
    },
  ],
  shop: {
    isActive: { type: Boolean, default: false },
    activatedAt: Date,
    expiresAt: Date,
    amountPaid: Number,
    transactionId: String,
  },
  subscription: {
    type: {
      type: String,
      enum: ['basic', 'premium'],
      default: 'basic',
    },
    totalPaid: {
      type: Number,
      default: 0,
    },
    lastPaymentDate: Date,
  },
  createdAt: { type: Date, default: Date.now },
});

const Seller = mongoose.models.Seller || mongoose.model('Seller', sellerSchema);
export default Seller;
