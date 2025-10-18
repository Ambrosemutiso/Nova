"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var productSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    brand: { type: String },
    model: { type: String },
    material: { type: String },
    color: { type: String },
    description: { type: String, required: true },
    keyFeatures: { type: [String], default: [] },
    boxContents: { type: [String], default: [] },
    warranty: { type: String },
    dimensions: { type: String },
    weight: { type: Number },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    oldPrice: { type: Number, default: null },
    calculatedPrice: {
        type: mongoose_1.Schema.Types.Mixed,
        required: true,
    },
    county: { type: String, required: true },
    town: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
    images: { type: [String], default: [] },
    sellerId: { type: String, required: true },
    fulfillmentMode: { type: String, required: true },
    averageRating: { type: Number, default: 0, },
    reviewCount: { type: Number, default: 0, },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });
var Product = mongoose_1.models.Product || (0, mongoose_1.model)('Product', productSchema);
exports.default = Product;
