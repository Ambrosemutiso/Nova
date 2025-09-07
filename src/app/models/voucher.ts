import mongoose, { Schema, Document } from "mongoose";

export interface IVoucher extends Document {
  code: string;
  discount: number;
  expiry: Date;
  status: "active" | "used" | "expired";
  userId: mongoose.Schema.Types.ObjectId; // linked to User
}

const VoucherSchema = new Schema<IVoucher>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    discount: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
    },
    expiry: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "used", "expired"],
      default: "active",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Voucher ||
  mongoose.model<IVoucher>("Voucher", VoucherSchema);
