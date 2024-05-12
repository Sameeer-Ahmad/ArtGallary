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
} = require("../controller/art.category.controller");

const { auth } = require("../middleware/auth.middleware");

const artCategoryRouter = express.Router();

artCategoryRouter.get("/", auth, getArtByCategory);

artCategoryRouter.get("/paintings", auth, Painting);

artCategoryRouter.get("/prints", auth, Print);

artCategoryRouter.get("/sculpture", auth, Sculpture);

artCategoryRouter.get("/photography", auth, Photography);

artCategoryRouter.get("/inspiration", auth, Inspiration);

artCategoryRouter.get("/drawings", auth, Drawings);

artCategoryRouter.post("/addToCart", auth, addToCart);

artCategoryRouter.get("/cart", auth, getArtInCart);

module.exports = {
  artCategoryRouter,
};

