// models/ProductView.ts
import mongoose from 'mongoose';

const productViewSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  },
  { timestamps: true }
);

export default mongoose.models.ProductView || mongoose.model('ProductView', productViewSchema);
