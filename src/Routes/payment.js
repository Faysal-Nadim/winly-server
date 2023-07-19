const express = require("express");
const {
  createPaymentIntent,
  getStripeKey,
  getPaypalKey,
} = require("../Controllers/payment");
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
router.get(
  "/payment/paypal/get-key",
  requireSignIn,
  userMiddleware,
  getPaypalKey
);

module.exports = router;
