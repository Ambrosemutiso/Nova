import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [
    {
      name: String,
      quantity: Number,
      price: Number,
      image: String,
      status: { type: String, enum: ['Pending', 'Delivered', 'Cancelled'], default: 'Pending' }, // ✅ Add this
    },
  ],
  totalAmount: Number,
  deliveryFee: Number,
  customerInfo: Object,
  status: { type: String, enum: ['Pending', 'Paid', 'Cancelled'], default: 'Pending' }, // Overall order status
  paymentInfo: Object,
  checkoutRequestID: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Order || mongoose.model('Order', orderSchema);
