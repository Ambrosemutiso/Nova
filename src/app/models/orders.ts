import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    items: [
    {
      name: String,
      quantity: Number,
      price: Number,
      image: String,
    },
  ],
  totalAmount: Number,
  deliveryFee: Number,
  customerInfo: Object,
  status: { type: String, enum: ['Pending', 'Paid', 'Cancelled'], default: 'Pending' },
  paymentInfo: Object,
  checkoutRequestID: String, 
  createdAt: Date,
});

export default mongoose.models.Order || mongoose.model('Order', orderSchema);

