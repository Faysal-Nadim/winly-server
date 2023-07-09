const User = require("../Models/user.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const ses = require("node-ses");

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
          wallet,
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
            wallet,
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
          wallet,
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
            wallet,
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
        "verification.code": Math.floor(1000 + Math.random() * 9000),
      },
    },
    { new: true }
  ).exec((error, data) => {
    if (error) {
      return res.status(400).json({ msg: "Something Went Wrong" });
    }
    if (data) {
      const sesClient = ses.createClient({
        key: process.env.AWS_ID,
        secret: process.env.AWS_KEY,
        amazon: `https://email.ap-south-1.amazonaws.com`,
      });

      sesClient.sendEmail(
        {
          to: `${req.body.email}`,
          from: "Winly <no-reply@winly.net>",
          subject: "Verification Code From Winly",
          message: `Your Verification Code Is ${data.verification.code}. This code will expire in 120 seconds.`,
        },
        function (err, data) {
          if (err) {
            return res.status(401).json({ err });
          }
          if (data && err === null) {
            return res.status(202).json({ msg: "Verification Code Sent!" });
          }
        }
      );
    }
  });
};

exports.verifyEmail = (req, res) => {
  console.log(req.body);
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
        ).exec((err, data) => {
          if (err) {
            return res.status(400).json({ msg: "Email Verification Failed!" });
          }
          if (data) {
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

exports.signout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({
    msg: "Signout Successfully!",
  });
};

exports.resetPassword = async (req, res) => {
  const hash_password = await bcrypt.hash(req.body.newPassword, 10);
  User.findOneAndUpdate(
    { _id: req.user._id },
    { $set: { hash_password: hash_password } },
    { new: true }
  ).exec((error, user) => {
    if (user) {
      return res.status(200).json({ user });
    }
    if (error) {
      return res.status(400).json({ error });
    }
  });
};
