import { Schema, model, models } from 'mongoose';

const productSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    brand: { type: String },
    model: { type: String },
    material: { type: String },
    color: { type: String },
    description: { type: String },
    keyFeatures: { type: [String], default: [] }, 
    boxContents: { type: [String], default: [] }, 
    warranty: { type: String },
    dimensions: { type: String },
    weight: { type: Number, required: true },
    category: { type: String, required: true },
    subcategory: { type: String, required: true },
    productType: { type: String, required: true },
    condition: { type: String, enum: ['brand_new', 'used', 'refurbished'], required: true, default: 'brand_new' },
    price: { type: Number, required: true },
    oldPrice: { type: Number, default: null },
    calculatedPrice: {
      type: Schema.Types.Mixed, 
      required: true,
    },
    county: { type: String, required: true },
    town: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
    images: { type: [String], default: [] },
    sellerId: { type: String, required: true },
    fulfillmentMode: { type: String, required: true},
    averageRating: { type: Number, default: 0, },
    reviewCount: { type: Number, default: 0, },
    views: { type: Number, default: 0 },
    visits: { type: Number, default: 0 },
    bounces: { type: Number, default: 0 },
    currency: { type: String, default: 'KES'},
    installmentEnabled: { type: Boolean, default: false },
    installmentDepositPercent: { type: Number, default: 0 },
    installmentMonths: { type: Number, default: 0 },
    installmentPolicy: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Product = models.Product || model('Product', productSchema);

export default Product;
