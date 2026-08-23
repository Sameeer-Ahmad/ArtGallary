const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    artId: { type: String, required: true },
    userId: { type: String, required: true },
    username: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const ReviewModel = mongoose.model("review", reviewSchema);

module.exports = {
  ReviewModel,
};
