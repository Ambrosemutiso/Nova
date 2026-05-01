import { Schema, models, model } from "mongoose";

const FcmTokenSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true, // 🔥 prevents duplicates
    },
    device: {
      type: String,
      default: "web",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    lastUsed: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

// Prevent model overwrite in dev
export default models.FcmToken || model("FcmToken", FcmTokenSchema);