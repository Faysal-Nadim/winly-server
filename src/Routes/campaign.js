const express = require("express");
const {
  createCampaign,
  getCampaign,
  getProductByCampaign,
  updateCampaign,
  deleteCampaign,
  updateStatus,
  updateDisplayStatus,
} = require("../Controllers/campaign");
const router = express.Router();

router.post("/campaign/create", createCampaign);
router.post("/campaign/update", updateCampaign);
router.post("/campaign/update/status", updateStatus);
router.post("/campaign/update/display-status", updateDisplayStatus);
router.post("/campaign/delete", deleteCampaign);
router.post("/campaign/product/get", getProductByCampaign);
router.get("/campaign/get", getCampaign);

module.exports = router;
