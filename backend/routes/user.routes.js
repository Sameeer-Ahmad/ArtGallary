const express = require("express");

const {
  signup,
  login,
  logout,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  getMe,
  updateProfile,
  uploadProfilePic,
  changePassword,
} = require("../controller/auth.controller");
const { auth } = require("../middleware/auth.middleware");
const authRouter = express.Router();

// Register routes
authRouter.post("/signup", signup);
//login routes
authRouter.post("/login", login);

// Logout route
authRouter.post("/logout", logout);

// forgot-password flow
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/verify-reset-otp", verifyResetOtp);
authRouter.post("/reset-password", resetPassword);

// current user profile
authRouter.get("/me", auth, getMe);

// update profile / change password
authRouter.patch("/me", auth, updateProfile);
authRouter.patch("/profile-pic", auth, uploadProfilePic);
authRouter.patch("/change-password", auth, changePassword);

module.exports = authRouter;
