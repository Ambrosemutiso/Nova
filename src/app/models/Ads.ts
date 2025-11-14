import mongoose, { Schema } from 'mongoose';

const AdSchema = new Schema({
  sellerId: { type: String, required: true },
  title: { type: String, required: true },
  description: String,
  mediaUrl: { type: String, required: true },
  mediaType: { type: String, enum: ['video', 'image'], required: true },
  thumbnailUrl: String,
  category: String,
  country: String,

  // NEW FIELDS
  likes: { type: Number, default: 0 },
  likedBy: { type: [String], default: [] }, // store userIds

  comments: [
    {
      userId: String,
      username: String,
      text: String,
      createdAt: { type: Date, default: Date.now }
    }
  ],

  views: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Ad || mongoose.model('Ad', AdSchema);
