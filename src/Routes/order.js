const express = require("express");
const { placeOrder, getAllOrders } = require("../Controllers/order");
const { handleTicket, generateTicket } = require("../Controllers/ticket");
const {
  requireSignIn,
  userMiddleware,
  adminMiddleware,
} = require("../Middlewares");
const router = express.Router();

router.post(
  "/user/order/place",
  requireSignIn,
  userMiddleware,
  handleTicket,
  generateTicket,
  placeOrder
);

router.get(
  "/admin/order/get/all",
  requireSignIn,
  adminMiddleware,
  getAllOrders
);

module.exports = router;
