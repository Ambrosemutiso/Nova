import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "Seller" },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const adSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },
  videoUrl: { type: String, required: true },
  caption: { type: String },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Seller" }],
  comments: [commentSchema],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Ad || mongoose.model("Ad", adSchema);
