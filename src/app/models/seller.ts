import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    currency: { type: String, default: 'USD' },
    country: { type: String, default: 'US' },
    language: { type: String, default: 'en' },
  },
  { _id: false }
);

const sellerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  image: { type: String },
  logo: { type: String },
  banner: { type: String },
  phoneNumber: {
  type: String,
  default: null,   // default explicitly to null
},
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
  country: { type: String },
  currency: { type: String },
  role: {
    type: String,
    enum: ['seller'],
    default: 'seller',
  },
  shopName: { type: String },
  isVerified: {
    type: Boolean,
    default: false,
  },
  followers: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      followedAt: {
        type: Date,
      },
    },
  ],
  shop: {
    isActive: { type: Boolean, default: false },
    activatedAt: { type: Date },
    expiresAt: { type: Date },
    amountPaid: { type: Number },
    transactionId: { type: String },

    // Auto-flagged plan by amount paid
    plan: {
      type: String,
      enum: ['basic', 'premium', 'free'],
      default: 'free',
    },
  },

  settings: { type: settingsSchema, default: () => ({}) },

  createdAt: { type: Date, default: Date.now },
});

const Seller =
  mongoose.models.Seller || mongoose.model('Seller', sellerSchema);

export default Seller;
