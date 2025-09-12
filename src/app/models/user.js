"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var userSchema = new mongoose_1.default.Schema({
    _id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: String,
    role: { type: String, enum: ['buyer', 'seller'], default: 'buyer' },
    phoneNumber: { type: String, required: true },
    country: { type: String },
    currency: { type: String },
}, { timestamps: true });
exports.default = mongoose_1.default.models.User || mongoose_1.default.model('User', userSchema);
