import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  isActive: { type: Boolean, default: false },
  activatedAt: { type: Date },
  expiresAt: { type: Date },
  amountPaid: { type: Number },
  transactionId: { type: String }
}, { _id: false }); // _id disabled because it's a subdocument

const sellerSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, unique: true },
  image: { type: String },
  role: { type: String, enum: ['seller'], default: 'seller' },
  shopName: { type: String },
  followers: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      followedAt: { type: Date },
    }
  ],
  shop: {
    basic: { type: subscriptionSchema, default: undefined },
    premium: { type: subscriptionSchema, default: undefined },
  },
  createdAt: { type: Date, default: Date.now },
});

const Seller = mongoose.models.Seller || mongoose.model('Seller', sellerSchema);
export default Seller;
