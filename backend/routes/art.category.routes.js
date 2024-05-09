const express = require("express");
const {
  Painting,
  Print,
  Sculpture,
  Photography,
  Inspiration,
  Drawings,
} = require("../controller/art.category.controller");

const artCategoryRouter = express.Router();

artCategoryRouter.get("/painting", Painting);

artCategoryRouter.get("/prints", Print);

artCategoryRouter.get("/sculpture", Sculpture);

artCategoryRouter.get("/photography", Photography);

artCategoryRouter.get("/inspiration", Inspiration);

artCategoryRouter.get("/drawing", Drawings);

module.exports = {
    artCategoryRouter,
};
