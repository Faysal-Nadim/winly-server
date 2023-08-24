const express = require("express");
const {
  createPaymentIntent,
  getStripeKey,
  createPaypalOrder,
  capturePaypalPayment,
  getRfid,
  updateWallet,
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

router.post("/payment/paypal/create-order", createPaypalOrder);
router.post("/payment/paypal/capture-order", capturePaypalPayment);
// router.get("/rfid", getRfid);
// router.get("/order/update", updateWallet);

module.exports = router;
