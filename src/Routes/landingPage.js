const express = require("express");

const { requireSignIn, adminMiddleware } = require("../Middlewares");
const {
  updateLandingPage,
  getAllLandingPage,
  //   submitLandingPage,
} = require("../Controllers/landingPage");
const router = express.Router();

// router.post("/lp/create", submitLandingPage);
router.get("/lp/get/all", requireSignIn, adminMiddleware, getAllLandingPage);
router.post("/lp/update", requireSignIn, adminMiddleware, updateLandingPage);

module.exports = router;
