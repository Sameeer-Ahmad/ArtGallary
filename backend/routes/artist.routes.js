const express = require("express");

const {
  postArt,
  getArt,
  deleteArt,
  updateArt,
  getArtById,
} = require("../controller/art.controller");
const { auth } = require("../middleware/auth.middleware");

const artistRouter = express.Router();

artistRouter.post("/add",auth, postArt);

artistRouter.get("/get", auth, getArt);

artistRouter.delete("/delete/:id", deleteArt);

artistRouter.patch("/update/:id", updateArt);

artistRouter.get("/get/:id", getArtById);

module.exports = {
  artistRouter,
};
