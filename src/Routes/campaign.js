const express = require("express");
const {
  createCampaign,
  getCampaign,
  getProductByCampaign,
} = require("../Controllers/campaign");
const { uploads3 } = require("../Middlewares");
const router = express.Router();

router.post("/campaign/create", uploads3.single("img"), createCampaign);
router.post("/campaign/product/get", getProductByCampaign);
router.get("/campaign/get", getCampaign);

module.exports = router;
