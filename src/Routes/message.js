const express = require("express");
const { submitMessage, getAllMessage } = require("../Controllers/message");
const { requireSignIn, adminMiddleware } = require("../Middlewares");
const router = express.Router();

router.post("/query/submit", submitMessage);
router.get("/query/get/all", requireSignIn, adminMiddleware, getAllMessage);

module.exports = router;
