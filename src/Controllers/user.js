const User = require("../Models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

const generateJwtToken = (_id, role) => {
  return jwt.sign({ _id, role }, process.env.JWT_SECRET, {
    expiresIn: "1y",
  });
};

exports.signup = (req, res) => {
  User.findOne({ email: req.body.email }).exec(async (error, user) => {
    if (error) {
      return res.status(400).json({ msg: "Bad Request!", error });
    }
    if (user) {
      return res.status(409).json({
        msg: "Email Already In Use. Please Use Another Email To Continue.",
      });
    } else {
      const {
        firstName,
        lastName,
        email,
        phone,
        password,
        gender,
        dob,
        country,
        dialCode,
        nationality,
      } = req.body;
      const hash_password = await bcrypt.hash(password, 10);
      const _user = new User({
        firstName,
        lastName,
        email,
        phone,
        hash_password,
        gender,
        dob,
        country,
        dialCode,
        nationality,
        stripe_id: req.customer.id,
      });
      _user.save((err, user) => {
        if (err) {
          return res.status(400).json({ msg: "Something Went Wrong!", err });
        }
        if (user) {
          return res.status(201).json({
            msg: "Registration Successful. Please Verify Your Email.",
            user,
          });
        }
      });
    }
  });
};

exports.signin = (req, res) => {
  User.findOne({ email: req.body.email }).exec(async (error, user) => {
    if (error)
      return res.status(400).json({ msg: "Something Went Wrong!", error });
    if (user) {
      const isPassword = await user.authenticate(req.body.password);
      if (
        isPassword &&
        user.role === "user" &&
        user.verification.isVerified === true
      ) {
        const token = generateJwtToken(user._id, user.role);
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
          nationality,
          stripe_id,
          notification,
        } = user;
        return res.status(200).json({
          msg: "Login Success",
          token,
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
            nationality,
            stripe_id,
            notification,
          },
        });
      }
      if (
        isPassword &&
        user.role === "user" &&
        user.verification.isVerified === false
      ) {
        return res.status(403).json({
          msg: "Please Verify Your Email To Continue!",
        });
      } else {
        return res.status(401).json({
          msg: "Invalid Credentials!",
        });
      }
    } else {
      return res.status(404).json({
        msg: "User Not Found",
      });
    }
  });
};

exports.adminSignup = (req, res) => {
  User.findOne({ email: req.body.email }).exec(async (error, user) => {
    if (error) {
      return res.status(400).json({ msg: "Bad Request!", error });
    }
    if (user) {
      return res.status(409).json({
        msg: "Email Already In Use. Please Use Another Email To Continue.",
      });
    } else {
      const {
        firstName,
        lastName,
        email,
        phone,
        password,
        gender,
        dob,
        country,
        nationality,
      } = req.body;
      const picture = req.file;
      const hash_password = await bcrypt.hash(password, 10);
      const _user = new User({
        firstName,
        lastName,
        email,
        phone,
        picture,
        hash_password,
        gender,
        dob,
        country,
        role: "admin",
        nationality,
      });
      _user.save((err, user) => {
        if (err) {
          return res.status(400).json({ msg: "Something Went Wrong!", err });
        }
        if (user) {
          return res.status(201).json({
            msg: "Registration Successful. Please Verify Your Email.",
            user,
          });
        }
      });
    }
  });
};

exports.adminSignin = (req, res) => {
  User.findOne({ email: req.body.email }).exec(async (error, user) => {
    if (error)
      return res.status(400).json({ msg: "Something Went Wrong!", error });
    if (user) {
      const isPassword = await user.authenticate(req.body.password);
      if (
        isPassword &&
        user.role === "admin" &&
        user.verification.isVerified === true
      ) {
        const token = generateJwtToken(user._id, user.role);
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
          nationality,
          notification,
        } = user;
        return res.status(200).json({
          msg: "Login Success",
          token,
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
            nationality,
            notification,
          },
        });
      }
      if (
        isPassword &&
        user.role === "admin" &&
        user.verification.isVerified === false
      ) {
        return res.status(403).json({
          msg: "Please Verify Your Email To Continue!",
        });
      } else {
        return res.status(401).json({
          msg: "Invalid Credentials!",
        });
      }
    } else {
      return res.status(404).json({
        msg: "Admin Not Found",
      });
    }
  });
};

