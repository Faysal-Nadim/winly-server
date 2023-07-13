const express = require("express");
const {
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
} = require("../Controllers/product");
const { uploads3, requireSignIn, adminMiddleware } = require("../Middlewares");
const router = express.Router();

router.post("/product/create", createProduct);
router.post("/product/update", updateProduct);
router.post("/product/delete", deleteProduct);
router.get("/product/get", getProduct);

module.exports = router;
