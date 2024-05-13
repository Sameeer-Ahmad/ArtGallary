const express = require("express");

const {
  signup,
  login,
  logout,
  sendOtp,
  sentMail,
} = require("../controller/auth.controller");
const authRouter = express.Router();

// Register routes
authRouter.post("/signup", signup);
//login routes
authRouter.post("/login", login);

// Logout route
authRouter.post("/logout", logout);

// send mail route
authRouter.post("/sent-mail", sentMail);

// otp route
authRouter.get("/sent-opt", sendOtp);

module.exports = authRouter;
