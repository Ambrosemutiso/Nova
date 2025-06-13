// models/User.ts
import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  photo?: string;
  role: 'buyer' | 'seller';
  wishlist: mongoose.Types.ObjectId[]; // Array of product IDs
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    photo: { type: String },
    role: { type: String, enum: ['buyer', 'seller'], required: true },
    wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  },
  { timestamps: true }
);

export const User = models.User || model<IUser>('User', UserSchema);
