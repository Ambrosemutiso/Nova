import { Schema, model, models } from 'mongoose';

const productSchema = new Schema(
  {
    name: { type: String, required: true },
    brand: { type: String },
    model: { type: String },
    mainMaterial: { type: String },
    color: { type: String },
    description: { type: String, required: true },
    keyFeatures: { type: [String], default: [] }, 
    whatsInTheBox: { type: String },
    warranty: { type: String },
    dimensions: { type: String },
    weight: { type: String },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    oldPrice: { type: Number, default: null },
    calculatedPrice: { type: String },
    county: { type: String, required: true },
    town: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
    images: { type: [String], default: [] },
    sellerId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Product = models.Product || model('Product', productSchema);

export default Product;