exports.sendVerificationCode = (req, res) => {
  User.findOneAndUpdate(
    { email: req.body.email },
    {
      $set: {
        "verification.code": Math.floor(100000 + Math.random() * 900000),
      },
    },
    { new: true }
  ).exec(async (error, data) => {
    if (error) {
      return res.status(400).json({ msg: "Something Went Wrong" });
    }
    if (data) {
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
        to: `${req.body.email}`,
        subject: "Verification Code From Winly",
        html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html
          xmlns="http://www.w3.org/1999/xhtml"
          xmlns:v="urn:schemas-microsoft-com:vml"
          xmlns:o="urn:schemas-microsoft-com:office:office"
        >
          <head>
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta name="x-apple-disable-message-reformatting" />
        
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        
            <title></title>
        
            <style type="text/css">
              @media only screen and (min-width: 620px) {
                .u-row {
                  width: 600px !important;
                }
                .u-row .u-col {
                  vertical-align: top;
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
                .u-col > div {
                  margin: 0 auto;
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
        
              a[x-apple-data-detectors="true"] {
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
            </style>
        
            <!--[if !mso]><!-->
            <link
              href="https://fonts.googleapis.com/css?family=Cabin:400,700"
              rel="stylesheet"
              type="text/css"
            />
            <!--<![endif]-->
          </head>
        
          <body
            class="clean-body u_body"
            style="
              margin: 0;
              padding: 0;
              -webkit-text-size-adjust: 100%;
              background-color: #f9f9f9;
              color: #000000;
            "
          >
            <!--[if IE]><div class="ie-container"><![endif]-->
            <!--[if mso]><div class="mso-container"><![endif]-->
            <table
              id="u_body"
              style="
                border-collapse: collapse;
                table-layout: fixed;
                border-spacing: 0;
                mso-table-lspace: 0pt;
                mso-table-rspace: 0pt;
                vertical-align: top;
                min-width: 320px;
                margin: 0 auto;
                background-color: #f9f9f9;
                width: 100%;
              "
              cellpadding="0"
              cellspacing="0"
            >
              <tbody>
                <tr style="vertical-align: top">
                  <td
                    style="
                      word-break: break-word;
                      border-collapse: collapse !important;
                      vertical-align: top;
                    "
                  >
                    <div
                      class="u-row-container"
                      style="padding: 0px; background-color: transparent"
                    >
                      <div
                        class="u-row"
                        style="
                          margin: 0 auto;
                          min-width: 320px;
                          max-width: 600px;
                          overflow-wrap: break-word;
                          word-wrap: break-word;
                          word-break: break-word;
                          background-color: #ffffff;
                        "
                      >
                        <div
                          style="
                            border-collapse: collapse;
                            display: table;
                            width: 100%;
                            height: 100%;
                            background-color: transparent;
                          "
                        >
                          <div
                            class="u-col u-col-100"
                            style="
                              max-width: 320px;
                              min-width: 600px;
                              display: table-cell;
                              vertical-align: top;
                            "
                          >
                            <div style="height: 100%; width: 100% !important">
                              <div
                                style="
                                  box-sizing: border-box;
                                  height: 100%;
                                  padding: 0px;
                                  border-top: 0px solid transparent;
                                  border-left: 0px solid transparent;
                                  border-right: 0px solid transparent;
                                  border-bottom: 0px solid transparent;
                                "
                              >
                                <table
                                  style="font-family: 'Cabin', sans-serif"
                                  role="presentation"
                                  cellpadding="0"
                                  cellspacing="0"
                                  width="100%"
                                  border="0"
                                >
                                  <tbody>
                                    <tr>
                                      <td
                                        style="
                                          overflow-wrap: break-word;
                                          word-break: break-word;
                                          padding: 20px;
                                          font-family: 'Cabin', sans-serif;
                                        "
                                        align="left"
                                      >
                                        <table
                                          width="100%"
                                          cellpadding="0"
                                          cellspacing="0"
                                          border="0"
                                        >
                                          <tr>
                                            <td
                                              style="
                                                padding-right: 0px;
                                                padding-left: 0px;
                                              "
                                              align="center"
                                            >
                                              <img
                                                align="center"
                                                border="0"
                                                src="https://assets.unlayer.com/projects/185172/1695132024313-logo_winly%201.png"
                                                alt="Image"
                                                title="Image"
                                                style="
                                                  outline: none;
                                                  text-decoration: none;
                                                  -ms-interpolation-mode: bicubic;
                                                  clear: both;
                                                  display: inline-block !important;
                                                  border: none;
                                                  height: auto;
                                                  float: none;
                                                  width: 32%;
                                                  max-width: 179.2px;
                                                "
                                                width="179.2"
                                              />
                                            </td>
                                          </tr>
                                        </table>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
        
                    <div
                      class="u-row-container"
                      style="padding: 0px; background-color: transparent"
                    >
                      <div
                        class="u-row"
                        style="
                          margin: 0 auto;
                          min-width: 320px;
                          max-width: 600px;
                          overflow-wrap: break-word;
                          word-wrap: break-word;
                          word-break: break-word;
                          background-color: #003399;
                        "
                      >
                        <div
                          style="
                            border-collapse: collapse;
                            display: table;
                            width: 100%;
                            height: 100%;
                            background-color: transparent;
                          "
                        >
                          <div
                            class="u-col u-col-100"
                            style="
                              max-width: 320px;
                              min-width: 600px;
                              display: table-cell;
                              vertical-align: top;
                            "
                          >
                            <div
                              style="
                                background-color: #ff3624;
                                height: 100%;
                                width: 100% !important;
                              "
                            >
                              <div
                                style="
                                  box-sizing: border-box;
                                  height: 100%;
                                  padding: 0px;
                                  border-top: 0px solid transparent;
                                  border-left: 0px solid transparent;
                                  border-right: 0px solid transparent;
                                  border-bottom: 0px solid transparent;
                                "
                              >
                                <!--<![endif]-->
        
                                <table
                                  style="font-family: 'Cabin', sans-serif"
                                  role="presentation"
                                  cellpadding="0"
                                  cellspacing="0"
                                  width="100%"
                                  border="0"
                                >
                                  <tbody>
                                    <tr>
                                      <td
                                        style="
                                          overflow-wrap: break-word;
                                          word-break: break-word;
                                          padding: 40px 10px 10px;
                                          font-family: 'Cabin', sans-serif;
                                        "
                                        align="left"
                                      >
                                        <table
                                          width="100%"
                                          cellpadding="0"
                                          cellspacing="0"
                                          border="0"
                                        >
                                          <tr>
                                            <td
                                              style="
                                                padding-right: 0px;
                                                padding-left: 0px;
                                              "
                                              align="center"
                                            >
                                              <img
                                                align="center"
                                                border="0"
                                                src="https://cdn.templates.unlayer.com/assets/1597218650916-xxxxc.png"
                                                alt="Image"
                                                title="Image"
                                                style="
                                                  outline: none;
                                                  text-decoration: none;
                                                  -ms-interpolation-mode: bicubic;
                                                  clear: both;
                                                  display: inline-block !important;
                                                  border: none;
                                                  height: auto;
                                                  float: none;
                                                  width: 26%;
                                                  max-width: 150.8px;
                                                "
                                                width="150.8"
                                              />
                                            </td>
                                          </tr>
                                        </table>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
        
                                <table
                                  style="font-family: 'Cabin', sans-serif"
                                  role="presentation"
                                  cellpadding="0"
                                  cellspacing="0"
                                  width="100%"
                                  border="0"
                                >
                                  <tbody>
                                    <tr>
                                      <td
                                        style="
                                          overflow-wrap: break-word;
                                          word-break: break-word;
                                          padding: 10px;
                                          font-family: 'Cabin', sans-serif;
                                        "
                                        align="left"
                                      >
                                        <div
                                          style="
                                            font-size: 14px;
                                            color: #e5eaf5;
                                            line-height: 140%;
                                            text-align: center;
                                            word-wrap: break-word;
                                          "
                                        >
                                          <p style="font-size: 14px; line-height: 140%">
                                            <strong
                                              >T H A N K S&nbsp; &nbsp;F O R&nbsp;
                                              &nbsp;S I G N I N G&nbsp; &nbsp;U P
                                              !</strong
                                            >
                                          </p>
                                        </div>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
        
                                <table
                                  style="font-family: 'Cabin', sans-serif"
                                  role="presentation"
                                  cellpadding="0"
                                  cellspacing="0"
                                  width="100%"
                                  border="0"
                                >
                                  <tbody>
                                    <tr>
                                      <td
                                        style="
                                          overflow-wrap: break-word;
                                          word-break: break-word;
                                          padding: 0px 10px 31px;
                                          font-family: 'Cabin', sans-serif;
                                        "
                                        align="left"
                                      >
                                        <div
                                          style="
                                            font-size: 14px;
                                            color: #e5eaf5;
                                            line-height: 140%;
                                            text-align: center;
                                            word-wrap: break-word;
                                          "
                                        >
                                          <p style="font-size: 14px; line-height: 140%">
                                            <span
                                              style="
                                                font-size: 28px;
                                                line-height: 39.2px;
                                              "
                                              ><strong
                                                ><span
                                                  style="
                                                    line-height: 39.2px;
                                                    font-size: 28px;
                                                  "
                                                  >Verify Your E-mail Address
                                                </span></strong
                                              >
                                            </span>
                                          </p>
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
        
                    <div
                      class="u-row-container"
                      style="padding: 0px; background-color: transparent"
                    >
                      <div
                        class="u-row"
                        style="
                          margin: 0 auto;
                          min-width: 320px;
                          max-width: 600px;
                          overflow-wrap: break-word;
                          word-wrap: break-word;
                          word-break: break-word;
                          background-color: #ffffff;
                        "
                      >
                        <div
                          style="
                            border-collapse: collapse;
                            display: table;
                            width: 100%;
                            height: 100%;
                            background-color: transparent;
                          "
                        >
                          <div
                            class="u-col u-col-100"
                            style="
                              max-width: 320px;
                              min-width: 600px;
                              display: table-cell;
                              vertical-align: top;
                            "
                          >
                            <div style="height: 100%; width: 100% !important">
                              <!--[if (!mso)&(!IE)]><!-->
                              <div
                                style="
                                  box-sizing: border-box;
                                  height: 100%;
                                  padding: 0px;
                                  border-top: 0px solid transparent;
                                  border-left: 0px solid transparent;
                                  border-right: 0px solid transparent;
                                  border-bottom: 0px solid transparent;
                                "
                              >
                                <!--<![endif]-->
        
                                <table
                                  style="font-family: 'Cabin', sans-serif"
                                  role="presentation"
                                  cellpadding="0"
                                  cellspacing="0"
                                  width="100%"
                                  border="0"
                                >
                                  <tbody>
                                    <tr>
                                      <td
                                        style="
                                          overflow-wrap: break-word;
                                          word-break: break-word;
                                          padding: 33px 55px;
                                          font-family: 'Cabin', sans-serif;
                                        "
                                        align="left"
                                      >
                                        <div
                                          style="
                                            font-size: 14px;
                                            line-height: 160%;
                                            text-align: center;
                                            word-wrap: break-word;
                                          "
                                        >
                                          <p style="font-size: 14px; line-height: 160%">
                                            <span
                                              style="
                                                font-size: 22px;
                                                line-height: 35.2px;
                                              "
                                              >Hi,
                                            </span>
                                          </p>
                                          <p style="font-size: 14px; line-height: 160%">
                                            <span
                                              style="
                                                font-size: 18px;
                                                line-height: 28.8px;
                                              "
                                              >You're almost ready to get started.
                                              Please enter the verification code to
                                              verify your email and enjoy exclusive
                                              Campaigns &amp; Draws with us!</span
                                            >
                                          </p>
                                        </div>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
        
                                <table
                                  style="font-family: 'Cabin', sans-serif"
                                  role="presentation"
                                  cellpadding="0"
                                  cellspacing="0"
                                  width="100%"
                                  border="0"
                                >
                                  <tbody>
                                    <tr>
                                      <td
                                        style="
                                          overflow-wrap: break-word;
                                          word-break: break-word;
                                          padding: 10px;
                                          font-family: 'Cabin', sans-serif;
                                        "
                                        align="left"
                                      >
                                        <div align="center">
                                          <div
                                            href=""
                                            target="_blank"
                                            class="v-button"
                                            style="
                                              box-sizing: border-box;
                                              display: inline-block;
                                              text-decoration: none;
                                              -webkit-text-size-adjust: none;
                                              text-align: center;
                                              color: #ffffff;
                                              background-color: #000000;
                                              border-radius: 4px;
                                              -webkit-border-radius: 4px;
                                              -moz-border-radius: 4px;
                                              width: auto;
                                              max-width: 100%;
                                              overflow-wrap: break-word;
                                              word-break: break-word;
                                              word-wrap: break-word;
                                              mso-border-alt: none;
                                              font-size: 22px;
                                            "
                                          >
                                            <span
                                              style="
                                                display: block;
                                                padding: 14px 44px 13px;
                                                line-height: 120%;
                                              "
                                              >${data.verification.code}</span
                                            >
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
        
                                <table
                                  style="font-family: 'Cabin', sans-serif"
                                  role="presentation"
                                  cellpadding="0"
                                  cellspacing="0"
                                  width="100%"
                                  border="0"
                                >
                                  <tbody>
                                    <tr>
                                      <td
                                        style="
                                          overflow-wrap: break-word;
                                          word-break: break-word;
                                          padding: 33px 55px 60px;
                                          font-family: 'Cabin', sans-serif;
                                        "
                                        align="left"
                                      >
                                        <div
                                          style="
                                            font-size: 14px;
                                            line-height: 160%;
                                            text-align: center;
                                            word-wrap: break-word;
                                          "
                                        >
                                          <p style="line-height: 160%; font-size: 14px">
                                            <span
                                              style="
                                                font-size: 18px;
                                                line-height: 28.8px;
                                              "
                                              >Thanks,</span
                                            >
                                          </p>
                                          <p style="line-height: 160%; font-size: 14px">
                                            <span
                                              style="
                                                font-size: 18px;
                                                line-height: 28.8px;
                                              "
                                              >Winly Trading LLC.</span
                                            >
                                          </p>
                                        </div>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
        
                    <div
                      class="u-row-container"
                      style="padding: 0px; background-color: transparent"
                    >
                      <div
                        class="u-row"
                        style="
                          margin: 0 auto;
                          min-width: 320px;
                          max-width: 600px;
                          overflow-wrap: break-word;
                          word-wrap: break-word;
                          word-break: break-word;
                          background-color: #e5eaf5;
                        "
                      >
                        <div
                          style="
                            border-collapse: collapse;
                            display: table;
                            width: 100%;
                            height: 100%;
                            background-color: transparent;
                          "
                        >
                          <div
                            class="u-col u-col-100"
                            style="
                              max-width: 320px;
                              min-width: 600px;
                              display: table-cell;
                              vertical-align: top;
                            "
                          >
                            <div style="height: 100%; width: 100% !important">
                              <div
                                style="
                                  box-sizing: border-box;
                                  height: 100%;
                                  padding: 0px;
                                  border-top: 0px solid transparent;
                                  border-left: 0px solid transparent;
                                  border-right: 0px solid transparent;
                                  border-bottom: 0px solid transparent;
                                "
                              >
                                <table
                                  style="font-family: 'Cabin', sans-serif"
                                  role="presentation"
                                  cellpadding="0"
                                  cellspacing="0"
                                  width="100%"
                                  border="0"
                                >
                                  <tbody>
                                    <tr>
                                      <td
                                        style="
                                          overflow-wrap: break-word;
                                          word-break: break-word;
                                          padding: 41px 55px 18px;
                                          font-family: 'Cabin', sans-serif;
                                        "
                                        align="left"
                                      >
                                        <div
                                          style="
                                            font-size: 14px;
                                            color: #000000;
                                            line-height: 160%;
                                            text-align: center;
                                            word-wrap: break-word;
                                          "
                                        >
                                          <p style="font-size: 14px; line-height: 160%">
                                            <span
                                              style="font-size: 20px; line-height: 32px"
                                              ><strong>Get in touch</strong></span
                                            >
                                          </p>
                                          <p style="font-size: 14px; line-height: 160%">
                                            <span
                                              style="
                                                font-size: 16px;
                                                line-height: 25.6px;
                                                color: #000000;
                                              "
                                              >+971 44 562 309</span
                                            >
                                          </p>
                                          <p style="font-size: 14px; line-height: 160%">
                                            <span
                                              style="
                                                font-size: 16px;
                                                line-height: 25.6px;
                                                color: #000000;
                                              "
                                              >info@winly.ae</span
                                            >
                                          </p>
                                        </div>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
        
                                <table
                                  style="font-family: 'Cabin', sans-serif"
                                  role="presentation"
                                  cellpadding="0"
                                  cellspacing="0"
                                  width="100%"
                                  border="0"
                                >
                                  <tbody>
                                    <tr>
                                      <td
                                        style="
                                          overflow-wrap: break-word;
                                          word-break: break-word;
                                          padding: 10px 10px 33px;
                                          font-family: 'Cabin', sans-serif;
                                        "
                                        align="left"
                                      >
                                        <div align="center">
                                          <div style="display: table; max-width: 97px">
                                            <table
                                              align="left"
                                              border="0"
                                              cellspacing="0"
                                              cellpadding="0"
                                              width="32"
                                              height="32"
                                              style="
                                                width: 32px !important;
                                                height: 32px !important;
                                                display: inline-block;
                                                border-collapse: collapse;
                                                table-layout: fixed;
                                                border-spacing: 0;
                                                mso-table-lspace: 0pt;
                                                mso-table-rspace: 0pt;
                                                vertical-align: top;
                                                margin-right: 17px;
                                              "
                                            >
                                              <tbody>
                                                <tr style="vertical-align: top">
                                                  <td
                                                    align="left"
                                                    valign="middle"
                                                    style="
                                                      word-break: break-word;
                                                      border-collapse: collapse !important;
                                                      vertical-align: top;
                                                    "
                                                  >
                                                    <a
                                                      href="https://www.facebook.com/Winly.net"
                                                      title="Facebook"
                                                      target="_blank"
                                                    >
                                                      <img
                                                        src="https://cdn.tools.unlayer.com/social/icons/circle-black/facebook.png"
                                                        alt="Facebook"
                                                        title="Facebook"
                                                        width="32"
                                                        style="
                                                          outline: none;
                                                          text-decoration: none;
                                                          -ms-interpolation-mode: bicubic;
                                                          clear: both;
                                                          display: block !important;
                                                          border: none;
                                                          height: auto;
                                                          float: none;
                                                          max-width: 32px !important;
                                                        "
                                                      />
                                                    </a>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
        
                                            <table
                                              align="left"
                                              border="0"
                                              cellspacing="0"
                                              cellpadding="0"
                                              width="32"
                                              height="32"
                                              style="
                                                width: 32px !important;
                                                height: 32px !important;
                                                display: inline-block;
                                                border-collapse: collapse;
                                                table-layout: fixed;
                                                border-spacing: 0;
                                                mso-table-lspace: 0pt;
                                                mso-table-rspace: 0pt;
                                                vertical-align: top;
                                                margin-right: 0px;
                                              "
                                            >
                                              <tbody>
                                                <tr style="vertical-align: top">
                                                  <td
                                                    align="left"
                                                    valign="middle"
                                                    style="
                                                      word-break: break-word;
                                                      border-collapse: collapse !important;
                                                      vertical-align: top;
                                                    "
                                                  >
                                                    <a
                                                      href="https://www.instagram.com/winly.ae"
                                                      title="Instagram"
                                                      target="_blank"
                                                    >
                                                      <img
                                                        src="https://cdn.tools.unlayer.com/social/icons/circle-black/instagram.png"
                                                        alt="Instagram"
                                                        title="Instagram"
                                                        width="32"
                                                        style="
                                                          outline: none;
                                                          text-decoration: none;
                                                          -ms-interpolation-mode: bicubic;
                                                          clear: both;
                                                          display: block !important;
                                                          border: none;
                                                          height: auto;
                                                          float: none;
                                                          max-width: 32px !important;
                                                        "
                                                      />
                                                    </a>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
        
                    <div
                      class="u-row-container"
                      style="padding: 0px; background-color: transparent"
                    >
                      <div
                        class="u-row"
                        style="
                          margin: 0 auto;
                          min-width: 320px;
                          max-width: 600px;
                          overflow-wrap: break-word;
                          word-wrap: break-word;
                          word-break: break-word;
                          background-color: #003399;
                        "
                      >
                        <div
                          style="
                            border-collapse: collapse;
                            display: table;
                            width: 100%;
                            height: 100%;
                            background-color: transparent;
                          "
                        >
                          <div
                            class="u-col u-col-100"
                            style="
                              max-width: 320px;
                              min-width: 600px;
                              display: table-cell;
                              vertical-align: top;
                            "
                          >
                            <div
                              style="
                                background-color: #ff3624;
                                height: 100%;
                                width: 100% !important;
                              "
                            >
                              <div
                                style="
                                  box-sizing: border-box;
                                  height: 100%;
                                  padding: 0px;
                                  border-top: 0px solid transparent;
                                  border-left: 0px solid transparent;
                                  border-right: 0px solid transparent;
                                  border-bottom: 0px solid transparent;
                                "
                              >
                                <table
                                  style="font-family: 'Cabin', sans-serif"
                                  role="presentation"
                                  cellpadding="0"
                                  cellspacing="0"
                                  width="100%"
                                  border="0"
                                >
                                  <tbody>
                                    <tr>
                                      <td
                                        style="
                                          overflow-wrap: break-word;
                                          word-break: break-word;
                                          padding: 10px;
                                          font-family: 'Cabin', sans-serif;
                                        "
                                        align="left"
                                      >
                                        <div
                                          style="
                                            font-size: 14px;
                                            color: #fafafa;
                                            line-height: 180%;
                                            text-align: center;
                                            word-wrap: break-word;
                                          "
                                        >
                                          <p style="font-size: 14px; line-height: 180%">
                                            <span
                                              style="
                                                font-size: 16px;
                                                line-height: 28.8px;
                                              "
                                              >Copyrights © Winly Trading LLC. All
                                              Rights Reserved</span
                                            >
                                          </p>
                                        </div>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </body>
        </html>
        `,
      });

      if (info.messageId !== null) {
        return res.status(202).json({ msg: "Verification Code Sent!" });
      } else {
        return res.status(401).json({ msg: info.response });
      }
    }
  });
};

async function newUserEmail(data) {
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
    subject: "Welcome To Winly LLC.",
    html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html
      xmlns="http://www.w3.org/1999/xhtml"
      xmlns:v="urn:schemas-microsoft-com:vml"
      xmlns:o="urn:schemas-microsoft-com:office:office"
    >
      <head>
        <!--[if gte mso 9]>
          <xml>
            <o:OfficeDocumentSettings>
              <o:AllowPNG />
              <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
          </xml>
        <![endif]-->
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="x-apple-disable-message-reformatting" />
        <!--[if !mso]><!-->
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
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
            .u-col > div {
              margin: 0 auto;
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
    
          a[x-apple-data-detectors="true"] {
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
        </style>
    
        <!--[if !mso]><!-->
        <link
          href="https://fonts.googleapis.com/css?family=Cabin:400,700"
          rel="stylesheet"
          type="text/css"
        />
        <!--<![endif]-->
      </head>
    
      <body
        class="clean-body u_body"
        style="
          margin: 0;
          padding: 0;
          -webkit-text-size-adjust: 100%;
          background-color: #f9f9f9;
          color: #000000;
        "
      >
        <!--[if IE]><div class="ie-container"><![endif]-->
        <!--[if mso]><div class="mso-container"><![endif]-->
        <table
          id="u_body"
          style="
            border-collapse: collapse;
            table-layout: fixed;
            border-spacing: 0;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
            vertical-align: top;
            min-width: 320px;
            margin: 0 auto;
            background-color: #f9f9f9;
            width: 100%;
          "
          cellpadding="0"
          cellspacing="0"
        >
          <tbody>
            <tr style="vertical-align: top">
              <td
                style="
                  word-break: break-word;
                  border-collapse: collapse !important;
                  vertical-align: top;
                "
              >
                <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color: #f9f9f9;"><![endif]-->
    
                <div
                  class="u-row-container"
                  style="padding: 0px; background-color: transparent"
                >
                  <div
                    class="u-row"
                    style="
                      margin: 0 auto;
                      min-width: 320px;
                      max-width: 600px;
                      overflow-wrap: break-word;
                      word-wrap: break-word;
                      word-break: break-word;
                      background-color: #ffffff;
                    "
                  >
                    <div
                      style="
                        border-collapse: collapse;
                        display: table;
                        width: 100%;
                        height: 100%;
                        background-color: transparent;
                      "
                    >
                      <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #ffffff;"><![endif]-->
    
                      <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                      <div
                        class="u-col u-col-100"
                        style="
                          max-width: 320px;
                          min-width: 600px;
                          display: table-cell;
                          vertical-align: top;
                        "
                      >
                        <div style="height: 100%; width: 100% !important">
                          <!--[if (!mso)&(!IE)]><!-->
                          <div
                            style="
                              box-sizing: border-box;
                              height: 100%;
                              padding: 0px;
                              border-top: 0px solid transparent;
                              border-left: 0px solid transparent;
                              border-right: 0px solid transparent;
                              border-bottom: 0px solid transparent;
                            "
                          >
                            <!--<![endif]-->
    
                            <table
                              style="font-family: 'Cabin', sans-serif"
                              role="presentation"
                              cellpadding="0"
                              cellspacing="0"
                              width="100%"
                              border="0"
                            >
                              <tbody>
                                <tr>
                                  <td
                                    style="
                                      overflow-wrap: break-word;
                                      word-break: break-word;
                                      padding: 20px;
                                      font-family: 'Cabin', sans-serif;
                                    "
                                    align="left"
                                  >
                                    <table
                                      width="100%"
                                      cellpadding="0"
                                      cellspacing="0"
                                      border="0"
                                    >
                                      <tr>
                                        <td
                                          style="
                                            padding-right: 0px;
                                            padding-left: 0px;
                                          "
                                          align="center"
                                        >
                                          <img
                                            align="center"
                                            border="0"
                                            src="https://assets.unlayer.com/projects/185172/1695132024313-logo_winly%201.png"
                                            alt="Image"
                                            title="Image"
                                            style="
                                              outline: none;
                                              text-decoration: none;
                                              -ms-interpolation-mode: bicubic;
                                              clear: both;
                                              display: inline-block !important;
                                              border: none;
                                              height: auto;
                                              float: none;
                                              width: 32%;
                                              max-width: 179.2px;
                                            "
                                            width="179.2"
                                          />
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
    
                <div
                  class="u-row-container"
                  style="padding: 0px; background-color: transparent"
                >
                  <div
                    class="u-row"
                    style="
                      margin: 0 auto;
                      min-width: 320px;
                      max-width: 600px;
                      overflow-wrap: break-word;
                      word-wrap: break-word;
                      word-break: break-word;
                      background-color: #003399;
                    "
                  >
                    <div
                      style="
                        border-collapse: collapse;
                        display: table;
                        width: 100%;
                        height: 100%;
                        background-color: transparent;
                      "
                    >
                      <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #003399;"><![endif]-->
    
                      <!--[if (mso)|(IE)]><td align="center" width="600" style="background-color: #ff3624;width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                      <div
                        class="u-col u-col-100"
                        style="
                          max-width: 320px;
                          min-width: 600px;
                          display: table-cell;
                          vertical-align: top;
                        "
                      >
                        <div
                          style="
                            background-color: #ff3624;
                            height: 100%;
                            width: 100% !important;
                          "
                        >
                          <!--[if (!mso)&(!IE)]><!-->
                          <div
                            style="
                              box-sizing: border-box;
                              height: 100%;
                              padding: 0px;
                              border-top: 0px solid transparent;
                              border-left: 0px solid transparent;
                              border-right: 0px solid transparent;
                              border-bottom: 0px solid transparent;
                            "
                          >
                            <!--<![endif]-->
    
                            <table
                              style="font-family: 'Cabin', sans-serif"
                              role="presentation"
                              cellpadding="0"
                              cellspacing="0"
                              width="100%"
                              border="0"
                            >
                              <tbody>
                                <tr>
                                  <td
                                    style="
                                      overflow-wrap: break-word;
                                      word-break: break-word;
                                      padding: 40px 10px 10px;
                                      font-family: 'Cabin', sans-serif;
                                    "
                                    align="left"
                                  >
                                    <table
                                      width="100%"
                                      cellpadding="0"
                                      cellspacing="0"
                                      border="0"
                                    >
                                      <tr>
                                        <td
                                          style="
                                            padding-right: 0px;
                                            padding-left: 0px;
                                          "
                                          align="center"
                                        >
                                          <img
                                            align="center"
                                            border="0"
                                            src="https://cdn.templates.unlayer.com/assets/1597218650916-xxxxc.png"
                                            alt="Image"
                                            title="Image"
                                            style="
                                              outline: none;
                                              text-decoration: none;
                                              -ms-interpolation-mode: bicubic;
                                              clear: both;
                                              display: inline-block !important;
                                              border: none;
                                              height: auto;
                                              float: none;
                                              width: 26%;
                                              max-width: 150.8px;
                                            "
                                            width="150.8"
                                          />
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
    
                            <table
                              style="font-family: 'Cabin', sans-serif"
                              role="presentation"
                              cellpadding="0"
                              cellspacing="0"
                              width="100%"
                              border="0"
                            >
                              <tbody>
                                <tr>
                                  <td
                                    style="
                                      overflow-wrap: break-word;
                                      word-break: break-word;
                                      padding: 10px;
                                      font-family: 'Cabin', sans-serif;
                                    "
                                    align="left"
                                  >
                                    <div
                                      style="
                                        font-size: 14px;
                                        color: #e5eaf5;
                                        line-height: 140%;
                                        text-align: center;
                                        word-wrap: break-word;
                                      "
                                    >
                                      <p style="font-size: 14px; line-height: 140%">
                                        <strong>WELCOME TO WINLY LLC!</strong>
                                      </p>
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
    
                <div
                  class="u-row-container"
                  style="padding: 0px; background-color: transparent"
                >
                  <div
                    class="u-row"
                    style="
                      margin: 0 auto;
                      min-width: 320px;
                      max-width: 600px;
                      overflow-wrap: break-word;
                      word-wrap: break-word;
                      word-break: break-word;
                      background-color: #ffffff;
                    "
                  >
                    <div
                      style="
                        border-collapse: collapse;
                        display: table;
                        width: 100%;
                        height: 100%;
                        background-color: transparent;
                      "
                    >
                      <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #ffffff;"><![endif]-->
    
                      <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                      <div
                        class="u-col u-col-100"
                        style="
                          max-width: 320px;
                          min-width: 600px;
                          display: table-cell;
                          vertical-align: top;
                        "
                      >
                        <div style="height: 100%; width: 100% !important">
                          <!--[if (!mso)&(!IE)]><!-->
                          <div
                            style="
                              box-sizing: border-box;
                              height: 100%;
                              padding: 0px;
                              border-top: 0px solid transparent;
                              border-left: 0px solid transparent;
                              border-right: 0px solid transparent;
                              border-bottom: 0px solid transparent;
                            "
                          >
                            <!--<![endif]-->
    
                            <table
                              style="font-family: 'Cabin', sans-serif"
                              role="presentation"
                              cellpadding="0"
                              cellspacing="0"
                              width="100%"
                              border="0"
                            >
                              <tbody>
                                <tr>
                                  <td
                                    style="
                                      overflow-wrap: break-word;
                                      word-break: break-word;
                                      padding: 33px 55px;
                                      font-family: 'Cabin', sans-serif;
                                    "
                                    align="left"
                                  >
                                    <div
                                      style="
                                        font-size: 14px;
                                        line-height: 160%;
                                        text-align: center;
                                        word-wrap: break-word;
                                      "
                                    >
                                      <p style="font-size: 14px; line-height: 160%">
                                        <span
                                          style="
                                            font-size: 22px;
                                            line-height: 35.2px;
                                          "
                                          >Hi ${data.fullName},
                                        </span>
                                      </p>
                                      <p style="font-size: 14px; line-height: 160%">
                                        <span
                                          style="
                                            font-size: 18px;
                                            line-height: 28.8px;
                                          "
                                          >Thank you for joining us. You are a
                                          verified user now. Visit our website to
                                          purchase tickets of exclusive Campaigns and
                                          Draws. Click Login to get access to your
                                          dashboard.</span
                                        >
                                      </p>
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
    
                            <table
                              style="font-family: 'Cabin', sans-serif"
                              role="presentation"
                              cellpadding="0"
                              cellspacing="0"
                              width="100%"
                              border="0"
                            >
                              <tbody>
                                <tr>
                                  <td
                                    style="
                                      overflow-wrap: break-word;
                                      word-break: break-word;
                                      padding: 10px;
                                      font-family: 'Cabin', sans-serif;
                                    "
                                    align="left"
                                  >
                                    <!--[if mso
                                      ]><style>
                                        .v-button {
                                          background: transparent !important;
                                        }
                                      </style><!
                                    [endif]-->
                                    <div align="center">
                                      <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://winly.net/login" style="height:44px; v-text-anchor:middle; width:128px;" arcsize="9%"  stroke="f" fillcolor="#000000"><w:anchorlock/><center style="color:#FFFFFF;"><![endif]-->
                                      <a
                                        href="https://winly.net/login"
                                        target="_self"
                                        class="v-button"
                                        style="
                                          box-sizing: border-box;
                                          display: inline-block;
                                          text-decoration: none;
                                          -webkit-text-size-adjust: none;
                                          text-align: center;
                                          color: #ffffff;
                                          background-color: #000000;
                                          border-radius: 4px;
                                          -webkit-border-radius: 4px;
                                          -moz-border-radius: 4px;
                                          width: auto;
                                          max-width: 100%;
                                          overflow-wrap: break-word;
                                          word-break: break-word;
                                          word-wrap: break-word;
                                          mso-border-alt: none;
                                          font-size: 14px;
                                        "
                                      >
                                        <span
                                          style="
                                            display: block;
                                            padding: 14px 44px 13px;
                                            line-height: 120%;
                                          "
                                          >LOGIN</span
                                        >
                                      </a>
                                      <!--[if mso]></center></v:roundrect><![endif]-->
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
    
                            <table
                              style="font-family: 'Cabin', sans-serif"
                              role="presentation"
                              cellpadding="0"
                              cellspacing="0"
                              width="100%"
                              border="0"
                            >
                              <tbody>
                                <tr>
                                  <td
                                    style="
                                      overflow-wrap: break-word;
                                      word-break: break-word;
                                      padding: 33px 55px 60px;
                                      font-family: 'Cabin', sans-serif;
                                    "
                                    align="left"
                                  >
                                    <div
                                      style="
                                        font-size: 14px;
                                        line-height: 160%;
                                        text-align: center;
                                        word-wrap: break-word;
                                      "
                                    >
                                      <p style="line-height: 160%; font-size: 14px">
                                        <span
                                          style="
                                            font-size: 18px;
                                            line-height: 28.8px;
                                          "
                                          >Thanks,</span
                                        >
                                      </p>
                                      <p style="line-height: 160%; font-size: 14px">
                                        <span
                                          style="
                                            font-size: 18px;
                                            line-height: 28.8px;
                                          "
                                          >Winly Trading LLC.</span
                                        >
                                      </p>
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
    
                <div
                  class="u-row-container"
                  style="padding: 0px; background-color: transparent"
                >
                  <div
                    class="u-row"
                    style="
                      margin: 0 auto;
                      min-width: 320px;
                      max-width: 600px;
                      overflow-wrap: break-word;
                      word-wrap: break-word;
                      word-break: break-word;
                      background-color: #e5eaf5;
                    "
                  >
                    <div
                      style="
                        border-collapse: collapse;
                        display: table;
                        width: 100%;
                        height: 100%;
                        background-color: transparent;
                      "
                    >
                      <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #e5eaf5;"><![endif]-->
    
                      <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                      <div
                        class="u-col u-col-100"
                        style="
                          max-width: 320px;
                          min-width: 600px;
                          display: table-cell;
                          vertical-align: top;
                        "
                      >
                        <div style="height: 100%; width: 100% !important">
                          <!--[if (!mso)&(!IE)]><!-->
                          <div
                            style="
                              box-sizing: border-box;
                              height: 100%;
                              padding: 0px;
                              border-top: 0px solid transparent;
                              border-left: 0px solid transparent;
                              border-right: 0px solid transparent;
                              border-bottom: 0px solid transparent;
                            "
                          >
                            <!--<![endif]-->
    
                            <table
                              style="font-family: 'Cabin', sans-serif"
                              role="presentation"
                              cellpadding="0"
                              cellspacing="0"
                              width="100%"
                              border="0"
                            >
                              <tbody>
                                <tr>
                                  <td
                                    style="
                                      overflow-wrap: break-word;
                                      word-break: break-word;
                                      padding: 41px 55px 18px;
                                      font-family: 'Cabin', sans-serif;
                                    "
                                    align="left"
                                  >
                                    <div
                                      style="
                                        font-size: 14px;
                                        color: #000000;
                                        line-height: 160%;
                                        text-align: center;
                                        word-wrap: break-word;
                                      "
                                    >
                                      <p style="font-size: 14px; line-height: 160%">
                                        <span
                                          style="font-size: 20px; line-height: 32px"
                                          ><strong>Get in touch</strong></span
                                        >
                                      </p>
                                      <p style="font-size: 14px; line-height: 160%">
                                        <span
                                          style="
                                            font-size: 16px;
                                            line-height: 25.6px;
                                            color: #000000;
                                          "
                                          >+971 44 562 309</span
                                        >
                                      </p>
                                      <p style="font-size: 14px; line-height: 160%">
                                        <span
                                          style="
                                            font-size: 16px;
                                            line-height: 25.6px;
                                            color: #000000;
                                          "
                                          >info@winly.ae</span
                                        >
                                      </p>
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
    
                            <table
                              style="font-family: 'Cabin', sans-serif"
                              role="presentation"
                              cellpadding="0"
                              cellspacing="0"
                              width="100%"
                              border="0"
                            >
                              <tbody>
                                <tr>
                                  <td
                                    style="
                                      overflow-wrap: break-word;
                                      word-break: break-word;
                                      padding: 10px 10px 33px;
                                      font-family: 'Cabin', sans-serif;
                                    "
                                    align="left"
                                  >
                                    <div align="center">
                                      <div style="display: table; max-width: 97px">
                                        <!--[if (mso)|(IE)]><table width="97" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-collapse:collapse;" align="center"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; mso-table-lspace: 0pt;mso-table-rspace: 0pt; width:97px;"><tr><![endif]-->
    
                                        <!--[if (mso)|(IE)]><td width="32" style="width:32px; padding-right: 17px;" valign="top"><![endif]-->
                                        <table
                                          align="left"
                                          border="0"
                                          cellspacing="0"
                                          cellpadding="0"
                                          width="32"
                                          height="32"
                                          style="
                                            width: 32px !important;
                                            height: 32px !important;
                                            display: inline-block;
                                            border-collapse: collapse;
                                            table-layout: fixed;
                                            border-spacing: 0;
                                            mso-table-lspace: 0pt;
                                            mso-table-rspace: 0pt;
                                            vertical-align: top;
                                            margin-right: 17px;
                                          "
                                        >
                                          <tbody>
                                            <tr style="vertical-align: top">
                                              <td
                                                align="left"
                                                valign="middle"
                                                style="
                                                  word-break: break-word;
                                                  border-collapse: collapse !important;
                                                  vertical-align: top;
                                                "
                                              >
                                                <a
                                                  href="https://www.facebook.com/Winly.net"
                                                  title="Facebook"
                                                  target="_blank"
                                                >
                                                  <img
                                                    src="https://cdn.tools.unlayer.com/social/icons/circle-black/facebook.png"
                                                    alt="Facebook"
                                                    title="Facebook"
                                                    width="32"
                                                    style="
                                                      outline: none;
                                                      text-decoration: none;
                                                      -ms-interpolation-mode: bicubic;
                                                      clear: both;
                                                      display: block !important;
                                                      border: none;
                                                      height: auto;
                                                      float: none;
                                                      max-width: 32px !important;
                                                    "
                                                  />
                                                </a>
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                        <!--[if (mso)|(IE)]></td><![endif]-->
    
                                        <!--[if (mso)|(IE)]><td width="32" style="width:32px; padding-right: 0px;" valign="top"><![endif]-->
                                        <table
                                          align="left"
                                          border="0"
                                          cellspacing="0"
                                          cellpadding="0"
                                          width="32"
                                          height="32"
                                          style="
                                            width: 32px !important;
                                            height: 32px !important;
                                            display: inline-block;
                                            border-collapse: collapse;
                                            table-layout: fixed;
                                            border-spacing: 0;
                                            mso-table-lspace: 0pt;
                                            mso-table-rspace: 0pt;
                                            vertical-align: top;
                                            margin-right: 0px;
                                          "
                                        >
                                          <tbody>
                                            <tr style="vertical-align: top">
                                              <td
                                                align="left"
                                                valign="middle"
                                                style="
                                                  word-break: break-word;
                                                  border-collapse: collapse !important;
                                                  vertical-align: top;
                                                "
                                              >
                                                <a
                                                  href="https://www.instagram.com/winly.ae"
                                                  title="Instagram"
                                                  target="_blank"
                                                >
                                                  <img
                                                    src="https://cdn.tools.unlayer.com/social/icons/circle-black/instagram.png"
                                                    alt="Instagram"
                                                    title="Instagram"
                                                    width="32"
                                                    style="
                                                      outline: none;
                                                      text-decoration: none;
                                                      -ms-interpolation-mode: bicubic;
                                                      clear: both;
                                                      display: block !important;
                                                      border: none;
                                                      height: auto;
                                                      float: none;
                                                      max-width: 32px !important;
                                                    "
                                                  />
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
    
                <div
                  class="u-row-container"
                  style="padding: 0px; background-color: transparent"
                >
                  <div
                    class="u-row"
                    style="
                      margin: 0 auto;
                      min-width: 320px;
                      max-width: 600px;
                      overflow-wrap: break-word;
                      word-wrap: break-word;
                      word-break: break-word;
                      background-color: #003399;
                    "
                  >
                    <div
                      style="
                        border-collapse: collapse;
                        display: table;
                        width: 100%;
                        height: 100%;
                        background-color: transparent;
                      "
                    >
                      <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #003399;"><![endif]-->
    
                      <!--[if (mso)|(IE)]><td align="center" width="600" style="background-color: #ff3624;width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                      <div
                        class="u-col u-col-100"
                        style="
                          max-width: 320px;
                          min-width: 600px;
                          display: table-cell;
                          vertical-align: top;
                        "
                      >
                        <div
                          style="
                            background-color: #ff3624;
                            height: 100%;
                            width: 100% !important;
                          "
                        >
                          <!--[if (!mso)&(!IE)]><!-->
                          <div
                            style="
                              box-sizing: border-box;
                              height: 100%;
                              padding: 0px;
                              border-top: 0px solid transparent;
                              border-left: 0px solid transparent;
                              border-right: 0px solid transparent;
                              border-bottom: 0px solid transparent;
                            "
                          >
                            <!--<![endif]-->
    
                            <table
                              style="font-family: 'Cabin', sans-serif"
                              role="presentation"
                              cellpadding="0"
                              cellspacing="0"
                              width="100%"
                              border="0"
                            >
                              <tbody>
                                <tr>
                                  <td
                                    style="
                                      overflow-wrap: break-word;
                                      word-break: break-word;
                                      padding: 10px;
                                      font-family: 'Cabin', sans-serif;
                                    "
                                    align="left"
                                  >
                                    <div
                                      style="
                                        font-size: 14px;
                                        color: #fafafa;
                                        line-height: 180%;
                                        text-align: center;
                                        word-wrap: break-word;
                                      "
                                    >
                                      <p style="font-size: 14px; line-height: 180%">
                                        <span
                                          style="
                                            font-size: 16px;
                                            line-height: 28.8px;
                                          "
                                          >Copyrights © Winly Trading LLC. All
                                          Rights Reserved</span
                                        >
                                      </p>
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
    </html>
    `,
  });
}

exports.verifyEmail = (req, res) => {
  User.findOne({ email: req.body.email }).exec((error, user) => {
    if (error) {
      return res.status(400).json({ msg: "Something Went Wrong! Try Again." });
    }
    if (user) {
      if (
        user.verification.isVerified === false &&
        user.verification.code !== null &&
        user.verification.code === req.body.code
      ) {
        User.findOneAndUpdate(
          { email: user.email },
          {
            $set: {
              "verification.isVerified": true,
            },
          },
          { new: true }
        ).exec(async (err, data) => {
          if (err) {
            return res.status(400).json({ msg: "Email Verification Failed!" });
          }
          if (data) {
            await newUserEmail(data);
            return res
              .status(202)
              .json({ msg: "Verification Success! Please Login Again." });
          }
        });
      }
      if (
        user.verification.isVerified === false &&
        user.verification.code !== null &&
        user.verification.code !== req.body.code
      ) {
        return res
          .status(401)
          .json({ msg: "Wrong Code. Please Submit Again!" });
      }
    }
  });
};

exports.verifyEmailForPassword = (req, res) => {
  User.findOne({ email: req.body.email }).exec((error, user) => {
    if (error) {
      return res.status(400).json({ msg: "Something Went Wrong! Try Again." });
    }
    if (user && user.verification.code === req.body.code) {
      return res.status(202).json({ msg: "Verification Success!" });
    }
    if (user && user.verification.code !== req.body.code) {
      return res.status(400).json({ msg: "Email Verification Failed!" });
    }
  });
};

exports.signout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({
    msg: "Signout Successfully!",
  });
};

exports.updatePassword = async (req, res) => {
  const hash_password = await bcrypt.hash(req.body.newPassword, 10);
  User.findOneAndUpdate(
    { _id: req.user._id },
    { $set: { hash_password: hash_password } },
    { new: true }
  ).exec((error, user) => {
    if (user) {
      return res.status(200).json({ msg: "Password Updated!" });
    }
    if (error) {
      return res.status(400).json({ error, msg: "Something Went Wrong!" });
    }
  });
};

exports.resetPassword = async (req, res) => {
  const hash_password = await bcrypt.hash(req.body.password, 10);
  User.findOneAndUpdate(
    { email: req.body.email },
    { $set: { hash_password: hash_password } },
    { new: true }
  ).exec((error, user) => {
    if (user) {
      return res.status(200).json({ msg: "Password Updated!" });
    }
    if (error) {
      return res.status(400).json({ error, msg: "Something Went Wrong!" });
    }
  });
};

exports.updateProfileData = (req, res) => {
  const {
    firstName,
    lastName,
    gender,
    dob,
    dialCode,
    phone,
    country,
    nationality,
  } = req.body;
  User.findOneAndUpdate(
    { _id: req.user._id },
    {
      $set: {
        firstName: firstName,
        lastName: lastName,
        gender: gender,
        dob: dob,
        dialCode: dialCode,
        phone: phone,
        country: country,
        nationality: nationality,
      },
    },
    { new: true }
  ).exec((error, user) => {
    if (user) {
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
        nationality,
        stripe_id,
        notification,
      } = user;
      return res.status(200).json({
        msg: "Profile Information Updated",
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
          nationality,
          stripe_id,
          notification,
        },
      });
    }
    if (error) {
      return res.status(400).json({ error });
    }
  });
};

exports.updateImage = (req, res) => {
  const img = req.body.img;
  User.findOneAndUpdate(
    { _id: req.user._id },
    {
      $set: {
        img: img,
      },
    },
    { new: true }
  ).exec((error, user) => {
    if (user) {
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
        nationality,
        stripe_id,
        notification,
      } = user;
      return res.status(200).json({
        msg: "Picture Updated",
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
          nationality,
          stripe_id,
          notification,
        },
      });
    }
    if (error) {
      return res.status(400).json({ error });
    }
  });
};

exports.getAllUser = (req, res) => {
  User.find().exec((error, users) => {
    if (error) {
      return res.status(400).json({ error });
    }
    if (users) {
      return res.status(200).json({ users });
    }
  });
};

exports.updateNotification = (req, res) => {
  User.findOneAndUpdate(
    { _id: req.user._id },
    {
      $set: {
        notification: {
          email: req.body.email,
          sms: req.body.sms,
          wp: req.body.wp,
          pn: req.body.pn,
        },
      },
    },
    { new: true }
  ).exec((error, user) => {
    if (error) {
      return res.status(400).json({ msg: "Something Went Wrong." });
    }
    if (user) {
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
        nationality,
        stripe_id,
        notification,
      } = user;
      return res.status(200).json({
        msg: "Notification Prefenrence Updated",
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
          nationality,
          stripe_id,
          notification,
        },
      });
    }
  });
};

exports.deleteUser = (req, res) => {
  User.findOneAndDelete({ email: req.body.email }).exec((err, user) => {
    if (err) {
      return res.status(400).json({ msg: "Something Went Wrong!" });
    }
    if (user) {
      return res.status(201).json({ msg: "Account Deleted!" });
    }
  });
};
