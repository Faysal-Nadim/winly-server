const express = require("express");
const { createCustomer } = require("../Controllers/payment");
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
  resetPassword,
  verifyEmailForPassword,
  getAllUser,
  updateNotification,
  deleteUser,
} = require("../Controllers/user");
const {
  requireSignIn,
  userMiddleware,
  adminMiddleware,
  passwordVerification,
} = require("../Middlewares");
const router = express.Router();

//User Routes
router.post("/user/auth/signup", createCustomer, signup);
router.post("/user/auth/signin", signin);
router.get("/user/auth/signout", signout);
router.post("/user/auth/email/sendcode", sendVerificationCode);
router.post("/user/auth/email/verify", verifyEmail);
router.post("/user/auth/password/email/verify", verifyEmailForPassword);
router.post(
  "/user/auth/password/update",
  requireSignIn,
  userMiddleware,
  passwordVerification,
  updatePassword
);
router.post("/user/auth/password/reset", resetPassword);

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
router.post(
  "/user/auth/update/notification",
  requireSignIn,
  userMiddleware,
  updateNotification
);
router.post(
  "/user/auth/profile/delete",
  requireSignIn,
  userMiddleware,
  passwordVerification,
  deleteUser
);

//Admin Routes
router.post("/admin/auth/signup", requireSignIn, adminMiddleware, adminSignup);
router.post("/admin/auth/signin", adminSignin);
router.get("/admin/get/users", requireSignIn, adminMiddleware, getAllUser);

module.exports = router;
