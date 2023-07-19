const express = require("express");
const { getTicketByUser } = require("../Controllers/ticket");
const {
  requireSignIn,
  userMiddleware,
  adminMiddleware,
} = require("../Middlewares");
const router = express.Router();

router.get("/user/ticket/get", requireSignIn, userMiddleware, getTicketByUser);
router.get(
  "/admin/ticket/get/all",
  requireSignIn,
  adminMiddleware,
  getTicketByUser
);

module.exports = router;
