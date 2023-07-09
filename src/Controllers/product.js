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
  } = req.body;
  const img = { url: req.file.location, key: req.file.key };
  const _product = new Product({
    title,
    price,
    img,
    stockQty,
    ticketQty,
    description,
    campaign: { campaign_id: campaign_id, campaign_name: campaign_name },
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
