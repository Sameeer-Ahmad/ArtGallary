const express = require("express");
const { postArt, getArt, deleteArt, updateArt, getArtById } = require("../controller/art.controller");

const artRouter = express.Router();

artRouter.post("/add", postArt);

artRouter.get("/get", getArt);

artRouter.delete("/delete/:id", deleteArt);

artRouter.patch("/update/:id", updateArt);

artRouter.get("/get/:id", getArtById);

module.exports = {
  artRouter,
};
