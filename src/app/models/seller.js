"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var settingsSchema = new mongoose_1.default.Schema({
    currency: { type: String, default: 'USD' },
    country: { type: String, default: 'US' },
    language: { type: String, default: 'en' },
}, { _id: false });
var sellerSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    image: { type: String },
    logo: { type: String },
    banner: { type: String },
    phoneNumber: { type: String, unique: true, required: true },
    country: { type: String },
    currency: { type: String },
    role: {
        type: String,
        enum: ['seller'],
        default: 'seller'
    },
    shopName: { type: String },
    isVerified: {
        type: Boolean,
        default: false
    },
    followers: [
        { userId: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'User'
            },
            followedAt: {
                type: Date
            },
        }
    ],
    shop: {
        isActive: {
            type: Boolean,
            default: false
        },
        activatedAt: { type: Date },
        expiresAt: { type: Date },
        amountPaid: { type: Number },
        transactionId: { type: String }
    },
    settings: { type: settingsSchema, default: function () { return ({}); } },
    createdAt: { type: Date, default: Date.now },
});
var Seller = mongoose_1.default.models.Seller || mongoose_1.default.model('Seller', sellerSchema);
exports.default = Seller;
