const express = require("express");

const {
  createOrder,
  verifyPayment,
  getMyOrders,
  getSalesOrders,
  updateOrderStatus,
  cancelOrder,
} = require("../controller/order.controller");

const { auth } = require("../middleware/auth.middleware");

const orderRouter = express.Router();

orderRouter.post("/create", auth, createOrder);

orderRouter.post("/verify", auth, verifyPayment);

orderRouter.get("/my-orders", auth, getMyOrders);

orderRouter.get("/sales", auth, getSalesOrders);

orderRouter.patch("/:id/status", auth, updateOrderStatus);

orderRouter.patch("/:id/cancel", auth, cancelOrder);

module.exports = {
  orderRouter,
};
