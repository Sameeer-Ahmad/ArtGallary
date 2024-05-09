const express = require("express");

const {
  postArt,
  getArt,
  deleteArt,
  updateArt,
  getArtById,
} = require("../controller/art.controller");

const artistRouter = express.Router();

artistRouter.post("/add", postArt);

artistRouter.get("/get", getArt);

artistRouter.delete("/delete/:id", deleteArt);

artistRouter.patch("/update/:id", updateArt);

artistRouter.get("/get/:id", getArtById);

module.exports = {
  artistRouter,
};
