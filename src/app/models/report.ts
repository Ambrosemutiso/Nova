import { Schema, model, models } from 'mongoose';

const ReportSchema = new Schema({
  productId: { type: String, required: true },
  userId: { type: String, required: true },
  reason: { type: String, required: true },
  message: { type: String },
  screenshot: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const Report = models.Report || model('Report', ReportSchema);
