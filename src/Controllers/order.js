const Order = require("../Models/order");
const Ticket = require("../Models/ticket");
const Campaign = require("../Models/campaign");
const User = require("../Models/user");
const nodemailer = require("nodemailer");

exports.placeOrder = (req, res) => {
  const { orderTotal, orderItems, orderID, address, trxID, email } = req.body;
  const _order = new Order({
    user: req.user._id,
    orderID: orderID,
    orderItems: orderItems,
    orderTotal: orderTotal,
    tickets: req.data,
    address: address,
    trxID: trxID,
  });
  _order.save(async (error, order) => {
    if (error) {
      return res.status(400).json(error);
    }
    if (order) {
      sendOrderEmail(orderID, email, orderTotal);
      User.findOneAndUpdate(
        { _id: req.user._id },
        { $set: { wallet: { available: 0 } } },
        { new: true }
      ).exec((error, user) => {
        const {
          _id,
          firstName,
          lastName,
          fullName,
          email,
          phone,
          role,
          gender,
          img,
          dob,
          country,
          dialCode,
          wallet,
        } = user;
        order.orderItems.forEach((e) => {
          var count = e.qty * e.ticketQty;
          Campaign.findOne({ _id: e.campaign_id }).exec((err, campaign) => {
            Campaign.findOneAndUpdate(
              { _id: campaign._id },
              { $set: { orderCount: campaign.orderCount + count } },
              { new: true }
            ).exec();
          });
        });
        return res.status(201).json({
          order,
          user: {
            _id,
            firstName,
            lastName,
            fullName,
            email,
            phone,
            role,
            gender,
            img,
            dob,
            country,
            dialCode,
            wallet,
          },
        });
      });
    }
  });
};

exports.getAllOrders = (req, res) => {
  Order.find()
    .populate("user", "_id firstName lastName img email dialCode phone") // Populates the 'user' field with selected properties
    .populate({
      path: "orderItems.campaign_id",
      select: "_id title productTitle", // Selects specific properties from the 'Campaign' model
    })
    .populate("tickets.ticket", "_id ticketNumber") // Populates the 'tickets.ticket' field with selected properties
    .exec((error, orders) => {
      if (error) {
        return res.status(400).json({ msg: "Something Went Wrong", error });
      }
      if (orders) {
        return res.status(200).json({ orders });
      }
    });
};

