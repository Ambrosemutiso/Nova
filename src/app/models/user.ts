// models/User.ts
import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IUser extends Document {
  _id: string; // Firebase UID
  name: string;
  email: string;
  photo?: string;
  role: 'buyer' | 'seller';
  wishlist: mongoose.Types.ObjectId[];
}

const UserSchema = new Schema<IUser>(
  {
    _id: { type: String, required: true }, // Use Firebase UID as _id
    name: { type: String },
    email: { type: String, required: true, unique: true },
    photo: { type: String },
    role: { type: String, enum: ['buyer', 'seller'], required: true },
    wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  },
  { timestamps: true, _id: false } // Disable default _id
);

export const User = models.User || model<IUser>('User', UserSchema);
