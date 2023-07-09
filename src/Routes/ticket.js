const express = require("express");
const { getTicketByUser } = require("../Controllers/ticket");
const { requireSignIn, userMiddleware } = require("../Middlewares");
const router = express.Router();

router.get("/user/ticket/get", requireSignIn, userMiddleware, getTicketByUser);

module.exports = router;
