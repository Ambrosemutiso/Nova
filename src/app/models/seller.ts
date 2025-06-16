// models/Seller.js
import mongoose from 'mongoose';

const SellerSchema = new mongoose.Schema({
  name: String,
  logo: String,
  isVerified: { type: Boolean, default: false },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  rating: {
    type: Number,
    default: 0,
  },
  totalSales: {
    type: Number,
    default: 0,
  },
  shopImage: String,
}, { timestamps: true });

export default mongoose.models.Seller || mongoose.model('Seller', SellerSchema);

