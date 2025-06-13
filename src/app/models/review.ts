import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    userName: { type: String, required: true },
    comment: { type: String, required: true },
    rating: { type: Number, required: true },
  },
  { timestamps: true }
);

const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);
export default Review;
