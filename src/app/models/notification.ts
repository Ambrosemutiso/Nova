import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  title: String,
  message: String,
  target: { type: String, enum: ['all', 'buyer', 'seller'], default: 'all' },
  senderRole: { type: String, enum: ['admin', 'buyer', 'seller'], default: 'admin' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
