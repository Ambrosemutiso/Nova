import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [
    {
      name: String,
      quantity: Number,
      price: Number,
      images: [String],
      fulfillmentMode: String,
      sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller' }, // ✅ Added
      status: { type: String, enum: ['Pending', 'Delivered', 'Cancelled'], default: 'Pending' }
    }
  ],
  logisticsPartner: {
  type: mongoose.Schema.Types.ObjectId,
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

export default mongoose.models.Order || mongoose.model('Order', orderSchema);
