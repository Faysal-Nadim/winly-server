const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
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
    ticketQty: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    stockQty: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    orderCount: {
      type: Number,
      default: 0,
    },
    campaign: {
      campaign_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Campaign",
        default: null,
      },
      campaign_name: {
        type: String,
        default: null,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
