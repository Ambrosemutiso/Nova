import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Firebase UID
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  image: String,
  role: { type: String, enum: ['buyer', 'seller'], default: 'buyer' },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', userSchema);
