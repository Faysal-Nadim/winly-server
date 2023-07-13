const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    validity: {
      type: Number,
      required: true,
    },
    img: {
      url: {
        type: String,
        default: null,
      },
      key: {
        type: String,
        default: null,
      },
    },
    winner: {
      ticketNumber: {
        type: Number,
        default: null,
      },
      userName: {
        type: String,
        default: null,
      },
    },
    draw_date: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["Drafted", "Published", "Expired"],
      required: true,
    },
    displayStatus: {
      type: String,
      enum: ["Featured", "Selling Fast"],
      default: null,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Campaign", campaignSchema);
