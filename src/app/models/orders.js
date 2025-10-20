"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var orderSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
    items: [
        {
            name: String,
            quantity: Number,
            price: Number,
            images: [String],
            fulfillmentMode: String,
            sellerId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Seller' }, // ✅ Added
            status: { type: String, enum: ['Pending', 'Delivered', 'Cancelled'], default: 'Pending' }
        }
    ],
    logisticsPartner: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'LogisticsPartner',
        default: null,
    },
    totalAmount: Number,
    deliveryFee: Number,
    customerInfo: Object,
    status: { type: String, enum: ['Pending', 'Paid', 'Cancelled'], default: 'Pending' },
    trackingNumber: { type: String, unique: true, sparse: true },
    paymentInfo: Object,
    checkoutRequestID: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});
exports.default = mongoose_1.default.models.Order || mongoose_1.default.model('Order', orderSchema);
