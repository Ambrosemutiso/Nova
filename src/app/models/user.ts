import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  currency: { type: String, default: 'USD' },
  country: { type: String, default: 'US' },
  language: { type: String, default: 'en' },
}, { _id: false });

const userSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  image: String,
  role: { type: String, enum: ['buyer', 'seller'], default: 'buyer' },

  settings: { type: settingsSchema, default: () => ({}) },

}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', userSchema);
