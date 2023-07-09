const express = require("express");
const env = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

env.config();

//Route Config
const userRoute = require("./Routes/user");
const campaignRoute = require("./Routes/campaign");
const productRoute = require("./Routes/product");
const cartRoute = require("./Routes/cart");
const orderRoute = require("./Routes/order");
const ticketRoute = require("./Routes/ticket");
const stripeRoute = require("./Routes/stripe");

//Database Config
mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@winly.anq6up1.mongodb.net/?retryWrites=true&w=majority`,
    { dbName: "winly" }
  )
  .then(() => console.log("Database Connected"))
  .catch((err) => console.log(err));
mongoose.set("strictQuery", true);
//Server Config
app.use(cors());
app.options("*", cors());
app.use(express.json());

//API Config
app.use("/api/v1", userRoute);
app.use("/api/v1", campaignRoute);
app.use("/api/v1", productRoute);
app.use("/api/v1", cartRoute);
app.use("/api/v1", orderRoute);
app.use("/api/v1", ticketRoute);
app.use("/api/v1", stripeRoute);

app.listen(process.env.PORT, () => {
  console.log(`Sever Running On PORT ${process.env.PORT}`);
});

module.exports = app;
