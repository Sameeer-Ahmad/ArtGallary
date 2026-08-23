const jwt = require("jsonwebtoken");
const { userModel } = require("../model/user.model");
const { tokenModel } = require("../model/token.model");
require("dotenv").config();

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token not provided" });
  }

  jwt.verify(token, process.env.SECRET_KEY, async (err, decoded) => {
    if (!decoded) {
      return res.status(400).json({ error: "Invalid token" });
    }
    try {
      const blacklisted = await tokenModel.findOne({ token });
      if (blacklisted) {
        return res.status(401).json({ error: "Session expired, please log in again" });
      }

      const { userID, username, role } = decoded;
      const user = await userModel.findById(userID);
      req.user = user;
      req.body.userID = userID;
      req.body.username = username;
      req.role = role;
      next();
    } catch (dbErr) {
      console.error("Error checking token blacklist:", dbErr);
      res.status(500).json({ error: "Internal server error" });
    }
  });
};
module.exports = {
  auth,
};
