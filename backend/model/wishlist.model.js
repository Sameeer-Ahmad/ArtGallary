const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  artId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const WishlistModel = mongoose.model("wishlist", wishlistSchema);

module.exports = {
  WishlistModel,
};
