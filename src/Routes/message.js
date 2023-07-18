const express = require("express");
const { submitMessage } = require("../Controllers/message");
const router = express.Router();

router.post("/query/submit", submitMessage);

module.exports = router;
