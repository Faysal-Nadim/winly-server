const stripe = require("stripe")(process.env.STRIPE_SECRET);

exports.getStripeKey = (req, res) => {
  res.send({ publishableKey: process.env.STRIPE_KEY });
};

exports.getPaypalKey = (req, res) => {
  res.send({ publishableKey: process.env.PAYPAL_KEY });
};

exports.createPaymentIntent = async (req, res) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: req.body.amount * 100,
      currency: "aed",
      automatic_payment_methods: {
        enabled: true,
      },
    });
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    return res.status(400).send({
      error: {
        message: err.message,
      },
    });
  }
};
