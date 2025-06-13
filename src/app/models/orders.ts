import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  customerInfo: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String,
  },
  items: [
    {
      name: String,
      quantity: Number,
      price: Number,
      image: String,
    },
  ],
  deliveryFee: Number,
  totalAmount: Number,
  mpesaReceiptNumber: String,
  paidAmount: Number,
  paidPhone: String,
  checkoutRequestId: String,
  status: { 
    type: String, 
    enum: ['Pending', 'Processing', 'Delivered'], 
    default: 'Processing' },
  createdAt: { 
    type: Date, 
    default: Date.now },
});

export default mongoose.models.Order || mongoose.model('Order', orderSchema);

