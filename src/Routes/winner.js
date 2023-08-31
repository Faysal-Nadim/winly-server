const express = require("express");
const { getWinner, setWinner } = require("../Controllers/winner");
const { requireSignIn, adminMiddleware } = require("../Middlewares");
const router = express.Router();

router.post("/winner/get", requireSignIn, adminMiddleware, getWinner);
router.post("/winner/set", requireSignIn, adminMiddleware, setWinner);

module.exports = router;
