const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema(
  {
    token: { type: String, required: false, unique: true },
    // TTL index: Mongo auto-deletes the doc once this time passes, so the
    // blacklist doesn't grow forever — an entry only needs to outlive the
    // token's own expiry.
    expiresAt: { type: Date, required: true, expires: 0 },
  },
  {
    versionKey: false,
  }
);

const tokenModel = mongoose.model("Token", tokenSchema);
module.exports = {
  tokenModel,
};
