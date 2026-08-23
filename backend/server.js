require("dotenv").config();
const express = require("express");
const { connectToDB } = require("./config/db");
const cors = require("cors");
const { artistRouter } = require("./routes/artist.routes");
const { artCategoryRouter } = require("./routes/art.category.routes");
const { orderRouter } = require("./routes/order.routes");
const { reviewRouter } = require("./routes/review.routes");
const { addressRouter } = require("./routes/address.routes");
const fileUpload = require('express-fileupload');
const authRouter = require("./routes/user.routes");

const app = express();

// CORS_ORIGIN can be a comma-separated allowlist for production (e.g.
// "https://theartline.com,https://www.theartline.com"). Left unset, every
// origin is allowed — safe default for local/dev so this never blocks the
// app with a CORS error before a real frontend domain is known.
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
  : true;
app.use(cors({ origin: allowedOrigins }));

app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

const PORT = process.env.PORT;

app.use(express.json());

app.use("/artist", artistRouter);

app.use("/art", artCategoryRouter);

app.use("/order", orderRouter);

app.use("/reviews", reviewRouter);

app.use("/addresses", addressRouter);

app.use("/user", authRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, async () => {
  try {
    await connectToDB();
    console.log(`server is running on port ${PORT}`);
  } catch (err) {
    console.log(err);
  }
});
