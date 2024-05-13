const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { userModel } = require("../model/user.model");
const { tokenModel } = require("../model/token.model");
const nodemailer = require("nodemailer");

const signup = async (req, res) => {
  const { username, email, password, role } = req.body;
  const saltRounds = 10;
  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      res.status(400).send("Email already registered");
    }
    bcrypt.hash(password, saltRounds, async (err, hash) => {
      if (err) {
        res.status(200).send({ msg: `find err` });
      } else {
        const user = new userModel({ username, email, password: hash, role });
        await user.save();
        res.status(200).send({ msg: `user registered successfully` });
      }
    });
  } catch (err) {
    console.error(err);
    res.status(400).send("Something went wrong");
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
            process.env.SECRET_KEY
          );
          res.status(200).send({
            msg: "Login successful",
            token,
            username: user.username,
            email: user.email,
          });
          // console.log("login successfully");
        } else {
          res.status(400).send("Invalid credentials");
        }
      });
    } else {
      res.status(200).send("User not found");
    }
  } catch (err) {
    console.error(err);
    return res.status(401).send("Something went wrong");
  }
};

const logout = async (req, res) => {
  const header = req.headers["authorization"];
  if (!header) {
    return res.status(401).send({ error: "Authorization header not found" });
  }
  const token = header.split(" ")[1];
  try {
    if (!token) {
      res.status(401).send({ msg: "No token provided" });
    }
    const userToken = new tokenModel({ token });
    await userToken.save();
    res.status(200).send({ msg: "Logout successful" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
};

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: process.env.SMTP_MAIL,
    pass: "jn7jnAPss4f63QBp6D",
  },
});

const sentMail = async (req, res) => {
  const { email } = req.body;
  console.log(email);
  var mailOption = {
    from: process.env.SMTP_MAIL,
    to: email,
    subject: "Sending Email using Node.js",
    text: "That was easy!",
  };
  transporter.sendMail(mailOption, (err, info) => {
    if(err){
      console.log(err);
    }else{
      console.log(info);
      res.status(200).send({ msg: "Email sent" });
    }
  })
};

const sendOtp = async (req, res) => {
  try {
    const userData = await userModel.findOne({ email: req.body.email });
    if (!userData) {
      res.status(400).send("Email doesn't exist");
    }
  } catch (err) {}
};

module.exports = {
  signup,
  login,
  logout,
  sentMail,
  sendOtp,
};
