const Order = require("../Models/order");
const Ticket = require("../Models/ticket");
const Campaign = require("../Models/campaign");
const User = require("../Models/user");

exports.placeOrder = (req, res) => {
  const { orderTotal, orderItems, orderID, address, trxID } = req.body;
  const _order = new Order({
    user: req.user._id,
    orderID: orderID,
    orderItems: orderItems,
    orderTotal: orderTotal,
    tickets: req.data,
    address: address,
    trxID: trxID,
  });
  _order.save((error, order) => {
    if (error) {
      return res.status(400).json(error);
    }
    if (order) {
      User.findOneAndUpdate(
        { _id: req.user._id },
        { $set: { wallet: { available: 0 } } },
        { new: true }
      ).exec((error, user) => {
        const {
          _id,
          firstName,
          lastName,
          fullName,
          email,
          phone,
          role,
          gender,
          img,
          dob,
          country,
          dialCode,
          wallet,
        } = user;
        order.orderItems.forEach((e) => {
          Campaign.findOne({ _id: e.campaign_id }).exec((err, campaign) => {
            Campaign.findOneAndUpdate(
              { _id: campaign._id },
              { $set: { orderCount: campaign.orderCount + e.qty } }
            ).exec();
          });
        });
        return res.status(201).json({
          order,
          user: {
            _id,
            firstName,
            lastName,
            fullName,
            email,
            phone,
            role,
            gender,
            img,
            dob,
            country,
            dialCode,
            wallet,
          },
        });
      });
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
