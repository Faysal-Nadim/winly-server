const express = require("express");
const { placeOrder } = require("../Controllers/order");
const { handleTicket, generateTicket } = require("../Controllers/ticket");
const { requireSignIn, userMiddleware } = require("../Middlewares");
const router = express.Router();

router.post(
  "/user/order/place",
  requireSignIn,
  userMiddleware,
  handleTicket,
  generateTicket,
  placeOrder
);

module.exports = router;
