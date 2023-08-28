const stripe = require("stripe")(process.env.STRIPE_SECRET);
const fetch = require("node-fetch");
const User = require("../Models/user");
const Order = require("../Models/order");

//Stripe
exports.getStripeKey = (req, res) => {
  res.send({ publishableKey: process.env.STRIPE_KEY });
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

exports.createPaymentIntentForCustomer = async (req, res) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: req.body.amount * 100,
      currency: "aed",
      automatic_payment_methods: {
        enabled: true,
      },
      customer: req.body.customer_id,
      payment_method: req.body.payment_id,
      return_url: "https://winly.net/order/success",
      off_session: true,
      confirm: true,
    });
    return res
      .status(200)
      .json({ status: paymentIntent.status, id: paymentIntent.id });
  } catch (err) {
    return res.status(400).send({
      error: {
        message: err.message,
      },
      err,
    });
  }
};

exports.createCustomer = async (req, res, next) => {
  const customer = await stripe.customers.create({
    email: req.body.email,
    name: `${req.body.firstName} ${req.body.lastName}`,
  });
  req.customer = customer;
  next();
};

exports.createSetupIntent = async (req, res) => {
  const setupIntent = await stripe.setupIntents.create({
    customer: req.body.customer,
    automatic_payment_methods: {
      enabled: true,
    },
  });
  res.send({
    clientSecret: setupIntent.client_secret,
  });
};

exports.getPaymentMethods = async (req, res) => {
  const methods = await stripe.customers.listPaymentMethods(req.body.customer, {
    type: "card",
  });
  return res.status(200).json({ methods: methods.data });
};

//Paypal

const CLIENT_ID = process.env.CLIENT_ID;
const APP_SECRET = process.env.APP_SECRET;
const base = "https://api.paypal.com";

async function createOrder(data) {
  const accessToken = await generateAccessToken();
  const url = `${base}/v2/checkout/orders`;
  const response = await fetch(url, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: data.amount,
          },
        },
      ],
    }),
  });

  return handleResponse(response);
}

async function capturePayment(orderId) {
  const accessToken = await generateAccessToken();
  const url = `${base}/v2/checkout/orders/${orderId}/capture`;
  const response = await fetch(url, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return handleResponse(response);
}

async function generateAccessToken() {
  const auth = Buffer.from(CLIENT_ID + ":" + APP_SECRET).toString("base64");
  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: "post",
    body: "grant_type=client_credentials",
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });

  const jsonData = await handleResponse(response);
  return jsonData.access_token;
}

async function handleResponse(response) {
  if (response.status === 200 || response.status === 201) {
    return response.json();
  }
  const errorMessage = await response.text();
  throw new Error(errorMessage);
}

exports.createPaypalOrder = async (req, res) => {
  try {
    const order = await createOrder(req.body);
    res.json(order);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

exports.capturePaypalPayment = async (req, res) => {
  const { orderID } = req.body;
  try {
    const captureData = await capturePayment(orderID);
    res.json(captureData);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

//PayMob

// exports.createPaymobPayment = () => {
//   const url = ` https://uae.paymob.com/v1/intention/`;
// };
