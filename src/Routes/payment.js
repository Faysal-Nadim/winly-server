const express = require("express");
const {
  createPaymentIntent,
  getStripeKey,
  createPaypalOrder,
  capturePaypalPayment,
  getRfid,
  updateWallet,
  createCustomer,
  createSetupIntent,
  getPaymentMethods,
  createPaymentIntentForCustomer,
  detachPayment,
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
router.post(
  "/payment/stripe/create-setup-intent",
  requireSignIn,
  userMiddleware,
  createSetupIntent
);
router.post(
  "/payment/stripe/get-payment-methods",
  requireSignIn,
  userMiddleware,
  getPaymentMethods
);
router.post(
  "/payment/stripe/charge-saved-card",
  requireSignIn,
  userMiddleware,
  createPaymentIntentForCustomer
);

router.post(
  "/payment/stripe/delete-saved-card",
  requireSignIn,
  userMiddleware,
  detachPayment
);

router.post("/payment/paypal/create-order", createPaypalOrder);
router.post("/payment/paypal/capture-order", capturePaypalPayment);

module.exports = router;
