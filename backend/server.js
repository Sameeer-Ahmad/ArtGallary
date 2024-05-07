const express = require("express");
const { connectToDB } = require("./config/db");
const { UserModel } = require("./userSchema");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT;
app.use(express.json());

app.get("/users", async (req, res) => {
  try {
    const users = await UserModel.find();
    res.status(200).send(users);
  } catch (err) {
    console.log(err);
  }
});
app.post("/users", async (req, res) => {
  const { name, email } = req.body;
  try {
    const user = new UserModel({ name, email });
    await user.save();
    res.status(201).send("User created");
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});


app.listen(PORT, async () => {
  try {
    await connectToDB();
    console.log(`server is running on port ${PORT}`);
  } catch {
    console.log(err);
  }
});
