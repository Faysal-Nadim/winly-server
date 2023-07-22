const mongoose = require("mongoose");

const landingPageSchema = new mongoose.Schema(
  {
    heroCountImage: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LandingPage", landingPageSchema);
