const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    productTitle: {
      type: String,
      required: true,
    },
    validity: {
      type: Number,
      required: true,
    },
    img: {
      prize: {
        type: String,
        default: null,
      },
      product: {
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
    orderCount: {
      type: Number,
      default: 0,
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
    drawDate: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["Drafted", "Published", "Expired"],
      required: true,
    },
    displayStatus: [
      {
        status: {
          type: String,
          enum: ["Hero", "Selling Fast", "Upcoming", "Explore"],
          default: null,
        },
      },
    ],
    description: {
      type: String,
      default: null,
    },
    ticketQtyGen: {
      type: Number,
      default: 1,
    },
    offer: {
      validity: {
        type: Number,
        default: 0,
      },
      percentage: {
        type: Number,
        default: 0,
      },
      minAmount: {
        type: Number,
        default: 0,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Campaign", campaignSchema);
