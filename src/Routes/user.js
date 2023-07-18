const express = require("express");
const {
  signup,
  signin,
  sendVerificationCode,
  verifyEmail,
  signout,
  adminSignin,
  adminSignup,
  updateImage,
  updateProfileData,
  updatePassword,
} = require("../Controllers/user");
const {
  requireSignIn,
  userMiddleware,
  adminMiddleware,
  passwordVerification,
} = require("../Middlewares");
const router = express.Router();

//User Routes
router.post("/user/auth/signup", signup);
router.post("/user/auth/signin", signin);
router.get("/user/auth/signout", signout);
router.post("/user/auth/email/sendcode", sendVerificationCode);
router.post("/user/auth/email/verify", verifyEmail);
router.post(
  "/user/auth/password/update",
  requireSignIn,
  userMiddleware,
  passwordVerification,
  updatePassword
);
router.post(
  "/user/auth/update/img",
  requireSignIn,
  userMiddleware,
  updateImage
);
router.post(
  "/user/auth/update/profile",
  requireSignIn,
  userMiddleware,
  passwordVerification,
  updateProfileData
);

//Admin Routes
router.post("/admin/auth/signup", requireSignIn, adminMiddleware, adminSignup);
router.post("/admin/auth/signin", adminSignin);

module.exports = router;
