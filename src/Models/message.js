const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      enum: ["Technical", "Generel", "Payment"],
      default: "Generel",
    },
    msg: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Resolved"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
