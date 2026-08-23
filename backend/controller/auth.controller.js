const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { userModel } = require("../model/user.model");
const { tokenModel } = require("../model/token.model");
const { otpModel } = require("../model/otp");
const { sendMail } = require("../utils/mailer");
const { uploadImageToCloudinary } = require("./uploadImage");

const OTP_TTL_MS = 10 * 60 * 1000;
const RESET_TOKEN_TTL = "10m";
const LOGIN_TOKEN_TTL = "7d";

const signup = async (req, res) => {
  const { username, email, password, role } = req.body;
  const saltRounds = 10;
  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }
    bcrypt.hash(password, saltRounds, async (err, hash) => {
      if (err) {
        res.status(500).json({ error: "Could not create account" });
      } else {
        const user = new userModel({ username, email, password: hash, role });
        await user.save();
        res.status(200).json({ msg: "user registered successfully" });
      }
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Something went wrong" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (user) {
      bcrypt.compare(password, user.password, async (err, result) => {
        if (result) {
          const token = jwt.sign(
            { userID: user._id, username: user.username, role: user.role },
            process.env.SECRET_KEY,
            { expiresIn: LOGIN_TOKEN_TTL }
          );
          res.status(200).send({
            msg: "Login successful",
            token,
            userID: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            profilePic: user.profilePic,
          });
        } else {
          res.status(400).json({ error: "Invalid credentials" });
        }
      });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: "Something went wrong" });
  }
};

const logout = async (req, res) => {
  const header = req.headers["authorization"];
  if (!header) {
    return res.status(401).json({ error: "Authorization header not found" });
  }
  const token = header.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }
  try {
    const decoded = jwt.decode(token);
    const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 24 * 60 * 60 * 1000);

    await tokenModel.updateOne(
      { token },
      { $setOnInsert: { token, expiresAt } },
      { upsert: true }
    );
    res.status(200).json({ msg: "Logout successful" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const GENERIC_FORGOT_MSG =
  "If an account exists for that email, a reset code has been sent.";

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      // Don't reveal whether the email exists.
      return res.status(200).json({ msg: GENERIC_FORGOT_MSG });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    await otpModel.deleteMany({ user_id: user._id });
    await otpModel.create({
      user_id: user._id,
      otp,
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    });

    sendMail({
      to: email,
      subject: "Your Artline password reset code",
      text: `Your password reset code is ${otp}. It expires in 10 minutes. If you didn't request this, you can ignore this email.`,
    });

    res.status(200).json({ msg: GENERIC_FORGOT_MSG });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not process request" });
  }
};

const verifyResetOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: "Email and code are required" });
  }
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid or expired code" });
    }

    const otpDoc = await otpModel.findOne({
      user_id: user._id,
      otp: Number(otp),
      used: false,
      expiresAt: { $gt: new Date() },
    });
    if (!otpDoc) {
      return res.status(400).json({ error: "Invalid or expired code" });
    }

    otpDoc.used = true;
    await otpDoc.save();

    const resetToken = jwt.sign(
      { userID: user._id, purpose: "reset" },
      process.env.SECRET_KEY,
      { expiresIn: RESET_TOKEN_TTL }
    );

    res.status(200).json({ resetToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not verify code" });
  }
};

const resetPassword = async (req, res) => {
  const { resetToken, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: "New password must be at least 6 characters" });
  }
  try {
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.SECRET_KEY);
    } catch (err) {
      return res.status(400).json({ error: "Reset link expired, please request a new code" });
    }
    if (decoded.purpose !== "reset") {
      return res.status(400).json({ error: "Invalid reset token" });
    }

    const user = await userModel.findById(decoded.userID);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ msg: "Password reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not reset password" });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await userModel.findById(req.body.userID).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch profile" });
  }
};

const updateProfile = async (req, res) => {
  const { newUsername } = req.body;
  if (!newUsername || !newUsername.trim()) {
    return res.status(400).json({ error: "Name cannot be empty" });
  }
  try {
    const user = await userModel
      .findByIdAndUpdate(req.body.userID, { username: newUsername.trim() }, { new: true })
      .select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not update profile" });
  }
};

const uploadProfilePic = async (req, res) => {
  try {
    if (!req.files || !req.files.profilePic) {
      return res.status(400).json({ error: "No image uploaded" });
    }
    const file = req.files.profilePic;
    const uploadedImage = await uploadImageToCloudinary(file.tempFilePath, "profilePics", 400, "auto");
    if (!uploadedImage) {
      return res.status(500).json({ error: "Image upload failed" });
    }

    const user = await userModel
      .findByIdAndUpdate(req.body.userID, { profilePic: uploadedImage.secure_url }, { new: true })
      .select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error("Error uploading profile picture:", err);
    res.status(500).json({ error: "Could not upload profile picture" });
  }
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: "New password must be at least 6 characters" });
  }
  try {
    const user = await userModel.findById(req.body.userID);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    bcrypt.compare(currentPassword, user.password, async (err, result) => {
      if (!result) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }
      const hash = await bcrypt.hash(newPassword, 10);
      user.password = hash;
      await user.save();
      res.status(200).json({ msg: "Password updated successfully" });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not update password" });
  }
};

module.exports = {
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
};
