import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  message: { type: String, required: true },
  userType: { type: String, enum: ['buyer', 'seller', 'admin'], required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
