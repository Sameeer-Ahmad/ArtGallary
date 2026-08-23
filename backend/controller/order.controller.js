const crypto = require("crypto");
const Razorpay = require("razorpay");
require("dotenv").config();
const { CartModel } = require("../model/cart.model");
const { ArtModel } = require("../model/art.model");
const { OrderModel } = require("../model/order.model");
const { userModel } = require("../model/user.model");
const { sendMail } = require("../utils/mailer");

const ALLOWED_TRANSITIONS = {
  paid: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
};

const getRazorpayClient = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error(
      "RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not set in backend/.env"
    );
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

const createOrder = async (req, res) => {
  const { userID, name, phone, address, city, postalCode, instructions } = req.body;
  try {
    const cartItems = await CartModel.find({ userId: userID });
    if (cartItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const arts = await ArtModel.find({
      _id: { $in: cartItems.map((item) => item.artId) },
    });

    const unavailable = [];
    const items = [];
    for (const cartItem of cartItems) {
      const art = arts.find((a) => a._id.toString() === cartItem.artId);
      if (!art) {
        unavailable.push("An item in your cart is no longer available");
        continue;
      }
      if (art.stock < cartItem.quantity) {
        unavailable.push(
          `${art.artName} only has ${art.stock} left in stock (you have ${cartItem.quantity} in cart)`
        );
        continue;
      }
      items.push({
        artId: cartItem.artId,
        artName: art.artName,
        artImage: art.artImage[0],
        artPrice: art.artPrice,
        quantity: cartItem.quantity,
        artistUserID: art.userID,
        artistUsername: art.username,
      });
    }

    if (unavailable.length > 0) {
      return res.status(409).json({ error: unavailable.join("; ") });
    }

    const totalAmount = items.reduce(
      (sum, item) => sum + item.artPrice * item.quantity,
      0
    );

    const razorpay = getRazorpayClient();
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    const order = new OrderModel({
      userId: userID,
      items,
      totalAmount,
      shippingInfo: { name, phone, address, city, postalCode, instructions: instructions || "" },
      razorpayOrderId: razorpayOrder.id,
      status: "created",
    });
    await order.save();

    res.status(201).json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      dbOrderId: order._id,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Could not create order" });
  }
};

// Fire-and-forget: emails a buyer confirmation, and one email per artist
// summarizing just the items they sold in this order.
const notifyOrderPaid = async (order, buyer) => {
  if (buyer?.email) {
    sendMail({
      to: buyer.email,
      subject: "Your Artline order is confirmed",
      text: `Thanks for your order! Order #${order._id} for ₹${order.totalAmount} is confirmed.\n\nItems:\n${order.items
        .map((i) => `- ${i.artName} x${i.quantity} (₹${i.artPrice * i.quantity})`)
        .join("\n")}\n\nShipping to: ${order.shippingInfo.address}, ${order.shippingInfo.city} ${order.shippingInfo.postalCode}\n\nYou can track this order anytime under "Your Orders".`,
    });
  }

  const artistIds = [...new Set(order.items.map((i) => i.artistUserID).filter(Boolean))];
  for (const artistId of artistIds) {
    const artist = await userModel.findById(artistId).select("email username");
    if (!artist?.email) continue;

    const myItems = order.items.filter((i) => i.artistUserID === artistId);
    const myTotal = myItems.reduce((sum, i) => sum + i.artPrice * i.quantity, 0);

    sendMail({
      to: artist.email,
      subject: "You made a sale on The Artline!",
      text: `Good news, ${artist.username} — ${order.shippingInfo.name} just purchased:\n\n${myItems
        .map((i) => `- ${i.artName} x${i.quantity} (₹${i.artPrice * i.quantity})`)
        .join("\n")}\n\nTotal for you: ₹${myTotal}\n\nShip to:\n${order.shippingInfo.name}\n${order.shippingInfo.address}, ${order.shippingInfo.city} ${order.shippingInfo.postalCode}\nPhone: ${order.shippingInfo.phone}\n\nManage this order under "Your Sales".`,
    });
  }
};

const verifyPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    userID,
  } = req.body;

  try {
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const order = await OrderModel.findOne({
      razorpayOrderId: razorpay_order_id,
      userId: userID,
    });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (expectedSignature !== razorpay_signature) {
      order.status = "failed";
      order.statusHistory.push({ status: "failed" });
      await order.save();
      return res.status(400).json({ error: "Payment verification failed" });
    }

    order.status = "paid";
    order.razorpayPaymentId = razorpay_payment_id;
    order.statusHistory.push({ status: "paid" });
    await order.save();

    for (const item of order.items) {
      // Conditional decrement: only succeeds if enough stock is still there,
      // so a concurrent purchase of the same last-in-stock item can't drive
      // stock negative even though availability was already checked at
      // checkout time.
      const updated = await ArtModel.findOneAndUpdate(
        { _id: item.artId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } }
      );
      if (!updated) {
        console.error(
          `Stock race on paid order ${order._id}: ${item.artName} (artId ${item.artId}) had insufficient stock at fulfillment time.`
        );
      }
    }

    await CartModel.deleteMany({ userId: userID });

    notifyOrderPaid(order, req.user).catch((err) =>
      console.error("Error sending order notification emails:", err)
    );

    res.status(200).json({ message: "Payment verified", orderId: order._id });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ error: "Could not verify payment" });
  }
};

const getMyOrders = async (req, res) => {
  const { userID } = req.body;
  try {
    const orders = await OrderModel.find({ userId: userID }).sort({
      createdAt: -1,
    });
    res.status(200).send(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Could not fetch orders" });
  }
};

// Orders containing at least one item sold by the requesting artist.
const getSalesOrders = async (req, res) => {
  const { userID } = req.body;
  try {
    const orders = await OrderModel.find({
      "items.artistUserID": userID,
      status: { $ne: "created" },
    }).sort({ createdAt: -1 });
    res.status(200).send(orders);
  } catch (error) {
    console.error("Error fetching sales orders:", error);
    res.status(500).json({ error: "Could not fetch sales orders" });
  }
};

// Artist advances the status of an order containing their art.
const updateOrderStatus = async (req, res) => {
  const { userID } = req.body;
  const { id } = req.params;
  const { status } = req.body;
  try {
    const order = await OrderModel.findById(id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    const sellsInThisOrder = order.items.some(
      (item) => item.artistUserID === userID
    );
    if (!sellsInThisOrder) {
      return res.status(403).json({ error: "Not authorized to update this order" });
    }

    const allowedNext = ALLOWED_TRANSITIONS[order.status] || [];
    if (!allowedNext.includes(status)) {
      return res.status(400).json({
        error: `Cannot move order from "${order.status}" to "${status}"`,
      });
    }

    order.status = status;
    order.statusHistory.push({ status });
    await order.save();
    res.status(200).json(order);
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Could not update order status" });
  }
};

// Buyer cancels their own order while it's still early in the lifecycle.
const cancelOrder = async (req, res) => {
  const { userID } = req.body;
  const { id } = req.params;
  try {
    const order = await OrderModel.findOne({ _id: id, userId: userID });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    if (!["paid", "processing"].includes(order.status)) {
      return res.status(400).json({ error: "This order can no longer be cancelled" });
    }

    order.status = "cancelled";
    order.statusHistory.push({ status: "cancelled" });
    await order.save();
    res.status(200).json(order);
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ error: "Could not cancel order" });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getMyOrders,
  getSalesOrders,
  updateOrderStatus,
  cancelOrder,
};
