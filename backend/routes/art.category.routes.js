const express = require("express");
const {
  Painting,
  Print,
  Sculpture,
  Photography,
  Inspiration,
  Drawings,
  getArtByCategory,
  addToCart,
  getArtInCart,
  removeFromCart,
  updateCartQuantity,
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  searchArt,
} = require("../controller/art.category.controller");

const { auth } = require("../middleware/auth.middleware");
const { optionalAuth } = require("../middleware/optionalAuth.middleware");

const artCategoryRouter = express.Router();

artCategoryRouter.get("/", optionalAuth, getArtByCategory);

artCategoryRouter.get("/search", optionalAuth, searchArt);

artCategoryRouter.get("/paintings", optionalAuth, Painting);

artCategoryRouter.get("/prints", optionalAuth, Print);

artCategoryRouter.get("/sculpture", optionalAuth, Sculpture);

artCategoryRouter.get("/photography", optionalAuth, Photography);

artCategoryRouter.get("/inspiration", optionalAuth, Inspiration);

artCategoryRouter.get("/drawings", optionalAuth, Drawings);

artCategoryRouter.post("/addToCart", auth, addToCart);

artCategoryRouter.get("/cart", auth, getArtInCart);

artCategoryRouter.delete("/removeFromCart/:id",auth, removeFromCart)

artCategoryRouter.patch("/updateCartQuantity/:id", auth, updateCartQuantity)

artCategoryRouter.post("/wishlist", auth, addToWishlist);

artCategoryRouter.get("/wishlist", auth, getWishlist);

artCategoryRouter.delete("/wishlist/:artId", auth, removeFromWishlist);

module.exports = {
  artCategoryRouter,
};
