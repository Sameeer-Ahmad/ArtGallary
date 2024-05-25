const express = require("express");
const { connectToDB } = require("./config/db");
const cors = require("cors");
const { artistRouter } = require("./routes/artist.routes");
const { artCategoryRouter } = require("./routes/art.category.routes");
const fileUpload = require('express-fileupload');
const authRouter = require("./routes/user.routes");

const app = express();

app.use(cors());

app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));
require("dotenv").config();

const PORT = process.env.PORT;

app.use(express.json());

app.use("/artist", artistRouter);

app.use("/art", artCategoryRouter);

app.use("/user", authRouter);

app.listen(PORT, async () => {
  try {
    await connectToDB();
    console.log(`server is running on port ${PORT}`);
  } catch {
    console.log(err);
  }
});
