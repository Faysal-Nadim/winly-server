const express = require("express");
const { addToCart, getCart, removeCart } = require("../Controllers/cart");
const { requireSignIn, userMiddleware } = require("../Middlewares");
const router = express.Router();

router.post("/user/cart/add", requireSignIn, userMiddleware, addToCart);
router.get("/user/cart/get", requireSignIn, userMiddleware, getCart);
router.post("/user/cart/remove", requireSignIn, userMiddleware, removeCart);

module.exports = router;
