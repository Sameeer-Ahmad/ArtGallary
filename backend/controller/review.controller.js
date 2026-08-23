const { ReviewModel } = require("../model/review.model");
const { ArtModel } = require("../model/art.model");
const { OrderModel } = require("../model/order.model");

const addReview = async (req, res) => {
  const { id } = req.params;
  const { rating, comment, userID, username } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5" });
  }

  try {
    const art = await ArtModel.findById(id);
    if (!art) {
      return res.status(404).json({ error: "Art not found" });
    }

    const hasDelivered = await OrderModel.exists({
      userId: userID,
      status: "delivered",
      "items.artId": id,
    });
    if (!hasDelivered) {
      return res.status(403).json({
        error: "You can only review artworks after they've been delivered to you",
      });
    }

    const existing = await ReviewModel.findOne({ artId: id, userId: userID });
    if (existing) {
      existing.rating = rating;
      existing.comment = comment || "";
      await existing.save();
      return res.status(200).send(existing);
    }

    const review = new ReviewModel({
      artId: id,
      userId: userID,
      username,
      rating,
      comment: comment || "",
    });
    await review.save();
    res.status(201).send(review);
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ error: "Could not add review" });
  }
};

const getReviews = async (req, res) => {
  const { id } = req.params;
  const { userID } = req.body;
  try {
    const reviews = await ReviewModel.find({ artId: id }).sort({ createdAt: -1 });
    const average =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    let canReview = false;
    if (userID) {
      canReview = !!(await OrderModel.exists({
        userId: userID,
        status: "delivered",
        "items.artId": id,
      }));
    }

    res.status(200).json({ reviews, average, count: reviews.length, canReview });
  } catch (error) {
    console.error("Error getting reviews:", error);
    res.status(500).json({ error: "Could not get reviews" });
  }
};

const deleteReview = async (req, res) => {
  const { id } = req.params;
  const { userID } = req.body;
  try {
    const review = await ReviewModel.findById(id);
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }
    if (review.userId !== userID) {
      return res.status(403).json({ error: "Not your review" });
    }
    await ReviewModel.findByIdAndDelete(id);
    res.status(200).json({ message: "Review deleted" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ error: "Could not delete review" });
  }
};

module.exports = {
  addReview,
  getReviews,
  deleteReview,
};
