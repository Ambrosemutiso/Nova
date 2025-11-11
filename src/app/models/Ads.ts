import mongoose, { Schema } from 'mongoose';

const AdSchema = new Schema({
  sellerId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  mediaUrl: { type: String, required: true }, // video or image
  mediaType: { type: String, enum: ['video', 'image'], required: true },
  thumbnailUrl: { type: String }, // optional for video previews
  category: { type: String, required: true },
  country: { type: String }, // optional targeting
  views: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Ad || mongoose.model('Ad', AdSchema);
