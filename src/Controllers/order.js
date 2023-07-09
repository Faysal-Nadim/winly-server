const Order = require("../Models/order");
const Ticket = require("../Models/ticket");

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
