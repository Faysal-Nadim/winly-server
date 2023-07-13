const Campaign = require("../Models/campaign");
const Product = require("../Models/product");

exports.createCampaign = (req, res) => {
  const { title, validity, draw_date, status, product, displayStatus, img } =
    req.body;
  const D = new Date(validity);
  const _campaign = new Campaign({
    title,
    validity: D.getTime(),
    img,
    draw_date,
    status,
    product,
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
  Campaign.find()
    .populate({ path: "product" })
    .exec((error, campaigns) => {
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
  Campaign.find()
    .populate({ path: "product" })
    .exec((error, campaigns) => {
      if (error) {
        return res.status(400).json({ msg: "Something Went Wrong" });
      }
      if (campaigns) {
        return res.status(400).json({ campaigns });
      }
    });
};

exports.getProductByCampaign = (req, res) => {
  Product.find({ campaign: req.body.campaign }).exec((error, products) => {
    if (error) {
      return res.status(400).json({ msg: "Something Went Wrong" });
    }
    if (products) {
      return res.status(200).json({ products });
    }
  });
};

exports.updateCampaign = (req, res) => {
  const {
    _id,
    title,
    validity,
    draw_date,
    status,
    products,
    displayStatus,
    img,
  } = req.body;
  const D = new Date(validity);

  Campaign.findOneAndUpdate(
    { _id: _id },
    {
      $set: {
        title: title,
        validity: D.getTime(),
        img: img,
        draw_date: draw_date,
        status: status,
        products: products,
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
      return res.status(201).json({ msg: "Campaign Deleted!" });
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
