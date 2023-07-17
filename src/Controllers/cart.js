const Cart = require("../Models/cart");

exports.addToCart = (req, res) => {
  Cart.findOne({ user: req.user._id }).exec((error, cart) => {
    if (error) {
      return res.status(400).json({ msg: "Something Went Wrong." });
    }
    if (cart) {
      const campaignID = req.body.cartItems.campaign;
      const campaign = cart.cartItems.find((c) => c.campaign == campaignID);
      let condition, update;
      if (campaign) {
        condition = { user: req.user._id, "cartItems.campaign": campaignID };
        update = {
          $set: {
            "cartItems.$": {
              ...req.body.cartItems,
              qty: campaign.qty + +req.body.cartItems.qty,
            },
          },
        };
      } else {
        condition = { user: req.user._id };
        update = {
          $push: {
            cartItems: req.body.cartItems,
          },
        };
      }
      Cart.findOneAndUpdate(condition, update, { new: true }).exec(
        (error, _cart) => {
          if (error) {
            return res.status(400).json({ error });
          }
          if (_cart) {
            return res.status(201).json({ cart: _cart });
          }
        }
      );
    } else {
      const newcart = new Cart({
        user: req.user._id,
        cartItems: req.body.cartItems,
      });

      newcart.save((error, cart) => {
        if (error) return res.status(400).json({ error });
        if (cart) {
          return res.status(201).json({ cart });
        }
      });
    }
  });
};

exports.getCart = (req, res) => {
  Cart.findOne({ user: req.user._id })
    .populate({ path: "cartItems.campaign" })
    .exec((error, cart) => {
      if (error) return res.status(400).json({ error });
      if (cart) {
        return res.status(200).json({ cart });
      }
    });
};

exports.removeCart = (req, res) => {
  Cart.updateOne(
    { user: req.user._id },
    {
      $pull: {
        cartItems: {
          _id: req.body._id,
        },
      },
    },
    { new: true }
  ).exec((error, result) => {
    if (error) return res.status(400).json({ error });
    if (result) {
      res.status(202).json({ result });
    }
  });
};
