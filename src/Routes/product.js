const express = require("express");
const { createProduct, getProduct } = require("../Controllers/product");
const { uploads3, requireSignIn, adminMiddleware } = require("../Middlewares");
const router = express.Router();

router.post(
  "/product/create",
  requireSignIn,
  // adminMiddleware,
  uploads3.single("img"),
  createProduct
);
router.get("/product/get", getProduct);

module.exports = router;
