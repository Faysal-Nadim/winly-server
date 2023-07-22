const Order = require("../Models/order");
const Ticket = require("../Models/ticket");
const Campaign = require("../Models/campaign");
const User = require("../Models/user");

exports.placeOrder = (req, res) => {
  const { orderTotal, orderItems, orderID, address } = req.body;
  const _order = new Order({
    user: req.user._id,
    orderID: orderID,
    orderItems: orderItems,
    orderTotal: orderTotal,
    tickets: req.data,
    address: address,
  });
  _order.save((error, order) => {
    if (error) {
      return res.status(400).json(error);
    }
    if (order) {
      return res.status(201).json(order);
    }
  });
};

exports.getAllOrders = (req, res) => {
  Order.find()
    .populate("user", "_id firstName lastName img email dialCode phone") // Populates the 'user' field with selected properties
    .populate({
      path: "orderItems.campaign_id",
      select: "_id title productTitle", // Selects specific properties from the 'Campaign' model
    })
    .populate("tickets.ticket", "_id ticketNumber") // Populates the 'tickets.ticket' field with selected properties
    .exec((error, orders) => {
      if (error) {
        return res.status(400).json({ msg: "Something Went Wrong", error });
      }
      if (orders) {
        return res.status(200).json({ orders });
      }
    });
};
