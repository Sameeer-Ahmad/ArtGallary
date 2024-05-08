const express = require("express");
const { postArt, getArt } = require("../controller/art.controller");

const artRouter = express.Router();

artRouter.post("/add", postArt);

artRouter.get("/get", getArt);

module.exports = {
  artRouter,
};
