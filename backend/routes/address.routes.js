const express = require("express");

const { getAddresses, addAddress, deleteAddress } = require("../controller/address.controller");
const { auth } = require("../middleware/auth.middleware");

const addressRouter = express.Router();

addressRouter.get("/", auth, getAddresses);
addressRouter.post("/", auth, addAddress);
addressRouter.delete("/:id", auth, deleteAddress);

module.exports = { addressRouter };
