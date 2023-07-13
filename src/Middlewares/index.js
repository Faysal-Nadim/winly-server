const multer = require("multer");
const multerS3 = require("multer-s3");
const { S3Client } = require("@aws-sdk/client-s3");
const shortid = require("shortid");
const jwt = require("jsonwebtoken");
const User = require("../Models/user");

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_KEY,
  },
  region: "me-central-1",
});

exports.uploads3 = multer({
  storage: multerS3({
    s3: s3,
    bucket: "winly-storage",
    acl: "public-read",
    metadata: function (req, file, cb) {
      cb(null, { contentType: file.mimetype });
    },
    key: function (req, file, cb) {
      cb(null, shortid.generate() + "-" + file.originalname);
    },
  }),
});

exports.requireSignIn = (req, res, next) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
  } else {
    return res.status(400).json({ msg: "Please Login First!" });
  }
  next();
};

exports.adminMiddleware = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(400).json({ msg: "Admin Access Denied" });
  }
  next();
};

exports.userMiddleware = (req, res, next) => {
  if (req.user.role !== "user") {
    return res.status(400).json({ msg: "User Access Denied" });
  }
  next();
};

exports.passwordVerification = async (req, res, next) => {
  User.findOne({ _id: req.user._id }).exec(async (error, user) => {
    if (user) {
      const isPassword = await user.authenticate(req.body.password);
      if (isPassword) {
        next();
      } else {
        return res.status(400).json({ msg: "Invalid Password" });
      }
    }
    if (error) {
      return res.status(400).json({ msg: "Something Went Wrong, Try Again!" });
    }
  });
};
