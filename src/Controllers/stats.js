const Campaign = require("../Models/campaign");
const Message = require("../Models/message");
const Order = require("../Models/order");
const Ticket = require("../Models/ticket");
const User = require("../Models/user");
const Cart = require("../Models/cart");

exports.getAllStats = async (req, res) => {
  try {
    const [
      campaignCount,
      cartCount,
      messageCount,
      orderCount,
      ticketCount,
      userCount,
    ] = await Promise.all([
      Campaign.countDocuments().exec(),
      Cart.countDocuments().exec(),
      Message.countDocuments().exec(),
      Order.countDocuments().exec(),
      Ticket.countDocuments().exec(),
      User.countDocuments().exec(),
    ]);

    res.json({
      campaignCount,
      cartCount,
      messageCount,
      orderCount,
      ticketCount,
      userCount,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Failed to get stats" });
  }
};
