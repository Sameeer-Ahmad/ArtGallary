const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    artId: { type: String, required: true },
    artName: { type: String, required: true },
    artImage: { type: String },
    artPrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
    artistUserID: { type: String },
    artistUsername: { type: String },
  },
  { _id: false }
);

const ORDER_STATUSES = [
  "created",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "failed",
];

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, enum: ORDER_STATUSES, required: true },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    items: { type: [orderItemSchema], required: true },
    totalAmount: { type: Number, required: true },
    shippingInfo: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      instructions: { type: String, default: "" },
    },
    razorpayOrderId: { type: String, required: true },
    razorpayPaymentId: { type: String },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "created",
    },
    statusHistory: { type: [statusHistorySchema], default: [] },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const OrderModel = mongoose.model("order", orderSchema);

module.exports = {
  OrderModel,
  ORDER_STATUSES,
};
