const Ticket = require("../Models/ticket");

exports.handleTicket = (req, res, next) => {
  let tickets = [];
  const { orderItems, orderID } = req.body;
  const user = req.user._id;
  orderItems.map((item) => {
    var count = item.qty * item.ticketQty;
    for (var i = 0; i < count; i++) {
      tickets.push({
        user: user,
        ticketNumber: `WL-${Math.floor(100000 + Math.random() * 900000)}-Y`,
        campaign: item.campaign_id,
        orderID: orderID,
      });
    }
    req.tickets = tickets;
  });
  next();
};

exports.generateTicket = (req, res, next) => {
  Ticket.insertMany(req.tickets, (error, data) => {
    if (error) {
      return res.status(400).json({ msg: "En Error Encountered!", error });
    }
    if (data) {
      req.data = data.map((i) => {
        return { ticket: i._id };
      });
      next();
    }
  });
};

exports.getTicketByUser = (req, res) => {
  Ticket.find({ user: req.user._id })
    .populate({ path: "campaign" })
    .exec((error, tickets) => {
      if (error) {
        return res.status(400).json({ msg: "Something Went Wrong!" });
      }
      if (tickets) {
        return res.status(200).json({ tickets });
      }
    });
};

exports.getAllTicket = (req, res) => {
  Ticket.find()
    .populate({ path: "campaign user" })
    .exec((error, tickets) => {
      if (error) {
        return res.status(400).json({ msg: "Something Went Wrong!" });
      }
      if (tickets) {
        return res.status(200).json({ tickets });
      }
    });
};
