const Campaign = require("../Models/campaign");
const User = require("../Models/user");
const Ticket = require("../Models/ticket");

exports.getWinner = (req, res) => {
  Ticket.findOne({ ticketNumber: req.body.ticketNumber })
    .populate({ path: "user" })
    .exec((error, ticket) => {
      if (error) {
        return res.status(400).json({ msg: "Something went wrong!" });
      }
      if (ticket) {
        return res.status(200).json({
          winner: {
            ticketNumber: ticket.ticketNumber,
            userName: ticket.user.firstName + " " + ticket.user.lastName,
            email: ticket.user.email,
            country: ticket.user.country,
          },
        });
      } else {
        return res.status(404).json({ msg: "Invalid Ticket Number" });
      }
    });
};

exports.setWinner = (req, res) => {
  Campaign.findOneAndUpdate(
    { _id: req.body._id },
    {
      $set: {
        winner: {
          ticketNumber: req.body.ticketNumber,
          userName: req.body.userName,
        },
      },
    },
    { new: true }
  ).exec((error, campaign) => {
    if (error) {
      return res
        .status(400)
        .json({ msg: "Something Went Wrong. Please Try Again Later." });
    }
    if (campaign) {
      return res
        .status(201)
        .json({ msg: "Congratulations! Winner Announched.", campaign });
    }
  });
};
