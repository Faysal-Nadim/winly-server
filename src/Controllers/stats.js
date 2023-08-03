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

    const pipeline = [
      {
        $group: {
          _id: null,
          totalSum: { $sum: "$orderTotal" },
        },
      },
    ];

    const result = await Order.aggregate(pipeline);
    let earningCount = 0;
    if (result.length > 0) {
      earningCount = result[0].totalSum;
    } else {
      earningCount = 0;
    }

    res.json({
      campaignCount,
      cartCount,
      messageCount,
      orderCount,
      ticketCount,
      userCount,
      earningCount,
    });
  } catch (error) {
    res.status(400).json({ error: "Failed to get stats" });
  }
};
