// models/SellerFollow.ts
import { Schema, model, models, Document } from 'mongoose';

export interface ISellerFollow extends Document {
  sellerId: string;
  followerId: string;
}

const SellerFollowSchema = new Schema<ISellerFollow>(
  {
    sellerId: { type: String, required: true },
    followerId: { type: String, required: true },
  },
  { timestamps: true }
);

export const SellerFollow = models.SellerFollow || model<ISellerFollow>('SellerFollow', SellerFollowSchema);
