const express = require("express");
const { getTicketByUser, getAllTicket } = require("../Controllers/ticket");
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
  getAllTicket
);

module.exports = router;
