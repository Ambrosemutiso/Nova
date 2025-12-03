import mongoose from "mongoose";

const B2CLogSchema = new mongoose.Schema(
  {
    type: String, // "result" or "timeout"
    data: Object,
  },
  { timestamps: true }
);

export default mongoose.models.B2CLog || mongoose.model("B2CLog", B2CLogSchema);
