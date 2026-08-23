const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    otp: { type: Number, required: true },
    used: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const otpModel = mongoose.model("otp", otpSchema);
module.exports = {
  otpModel,
};
