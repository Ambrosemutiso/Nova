"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var sellerSchema = new mongoose_1.default.Schema({
    name: String,
    email: { type: String, unique: true },
    image: String,
    role: { type: String, enum: ['seller'], default: 'seller' },
    shopName: String,
    followers: [
        {
            userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
            followedAt: Date,
        },
    ],
    shop: {
        isActive: { type: Boolean, default: false },
        activatedAt: Date,
        expiresAt: Date,
        amountPaid: Number,
        transactionId: String,
    },
    createdAt: { type: Date, default: Date.now }
});
var Seller = mongoose_1.default.models.Seller || mongoose_1.default.model('Seller', sellerSchema);
exports.default = Seller;
