
import mongoose from 'mongoose';

const LogisticsPartnerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed
  vehicleDetails: { type: String },
  assignedOrders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  isAvailable: { type: Boolean, default: true },
}, { timestamps: true });

const LogisticsPartner = mongoose.models.LogisticsPartner || mongoose.model('LogisticsPartner', LogisticsPartnerSchema);
export default LogisticsPartner;
