import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
  type: String,
  required: true,
  unique: true,
  trim: true,
  lowercase: true,
},
  image: { type: String, default: null },
  role: { type: String, enum: ['buyer', 'seller'], default: 'buyer' },
  phoneNumber: {
  type: String,
  default: null, 
},
password: {
  type: String,
  required: function () {
    return this.provider === 'email';
  },
},
  country: { type: String },
  currency: { type: String },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', userSchema);
