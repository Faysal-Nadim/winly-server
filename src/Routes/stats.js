const express = require("express");

const { requireSignIn, adminMiddleware } = require("../Middlewares");
const { getAllStats } = require("../Controllers/stats");

const router = express.Router();

router.get("/stats/get", requireSignIn, adminMiddleware, getAllStats);
// router.get("/stats/get", getAllStats);

module.exports = router;
