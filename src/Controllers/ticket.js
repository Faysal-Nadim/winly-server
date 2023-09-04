const Ticket = require("../Models/ticket");
const nodemailer = require("nodemailer");

exports.handleTicket = (req, res, next) => {
  let tickets = [];
  const { orderItems, orderID } = req.body;
  const user = req.user._id;
  orderItems.map((item) => {
    var count = item.qty * item.ticketQty;
    for (var i = 0; i < count; i++) {
      tickets.push({
        user: user,
        ticketNumber: `WL-${Math.floor(100000 + Math.random() * 900000)}-Y`,
        campaign: item.campaign_id,
        orderID: orderID,
      });
    }
    req.tickets = tickets;
  });
  next();
};

exports.generateTicket = (req, res, next) => {
  Ticket.insertMany(req.tickets, (error, data) => {
    if (error) {
      return res.status(400).json({ msg: "En Error Encountered!", error });
    }
    if (data) {
      req.data = data.map((i) => {
        return { ticket: i._id };
      });
      next();
    }
  });
};

exports.getTicketByUser = (req, res) => {
  Ticket.find({ user: req.user._id })
    .populate({ path: "campaign" })
    .exec((error, tickets) => {
      if (error) {
        return res.status(400).json({ msg: "Something Went Wrong!" });
      }
      if (tickets) {
        return res.status(200).json({ tickets });
      }
    });
};

exports.getAllTicket = (req, res) => {
  Ticket.find()
    .populate({ path: "campaign user" })
    .exec((error, tickets) => {
      if (error) {
        return res.status(400).json({ msg: "Something Went Wrong!" });
      }
      if (tickets) {
        return res.status(200).json({ tickets });
      }
    });
};

async function sendFreeTicketEmail(data) {
  const transporter = nodemailer.createTransport({
    host: "mail.privateemail.com",
    port: 465,
    secure: true,
    auth: {
      user: "no-reply@winly.net",
      pass: `${process.env.EMAIL_PASS}`,
    },
  });

  const info = await transporter.sendMail({
    from: "Winly LLC.<no-reply@winly.net>",
    to: `${data.email}`,
    subject: "Free Ticket From Winly",
    html: `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title></title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@100;200;300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css"
          rel="stylesheet"
          integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3"
          crossorigin="anonymous"
        />
      </head>
      <body
        style="
          font-family: 'Montserrat', sans-serif;
          max-width: 600px;
          margin: 0 auto;
          border-radius: 8px;
          box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
          padding-bottom: 5px;
        "
      >
        <div
          style="
            padding: 20px;
            text-align: center;
            box-shadow: inherit 0 0 10px gray;
            background-color: #f8f9fa;
            box-sizing: border-box;
            border-radius: 8px;
            justify-content: center;
            margin-left: auto;
            margin-right: auto;
            border-bottom: 2px solid #cb1f2b;
          "
        >
          <img
            style="height: 60px"
            src="https://winly-storage.s3.me-central-1.amazonaws.com/logo_winly+1.png"
            alt="Winly LLC."
          />
        </div>
        <div
          style="
            width: 80%;
            margin: 20px;
            justify-content: center;
            margin-left: auto;
            margin-right: auto;
            font-size: 18px;
          "
        >
          <div>
            <h3><b>Hello ${data.fullName}!</b></h3>
          </div>
          <br />
          <p>
            As a token of our appreciation, we're delighted to offer you a free
            ticket for the following campaign <strong>${data.campaignName}</strong>!
          </p>
          <br />
          <div
            style="
              background-color: #d83339;
              color: #fff;
              padding: 10px;
              text-align: center;
              font-size: 30px;
              font-weight: 600;
              border-radius: 5px;
              margin-top: 20px;
            "
          >
            <span>${data.ticketNumber}</span>
          </div>
          <div class="container" style="text-align: center; margin-top: 30px">
            <a
              style="
                text-decoration: none;
                color: black;
                background-color: #eeeeee;
                padding: 10px;
                border-radius: 5px;
              "
              href="https://winly.net/profile/active-tickets"
              target="_blank"
              ><span style="padding: 10px">
                <b>View Tickets</b>
              </span></a
            >
          </div>
          <div style="padding: 20px 0 20px 0; margin-top: 30px">
            <div>Regards,</div>
            <div>Winly Trading LLC.</div>
          </div>
        </div>
        <div
          style="
            padding: 20px;
            text-align: center;
            box-shadow: inherit 0 0 10px gray;
            background-color: #f8f9fa;
            box-sizing: border-box;
            width: 90%;
            margin: 20px;
            justify-content: center;
            margin-left: auto;
            margin-right: auto;
            border-bottom: 2px solid #cb1f2b;
          "
        >
          <div>JLT - JBC1, Dubai, United Arab Emirates</div>
          <div>
            <a target="_blank" href="https://winly.net/terms-of-use"
              >Terms Of Use</a
            >
            | <a target="_blank" href="https://winly.net/about-us">About Us</a> |
            <a target="_blank" href="https://winly.net/helpcenter">Contact Us</a>
          </div>
          <div>
            Copyright © 2023
            <a target="_blank" href="https://winly.net">Winly Trading LLC.</a> All
            Rights Reserved
          </div>
        </div>
        <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-ka7Sk0Gln4gmtz2MlQnikT1wXgYsOg+OMhuP+IlRH9sENBO0LRn5q+8nbTov4+1p"
          crossorigin="anonymous"
        ></script>
      </body>
    </html>
    `,
  });
}

exports.generateManualTicket = async (req, res) => {
  const { campaign, user, email, fullName, campaignName } = req.body;
  const _ticket = new Ticket({
    user: user,
    campaign: campaign,
    ticketNumber: `WL-${Math.floor(100000 + Math.random() * 900000)}-Y`,
    orderID: Math.floor(100000 + Math.random() * 900000),
  });
  _ticket.save(async (error, ticket) => {
    if (error) {
      return res.status(400).json({ msg: "Something Went Wrong!", error });
    }
    if (ticket) {
      const data = {
        email: email,
        fullName: fullName,
        campaignName: campaignName,
        ticketNumber: ticket.ticketNumber,
      };
      await sendFreeTicketEmail(data);
      return res.status(201).json({ msg: "Ticket Created Successfully" });
    }
  });
};
