const Cart = require("../Models/cart");

exports.addToCart = (req, res) => {
  Cart.findOne({ user: req.user._id }).exec((error, cart) => {
    if (error) {
      return res.status(400).json({ msg: "Something Went Wrong." });
    }
    if (cart) {
      const productID = req.body.cartItems.product;
      const product = cart.cartItems.find((c) => c.product == productID);
      let condition, update;
      if (product) {
        condition = { user: req.user._id, "cartItems.product": productID };
        update = {
          $set: {
            "cartItems.$": {
              ...req.body.cartItems,
              qty: product.qty + +req.body.cartItems.qty,
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
    .populate("cartItems.product", "title img ticketQty campaign")

    .exec((error, cart) => {
      if (error) return res.status(400).json({ error });
      if (cart) {
        return res.status(200).json({ cart });
      }
    });
};
