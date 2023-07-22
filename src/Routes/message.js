const express = require("express");
const {
  submitMessage,
  getAllMessage,
  updateMessage,
} = require("../Controllers/message");
const { requireSignIn, adminMiddleware } = require("../Middlewares");
const router = express.Router();

router.post("/query/submit", submitMessage);
router.get("/query/get/all", requireSignIn, adminMiddleware, getAllMessage);
router.post("/query/update", requireSignIn, adminMiddleware, updateMessage);

module.exports = router;
