const express = require("express");

const { addReview, getReviews, deleteReview } = require("../controller/review.controller");
const { auth } = require("../middleware/auth.middleware");
const { optionalAuth } = require("../middleware/optionalAuth.middleware");

const reviewRouter = express.Router();

reviewRouter.get("/:id", optionalAuth, getReviews);

reviewRouter.post("/:id", auth, addReview);

reviewRouter.delete("/:id", auth, deleteReview);

module.exports = {
  reviewRouter,
};
