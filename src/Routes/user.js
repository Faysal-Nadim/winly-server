const express = require("express");
const {
  signup,
  signin,
  sendVerificationCode,
  verifyEmail,
  signout,
  resetPassword,
  adminSignin,
} = require("../Controllers/user");
const { requireSignIn, userMiddleware } = require("../Middlewares");
const router = express.Router();

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

router.post("/admin/auth/signin", adminSignin);

module.exports = router;
