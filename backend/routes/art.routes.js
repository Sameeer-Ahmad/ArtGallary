const express = require("express");
const { postArt, getArt, deleteArt } = require("../controller/art.controller");

const artRouter = express.Router();

artRouter.post("/add", postArt);

artRouter.get("/get", getArt);

artRouter.delete("/delete/:id", deleteArt);

module.exports = {
  artRouter,
};
