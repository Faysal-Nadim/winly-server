const express = require("express");
const { addToCart, getCart } = require("../Controllers/cart");
const { requireSignIn, userMiddleware } = require("../Middlewares");
const router = express.Router();

router.post("/user/cart/add", requireSignIn, userMiddleware, addToCart);
router.get("/user/cart/get", requireSignIn, userMiddleware, getCart);

module.exports = router;
