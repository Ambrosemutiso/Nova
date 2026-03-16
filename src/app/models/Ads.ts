import mongoose, { Schema } from 'mongoose';

const CommentSchema = new Schema({
  _id: { type: String, required: true }, // generate on frontend or backend
  userId: { type: String, required: true },
  username: { type: String, required: true },
  avatar: { type: String, default: 'https://via.placeholder.com/40' },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  likes: { type: [String], default: [] }, // userIds
  replies: { type: [this], default: [] } // recursive for nested replies
});

const AdSchema = new Schema({
  sellerId: { type: String, required: true },

  productId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },

  title: { type: String, required: true },
  description: String,
  mediaUrl: { type: String, required: true },
  mediaType: { type: String, enum: ['video', 'image'], required: true },

  category: String,
  country: String,

  likes: { type: [String], default: [] },
  comments: { type: [CommentSchema], default: [] },
  views: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Ad || mongoose.model('Ad', AdSchema);
