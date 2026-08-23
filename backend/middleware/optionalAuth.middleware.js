const jwt = require("jsonwebtoken");
const { tokenModel } = require("../model/token.model");
require("dotenv").config();

// Like `auth`, but lets the request through even without a valid token —
// for read-only routes guests should be able to browse. If a valid,
// non-revoked token is present, req.body.userID/username and req.role are
// populated same as `auth`.
const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return next();

  jwt.verify(token, process.env.SECRET_KEY, async (err, decoded) => {
    if (!decoded) return next();
    try {
      const blacklisted = await tokenModel.findOne({ token });
      if (!blacklisted) {
        req.body.userID = decoded.userID;
        req.body.username = decoded.username;
        req.role = decoded.role;
      }
    } catch (dbErr) {
      console.error("Error checking token blacklist:", dbErr);
    }
    next();
  });
};

module.exports = {
  optionalAuth,
};