function sendOrderEmail(orderID, email, orderTotal) {
  Ticket.find({ orderID: orderID })
    .populate({
      path: "campaign",
    })
    .exec(async (error, tickets) => {
      if (tickets) {
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
          to: `${email}`,
          subject: `Order Confirmation #${orderID}`,
          html: `<!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
          <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
          
          <head>
            <!--[if gte mso 9]>
          <xml>
            <o:OfficeDocumentSettings>
              <o:AllowPNG/>
              <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
          </xml>
          <![endif]-->
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta name="x-apple-disable-message-reformatting">
            <!--[if !mso]><!-->
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <!--<![endif]-->
            <title></title>
          
            <style type="text/css">
              @media only screen and (min-width: 620px) {
                .u-row {
                  width: 600px !important;
                }
                .u-row .u-col {
                  vertical-align: top;
                }
                .u-row .u-col-50 {
                  width: 300px !important;
                }
                .u-row .u-col-100 {
                  width: 600px !important;
                }
              }
              
              @media (max-width: 620px) {
                .u-row-container {
                  max-width: 100% !important;
                  padding-left: 0px !important;
                  padding-right: 0px !important;
                }
                .u-row .u-col {
                  min-width: 320px !important;
                  max-width: 100% !important;
                  display: block !important;
                }
                .u-row {
                  width: 100% !important;
                }
                .u-col {
                  width: 100% !important;
                }
                .u-col>div {
                  margin: 0 auto;
                }
                .no-stack .u-col {
                  min-width: 0 !important;
                  display: table-cell !important;
                }
                .no-stack .u-col-50 {
                  width: 50% !important;
                }
              }
              
              body {
                margin: 0;
                padding: 0;
              }
              
              table,
              tr,
              td {
                vertical-align: top;
                border-collapse: collapse;
              }
              
              p {
                margin: 0;
              }
              
              .ie-container table,
              .mso-container table {
                table-layout: fixed;
              }
              
              * {
                line-height: inherit;
              }
              
              a[x-apple-data-detectors='true'] {
                color: inherit !important;
                text-decoration: none !important;
              }
              
              table,
              td {
                color: #000000;
              }
              
              #u_body a {
                color: #0000ee;
                text-decoration: underline;
              }
              
              @media (max-width: 480px) {
                #u_content_text_14 .v-font-size {
                  font-size: 15px !important;
                }
                #u_content_text_9 .v-font-size {
                  font-size: 15px !important;
                }
              }
            </style>
          
          
          
            <!--[if !mso]><!-->
            <link href="https://fonts.googleapis.com/css?family=Cabin:400,700" rel="stylesheet" type="text/css">
            <!--<![endif]-->
          
          </head>
          
          <body class="clean-body u_body" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #f9f9f9;color: #000000">
            <!--[if IE]><div class="ie-container"><![endif]-->
            <!--[if mso]><div class="mso-container"><![endif]-->
            <table id="u_body" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #f9f9f9;width:100%" cellpadding="0" cellspacing="0">
              <tbody>
                <tr style="vertical-align: top">
                  <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                    <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color: #f9f9f9;"><![endif]-->
          
          
          
                    <div class="u-row-container" style="padding: 0px;background-color: transparent">
                      <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #ffffff;">
                        <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
                          <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #ffffff;"><![endif]-->
          
                          <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                          <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                            <div style="height: 100%;width: 100% !important;">
                              <!--[if (!mso)&(!IE)]><!-->
                              <div style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                <!--<![endif]-->
          
                                <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                  <tbody>
                                    <tr>
                                      <td style="overflow-wrap:break-word;word-break:break-word;padding:20px;font-family:'Cabin',sans-serif;" align="left">
          
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                          <tr>
                                            <td style="padding-right: 0px;padding-left: 0px;" align="center">
          
                                              <img align="center" border="0" src="https://assets.unlayer.com/projects/185172/1695132024313-logo_winly%201.png" alt="Image" title="Image" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 32%;max-width: 179.2px;"
                                                width="179.2" />
          
                                            </td>
                                          </tr>
                                        </table>
          
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
          
                                <!--[if (!mso)&(!IE)]><!-->
                              </div>
                              <!--<![endif]-->
                            </div>
                          </div>
                          <!--[if (mso)|(IE)]></td><![endif]-->
                          <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                        </div>
                      </div>
                    </div>
          
          
          
          
          
                    <div class="u-row-container" style="padding: 0px;background-color: transparent">
                      <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #003399;">
                        <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
                          <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #003399;"><![endif]-->
          
                          <!--[if (mso)|(IE)]><td align="center" width="600" style="background-color: #ff3624;width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                          <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                            <div style="background-color: #ff3624;height: 100%;width: 100% !important;">
                              <!--[if (!mso)&(!IE)]><!-->
                              <div style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                <!--<![endif]-->
          
                                <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                  <tbody>
                                    <tr>
                                      <td style="overflow-wrap:break-word;word-break:break-word;padding:40px 10px 10px;font-family:'Cabin',sans-serif;" align="left">
          
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                          <tr>
                                            <td style="padding-right: 0px;padding-left: 0px;" align="center">
          
                                              <img align="center" border="0" src="https://cdn.templates.unlayer.com/assets/1597218650916-xxxxc.png" alt="Image" title="Image" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 26%;max-width: 150.8px;"
                                                width="150.8" />
          
                                            </td>
                                          </tr>
                                        </table>
          
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
          
                                <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                  <tbody>
                                    <tr>
                                      <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Cabin',sans-serif;" align="left">
          
                                        <div class="v-font-size" style="font-size: 14px; color: #e5eaf5; line-height: 140%; text-align: center; word-wrap: break-word;">
                                          <p style="font-size: 14px; line-height: 140%;"><strong>THANK YOU FOR YOUR ORDER!</strong></p>
                                        </div>
          
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
          
                                <!--[if (!mso)&(!IE)]><!-->
                              </div>
                              <!--<![endif]-->
                            </div>
                          </div>
                          <!--[if (mso)|(IE)]></td><![endif]-->
                          <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                        </div>
                      </div>
                    </div>
          
          
          
          
          
                    <div class="u-row-container" style="padding: 0px;background-color: transparent">
                      <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #ffffff;">
                        <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
                          <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #ffffff;"><![endif]-->
          
                          <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                          <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                            <div style="height: 100%;width: 100% !important;">
                              <!--[if (!mso)&(!IE)]><!-->
                              <div style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                <!--<![endif]-->
          
                                <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                  <tbody>
                                    <tr>
                                      <td style="overflow-wrap:break-word;word-break:break-word;padding:33px 55px;font-family:'Cabin',sans-serif;" align="left">
          
                                        <div class="v-font-size" style="font-size: 14px; line-height: 160%; text-align: center; word-wrap: break-word;">
                                          <p style="font-size: 14px; line-height: 160%;"><span style="font-size: 22px; line-height: 35.2px;">Hi, </span></p>
                                          <p style="font-size: 14px; line-height: 160%;"><span style="font-size: 18px; line-height: 28.8px;">Thank you for participating. Your tickets are attached below.</span></p>
                                        </div>
          
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
          
                                <!--[if (!mso)&(!IE)]><!-->
                              </div>
                              <!--<![endif]-->
                            </div>
                          </div>
                          <!--[if (mso)|(IE)]></td><![endif]-->
                          <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                        </div>
                      </div>
                    </div>
          
          
          
          
          
                    <div class="u-row-container" style="padding: 0px;background-color: transparent">
                      <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
                        <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
                          <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: transparent;"><![endif]-->
          
                          <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
                          <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                            <div style="height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
                              <!--[if (!mso)&(!IE)]><!-->
                              <div style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
                                <!--<![endif]-->
          
                                <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                  <tbody>
                                    <tr>
                                      <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Cabin',sans-serif;" align="left">
          
                                        <table height="0px" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 1px solid #BBBBBB;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                          <tbody>
                                            <tr style="vertical-align: top">
                                              <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                                <span>&#160;</span>
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
          
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
          
                                <!--[if (!mso)&(!IE)]><!-->
                              </div>
                              <!--<![endif]-->
                            </div>
                          </div>
                          <!--[if (mso)|(IE)]></td><![endif]-->
                          <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                        </div>
                      </div>
                    </div>
          
          
          
          
          
                    <div class="u-row-container" style="padding: 0px;background-color: transparent">
                      <div class="u-row no-stack" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
                        <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
                          <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: transparent;"><![endif]-->
          
                          <!--[if (mso)|(IE)]><td align="center" width="300" style="width: 300px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
                          <div class="u-col u-col-50" style="max-width: 320px;min-width: 300px;display: table-cell;vertical-align: top;">
                            <div style="height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
                              <!--[if (!mso)&(!IE)]><!-->
                              <div style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
                                <!--<![endif]-->
          
                                <table id="u_content_text_14" style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                  <tbody>
                                    <tr>
                                      <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Cabin',sans-serif;" align="left">
          
                                        <div class="v-font-size" style="font-size: 20px; line-height: 140%; text-align: center; word-wrap: break-word;">
                                          <p style="line-height: 140%;">Campaign</p>
                                        </div>
          
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
          
                                <!--[if (!mso)&(!IE)]><!-->
                              </div>
                              <!--<![endif]-->
                            </div>
                          </div>
                          <!--[if (mso)|(IE)]></td><![endif]-->
                          <!--[if (mso)|(IE)]><td align="center" width="300" style="width: 300px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
                          <div class="u-col u-col-50" style="max-width: 320px;min-width: 300px;display: table-cell;vertical-align: top;">
                            <div style="height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
                              <!--[if (!mso)&(!IE)]><!-->
                              <div style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
                                <!--<![endif]-->
          
                                <table id="u_content_text_9" style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                  <tbody>
                                    <tr>
                                      <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Cabin',sans-serif;" align="left">
          
                                        <div class="v-font-size" style="font-size: 20px; line-height: 140%; text-align: center; word-wrap: break-word;">
                                          <p style="line-height: 140%;">Tickets</p>
                                        </div>
          
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
          
                                <!--[if (!mso)&(!IE)]><!-->
                              </div>
                              <!--<![endif]-->
                            </div>
                          </div>
                          <!--[if (mso)|(IE)]></td><![endif]-->
                          <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                        </div>
                      </div>
                    </div>
          ${tickets?.map(
            (e) => `
          
          <div class="u-row-container" style="padding: 0px;background-color: transparent">
          <div class="u-row no-stack" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
            <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
              <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: transparent;"><![endif]-->

              <!--[if (mso)|(IE)]><td align="center" width="300" style="width: 300px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
              <div class="u-col u-col-50" style="max-width: 320px;min-width: 300px;display: table-cell;vertical-align: top;">
                <div style="height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
                  <!--[if (!mso)&(!IE)]><!-->
                  <div style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
                    <!--<![endif]-->

                    <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                      <tbody>
                        <tr>
                          <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Cabin',sans-serif;" align="left">

                            <div class="v-font-size" style="font-size: 15px; line-height: 140%; text-align: center; word-wrap: break-word;">
                              <p style="line-height: 140%;">${e.campaign.title}</p>
                            </div>

                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <!--[if (!mso)&(!IE)]><!-->
                  </div>
                  <!--<![endif]-->
                </div>
              </div>
              <!--[if (mso)|(IE)]></td><![endif]-->
              <!--[if (mso)|(IE)]><td align="center" width="300" style="width: 300px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
              <div class="u-col u-col-50" style="max-width: 320px;min-width: 300px;display: table-cell;vertical-align: top;">
                <div style="height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
                  <!--[if (!mso)&(!IE)]><!-->
                  <div style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
                    <!--<![endif]-->

                    <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                      <tbody>
                        <tr>
                          <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Cabin',sans-serif;" align="left">

                            <div class="v-font-size" style="font-size: 15px; line-height: 140%; text-align: center; word-wrap: break-word;">
                              <p style="line-height: 140%;">${e.ticketNumber}</p>
                            </div>

                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <!--[if (!mso)&(!IE)]><!-->
                  </div>
                  <!--<![endif]-->
                </div>
              </div>
              <!--[if (mso)|(IE)]></td><![endif]-->
              <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
            </div>
          </div>
        </div>`
          )}
          
          
          
          
          
                    <div class="u-row-container" style="padding: 0px;background-color: transparent">
                      <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
                        <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
                          <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: transparent;"><![endif]-->
          
                          <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
                          <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                            <div style="height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
                              <!--[if (!mso)&(!IE)]><!-->
                              <div style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
                                <!--<![endif]-->
          
                                <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                  <tbody>
                                    <tr>
                                      <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Cabin',sans-serif;" align="left">
          
                                        <table height="0px" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 1px solid #BBBBBB;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                          <tbody>
                                            <tr style="vertical-align: top">
                                              <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                                <span>&#160;</span>
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
          
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
          
                                <!--[if (!mso)&(!IE)]><!-->
                              </div>
                              <!--<![endif]-->
                            </div>
                          </div>
                          <!--[if (mso)|(IE)]></td><![endif]-->
                          <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                        </div>
                      </div>
                    </div>
          
          
          
          
          
                    <div class="u-row-container" style="padding: 0px;background-color: transparent">
                      <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
                        <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
                          <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: transparent;"><![endif]-->
          
                          <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
                          <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                            <div style="height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
                              <!--[if (!mso)&(!IE)]><!-->
                              <div style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
                                <!--<![endif]-->
          
                                <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                  <tbody>
                                    <tr>
                                      <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Cabin',sans-serif;" align="left">
          
                                        <div class="v-font-size" style="font-size: 19px; line-height: 140%; text-align: center; word-wrap: break-word;">
                                          <p style="line-height: 140%;">Order Total - AED ${orderTotal}</p>
                                        </div>
          
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
          
                                <!--[if (!mso)&(!IE)]><!-->
                              </div>
                              <!--<![endif]-->
                            </div>
                          </div>
                          <!--[if (mso)|(IE)]></td><![endif]-->
                          <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                        </div>
                      </div>
                    </div>
          
          
          
          
          
                    <div class="u-row-container" style="padding: 0px;background-color: transparent">
                      <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
                        <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
                          <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: transparent;"><![endif]-->
          
                          <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
                          <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                            <div style="height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
                              <!--[if (!mso)&(!IE)]><!-->
                              <div style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
                                <!--<![endif]-->
          
                                <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                  <tbody>
                                    <tr>
                                      <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Cabin',sans-serif;" align="left">
          
                                        <table height="0px" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 1px solid #BBBBBB;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                          <tbody>
                                            <tr style="vertical-align: top">
                                              <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                                <span>&#160;</span>
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
          
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
          
                                <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                  <tbody>
                                    <tr>
                                      <td style="overflow-wrap:break-word;word-break:break-word;padding:33px 55px 60px;font-family:'Cabin',sans-serif;" align="left">
          
                                        <div class="v-font-size" style="font-size: 14px; line-height: 160%; text-align: center; word-wrap: break-word;">
                                          <p style="line-height: 160%; font-size: 14px;"><span style="font-size: 18px; line-height: 28.8px;">Thanks,</span></p>
                                          <p style="line-height: 160%; font-size: 14px;"><span style="font-size: 18px; line-height: 28.8px;">Winly Trading LLC.</span></p>
                                        </div>
          
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
          
                                <!--[if (!mso)&(!IE)]><!-->
                              </div>
                              <!--<![endif]-->
                            </div>
                          </div>
                          <!--[if (mso)|(IE)]></td><![endif]-->
                          <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                        </div>
                      </div>
                    </div>
          
          
          
          
          
                    <div class="u-row-container" style="padding: 0px;background-color: transparent">
                      <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #e5eaf5;">
                        <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
                          <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #e5eaf5;"><![endif]-->
          
                          <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                          <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                            <div style="height: 100%;width: 100% !important;">
                              <!--[if (!mso)&(!IE)]><!-->
                              <div style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                <!--<![endif]-->
          
                                <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                  <tbody>
                                    <tr>
                                      <td style="overflow-wrap:break-word;word-break:break-word;padding:41px 55px 18px;font-family:'Cabin',sans-serif;" align="left">
          
                                        <div class="v-font-size" style="font-size: 14px; color: #000000; line-height: 160%; text-align: center; word-wrap: break-word;">
                                          <p style="font-size: 14px; line-height: 160%;"><span style="font-size: 20px; line-height: 32px;"><strong>Get in touch</strong></span></p>
                                          <p style="font-size: 14px; line-height: 160%;"><span style="font-size: 16px; line-height: 25.6px; color: #000000;">+971 44 562 309</span></p>
                                          <p style="font-size: 14px; line-height: 160%;"><span style="font-size: 16px; line-height: 25.6px; color: #000000;">info@winly.ae</span></p>
                                        </div>
          
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
          
                                <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                  <tbody>
                                    <tr>
                                      <td style="overflow-wrap:break-word;word-break:break-word;padding:10px 10px 33px;font-family:'Cabin',sans-serif;" align="left">
          
                                        <div align="center">
                                          <div style="display: table; max-width:97px;">
                                            <!--[if (mso)|(IE)]><table width="97" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-collapse:collapse;" align="center"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; mso-table-lspace: 0pt;mso-table-rspace: 0pt; width:97px;"><tr><![endif]-->
          
          
                                            <!--[if (mso)|(IE)]><td width="32" style="width:32px; padding-right: 17px;" valign="top"><![endif]-->
                                            <table align="left" border="0" cellspacing="0" cellpadding="0" width="32" height="32" style="width: 32px !important;height: 32px !important;display: inline-block;border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 17px">
                                              <tbody>
                                                <tr style="vertical-align: top">
                                                  <td align="left" valign="middle" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                                                    <a href="https://www.facebook.com/Winly.net" title="Facebook" target="_blank">
                                                      <img src="https://cdn.tools.unlayer.com/social/icons/circle-black/facebook.png" alt="Facebook" title="Facebook" width="32" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important">
                                                    </a>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                            <!--[if (mso)|(IE)]></td><![endif]-->
          
                                            <!--[if (mso)|(IE)]><td width="32" style="width:32px; padding-right: 0px;" valign="top"><![endif]-->
                                            <table align="left" border="0" cellspacing="0" cellpadding="0" width="32" height="32" style="width: 32px !important;height: 32px !important;display: inline-block;border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 0px">
                                              <tbody>
                                                <tr style="vertical-align: top">
                                                  <td align="left" valign="middle" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                                                    <a href="https://www.instagram.com/winly.ae" title="Instagram" target="_blank">
                                                      <img src="https://cdn.tools.unlayer.com/social/icons/circle-black/instagram.png" alt="Instagram" title="Instagram" width="32" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important">
                                                    </a>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                            <!--[if (mso)|(IE)]></td><![endif]-->
          
          
                                            <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                                          </div>
                                        </div>
          
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
          
                                <!--[if (!mso)&(!IE)]><!-->
                              </div>
                              <!--<![endif]-->
                            </div>
                          </div>
                          <!--[if (mso)|(IE)]></td><![endif]-->
                          <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                        </div>
                      </div>
                    </div>
          
          
          
          
          
                    <div class="u-row-container" style="padding: 0px;background-color: transparent">
                      <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #003399;">
                        <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
                          <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #003399;"><![endif]-->
          
                          <!--[if (mso)|(IE)]><td align="center" width="600" style="background-color: #ff3624;width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                          <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                            <div style="background-color: #ff3624;height: 100%;width: 100% !important;">
                              <!--[if (!mso)&(!IE)]><!-->
                              <div style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                <!--<![endif]-->
          
                                <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                  <tbody>
                                    <tr>
                                      <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Cabin',sans-serif;" align="left">
          
                                        <div class="v-font-size" style="font-size: 14px; color: #fafafa; line-height: 180%; text-align: center; word-wrap: break-word;">
                                          <p style="font-size: 14px; line-height: 180%;"><span style="font-size: 16px; line-height: 28.8px;">Copyrights © Winly Trading LLC. All Rights Reserved</span></p>
                                        </div>
          
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
          
                                <!--[if (!mso)&(!IE)]><!-->
                              </div>
                              <!--<![endif]-->
                            </div>
                          </div>
                          <!--[if (mso)|(IE)]></td><![endif]-->
                          <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                        </div>
                      </div>
                    </div>
          
          
          
                    <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
                  </td>
                </tr>
              </tbody>
            </table>
            <!--[if mso]></div><![endif]-->
            <!--[if IE]></div><![endif]-->
          </body>
          
          </html>`,
        });
      }
    });
}
