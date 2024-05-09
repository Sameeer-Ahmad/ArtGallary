const express = require("express");
const authController = require("../controller/auth.controller");

const authRouter = express.Router();

// Register routes
authRouter.post("/register", authController.register);
//login routes
authRouter.post("/login", authController.login);

// Logout route
authRouter.post("/logout", authController.logout);

module.exports = authRouter;
