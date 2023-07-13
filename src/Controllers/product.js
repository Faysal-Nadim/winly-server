const Product = require("../Models/product");

exports.createProduct = (req, res) => {
  const {
    title,
    price,
    stockQty,
    description,
    campaign_id,
    campaign_name,
    ticketQty,
    img,
  } = req.body;
  const _product = new Product({
    title,
    price,
    img,
    stockQty,
    ticketQty,
    description,
    campaign: { campaign_id: campaign_id, campaign_name: campaign_name },
    img,
  });
  _product.save((error, product) => {
    if (error) {
      return res
        .status(400)
        .json({ msg: "Something Went Wrong", error: error });
    }
    if (product) {
      return res.status(201).json({ msg: "New Product Added!", product });
    }
  });
};

exports.getProduct = (req, res) => {
  Product.find()
    .populate({ path: "campaign.campaign_id" })
    .exec((error, products) => {
      if (error) {
        return res.status(400).json({ msg: "Something Went Wrong" });
      }
      if (products) {
        return res.status(200).json({ products });
      }
    });
};

exports.updateProduct = (req, res) => {
  const {
    _id,
    title,
    price,
    stockQty,
    description,
    campaign_id,
    campaign_name,
    ticketQty,
    img,
  } = req.body;
  Product.findOneAndUpdate(
    { _id: _id },
    {
      $set: {
        title: title,
        price: price,
        stockQty: stockQty,
        description: description,
        campaign: {
          campaign_id: campaign_id,
          campaign_name: campaign_name,
        },
        ticketQty: ticketQty,
        img: img,
      },
    },
    { new: true }
  ).exec((error, product) => {
    if (error) {
      return res
        .status(400)
        .json({ msg: "Something Went Wrong", error: error });
    }
    if (product) {
      return res.status(200).json({ msg: "New Product Added!", product });
    }
  });
};

exports.deleteProduct = (req, res) => {
  Product.deleteOne({ _id: _id }).exec((error, success) => {
    if (error) {
      return res.status(400).json({ msg: "Something Went Wrong", error });
    }
    if (success) {
      return res.status(201).json({ msg: "Campaign Deleted!" });
    }
  });
};
