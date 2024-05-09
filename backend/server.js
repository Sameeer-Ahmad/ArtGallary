const express = require("express");
const { connectToDB } = require("./config/db");
const authRouter = require("./routes/user.routes");
const { artRouter } = require("./routes/art.routes");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT;
app.use(express.json());

app.use("/user", authRouter);
app.use("/art", artRouter);

app.listen(PORT, async () => {
  try {
    await connectToDB();
    console.log(`server is running on port ${PORT}`);
  } catch {
    console.log(err);
  }
});
