const express = require("express");
const {
  signup,
  signin,
  sendVerificationCode,
  verifyEmail,
  signout,
  resetPassword,
  adminSignin,
  adminSignup,
} = require("../Controllers/user");
const {
  requireSignIn,
  userMiddleware,
  adminMiddleware,
} = require("../Middlewares");
const router = express.Router();

//User Routes
router.post("/user/auth/signup", signup);
router.post("/user/auth/signin", signin);
router.get("/user/auth/signout", signout);
router.post("/user/auth/email/sendcode", sendVerificationCode);
router.post("/user/auth/email/verify", verifyEmail);
router.post(
  "/user/auth/resetpassword",
  requireSignIn,
  userMiddleware,
  resetPassword
);

//Admin Routes
router.post("/admin/auth/signup", requireSignIn, adminMiddleware, adminSignup);
router.post("/admin/auth/signin", adminSignin);

module.exports = router;
