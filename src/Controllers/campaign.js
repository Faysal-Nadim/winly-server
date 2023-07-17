const Campaign = require("../Models/campaign");

exports.createCampaign = (req, res) => {
  const {
    title,
    productTitle,
    ticketQty,
    stockQty,
    price,
    validity,
    drawDate,
    status,
    displayStatus,
    img,
  } = req.body;
  const D = new Date();
  const _campaign = new Campaign({
    title,
    productTitle,
    ticketQty,
    stockQty,
    price,
    validity: D.getTime(validity),
    img,
    drawDate: D.toDateString(drawDate),
    status,
    displayStatus,
  });

  _campaign.save((error, campaign) => {
    if (error) {
      return res.status(400).json({ msg: "Something Went Wrong", error });
    }
    if (campaign) {
      return res.status(201).json({ msg: "Campaign Created!", campaign });
    }
  });
};

exports.getCampaign = (req, res) => {
  Campaign.find().exec((error, campaigns) => {
    if (error) {
      return res.status(400).json({ msg: "Something Went Wrong" });
    }
    if (campaigns) {
      return res.status(200).json({
        campaigns: {
          hero: campaigns.filter(
            (c) => c.status === "Published" && c.displayStatus === "Hero"
          ),
          sellingFast: campaigns.filter(
            (c) =>
              c.status === "Published" && c.displayStatus === "Selling Fast"
          ),
          upcoming: campaigns.filter(
            (c) => c.status === "Published" && c.displayStatus === "Upcoming"
          ),
          explore: campaigns.filter(
            (c) => c.status === "Published" && c.displayStatus === "Explore"
          ),
          expired: campaigns.filter((c) => c.status === "Expired"),
        },
      });
    }
  });
};

exports.getAllCampaign = (req, res) => {
  Campaign.find().exec((error, campaigns) => {
    if (error) {
      return res.status(400).json({ msg: "Something Went Wrong" });
    }
    if (campaigns) {
      return res.status(200).json({ campaigns });
    }
  });
};

exports.updateCampaign = (req, res) => {
  const {
    _id,
    title,
    productTitle,
    ticketQty,
    stockQty,
    price,
    validity,
    drawDate,
    status,
    displayStatus,
    img,
  } = req.body;
  const D = new Date();

  Campaign.findOneAndUpdate(
    { _id: _id },
    {
      $set: {
        title: title,
        productTitle: productTitle,
        ticketQty: ticketQty,
        stockQty: stockQty,
        price: price,
        validity: D.getTime(validity),
        img: img,
        drawDate: drawDate,
        status: status,
        displayStatus: displayStatus,
      },
    },
    { new: true }
  ).exec((error, campaign) => {
    if (error) {
      return res.status(400).json({ msg: "Something Went Wrong", error });
    }
    if (campaign) {
      return res.status(200).json({ msg: "Campaign Updated!", campaign });
    }
  });
};

exports.deleteCampaign = (req, res) => {
  Campaign.deleteOne({ _id: req.body._id }).exec((error, success) => {
    if (error) {
      return res.status(400).json({ msg: "Something Went Wrong", error });
    }
    if (success) {
      return res.status(200).json({ msg: "Campaign Deleted!" });
    }
  });
};

exports.updateStatus = (req, res) => {
  Campaign.findOneAndUpdate(
    { _id: req.body._id },
    {
      $set: {
        status: req.body.status,
      },
    },
    { new: true }
  ).exec((error, campaign) => {
    if (error) {
      return res.status(400).json({ msg: "Something Went Wrong", error });
    }
    if (campaign) {
      return res.status(200).json({ msg: "Status Updated!", campaign });
    }
  });
};

exports.updateDisplayStatus = (req, res) => {
  Campaign.findOneAndUpdate(
    { _id: req.body._id },
    {
      $set: {
        displayStatus: req.body.displayStatus,
      },
    },
    { new: true }
  ).exec((error, campaign) => {
    if (error) {
      return res.status(400).json({ msg: "Something Went Wrong", error });
    }
    if (campaign) {
      return res.status(200).json({ msg: "Status Updated!", campaign });
    }
  });
};
