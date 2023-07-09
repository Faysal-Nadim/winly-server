const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderID: {
      type: Number,
      required: true,
    },
    orderItems: [
      {
        product_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        qty: {
          type: Number,
          required: true,
        },
        ticketQty: {
          type: Number,
          required: true,
        },
        campaign_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Campaign",
          required: true,
        },
      },
    ],
    orderTotal: {
      type: Number,
      required: true,
    },
    tickets: [
      {
        ticket: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Ticket",
          required: true,
        },
      },
    ],
    address: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
