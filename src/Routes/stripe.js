const express = require("express");
const { createPaymentIntent, getStripeKey } = require("../Controllers/stripe");
const { requireSignIn, userMiddleware } = require("../Middlewares");
const router = express.Router();

router.get(
  "/payment/stripe/get-key",
  requireSignIn,
  userMiddleware,
  getStripeKey
);
router.post(
  "/payment/stripe/create-intent",
  requireSignIn,
  userMiddleware,
  createPaymentIntent
);

module.exports = router;
