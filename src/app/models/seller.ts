import mongoose from 'mongoose';

const sellerSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  image: String,
  role: { type: String, enum: ['seller'], default: 'seller' },
  shopName: String,
  createdAt: { type: Date, default: Date.now }
});

const Seller = mongoose.models.Seller || mongoose.model('Seller', sellerSchema);
export default Seller;
