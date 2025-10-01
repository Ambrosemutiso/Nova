import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  image: String,
  role: { type: String, enum: ['buyer', 'seller'], default: 'buyer' },
  phoneNumber: {
  type: String,
  default: null,   // default explicitly to null
},
  country: { type: String },
  currency: { type: String },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', userSchema);
