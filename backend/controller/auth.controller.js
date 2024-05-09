const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { usermodel } = require("../model/user.model");

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .send("Username, email, and password are required.");
    }

    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = await bcrypt.hash(password, salt);

    const newuser = new usermodel({ username, email, password: hash });
    await newuser.save();

    res.status(201).send({ msg: `User registered successfully`, newuser });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await usermodel.findOne({ email });
    if (!user) {
      return res.status(404).send("User not found");
    }

    const match = await bcrypt.compare(password, user.password);
    if (match) {
      const token = jwt.sign(
        { userId: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      return res.status(200).send({ msg: "Login success", token });
    } else {
      return res.status(401).send("Wrong password");
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal Server Error");
  }
};

const logout = (req, res) => {
  try {
    res.clearCookie("jwtToken");
    res.status(200).send({ message: "Logout successful" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
};

module.exports = { register, login, logout };
