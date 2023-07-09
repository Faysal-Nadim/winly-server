const Campaign = require("../Models/campaign");
const Product = require("../Models/product");

exports.createCampaign = (req, res) => {
  const { title, validity, draw_date, status } = req.body;
  const img = { url: req.file.location, key: req.file.key };
  const D = new Date(validity);
  const _campaign = new Campaign({
    title,
    validity: D.getTime(),
    img,
    draw_date,
    status,
  });

  _campaign.save((error, campaign) => {
    if (error) {
      return res.status(400).json({ msg: "Something Went Wrong" });
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
      return res.status(200).json({ campaigns });
    }
  });
};

exports.getProductByCampaign = (req, res) => {
  Product.find({ campaign: req.body.campaign }).exec((error, products) => {
    if (error) {
      return res.status(400).json({ msg: "Something Went Wrong" });
    }
    if (products) {
      return res.status(201).json({ products });
    }
  });
};
