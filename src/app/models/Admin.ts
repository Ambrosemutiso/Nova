import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  securityQuestion: String,
  securityAnswer: String,
});

export default mongoose.models.Admin || mongoose.model('Admin', adminSchema);