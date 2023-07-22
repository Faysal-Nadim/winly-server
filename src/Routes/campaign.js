const express = require("express");
const {
  createCampaign,
  getCampaign,
  updateCampaign,
  deleteCampaign,
  updateStatus,
  updateDisplayStatus,
  getAllCampaign,
} = require("../Controllers/campaign");
const { requireSignIn, adminMiddleware } = require("../Middlewares");
const router = express.Router();

router.post("/campaign/create", requireSignIn, adminMiddleware, createCampaign);
router.post("/campaign/update", requireSignIn, adminMiddleware, updateCampaign);
router.post(
  "/campaign/update/status",
  requireSignIn,
  adminMiddleware,
  updateStatus
);
router.post(
  "/campaign/update/display-status",

  updateDisplayStatus
);
router.post("/campaign/delete", requireSignIn, adminMiddleware, deleteCampaign);
router.get("/campaign/get/all", requireSignIn, adminMiddleware, getAllCampaign);
router.get("/campaign/get", getCampaign);

module.exports = router;
