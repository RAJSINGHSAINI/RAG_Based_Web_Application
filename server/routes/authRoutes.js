import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  signup,
  login,
  logout,
  verifyEmail,
  resendVerificationOtp,
  forgotPassword,
  verifyForgotPasswordOTP,
  resetPassword,
  requestChangeEmail,
  verifyChangeEmail,
  getProfile,
  updateProfile,
  getCurrentUser,
} from "../controllers/authController.js";

const router = express.Router();

/* ---- Public ---- */
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification-otp", resendVerificationOtp);
router.post("/forgot-password", forgotPassword);
router.post("/verify-forgot-password-otp", verifyForgotPasswordOTP);
router.post("/reset-password", resetPassword);

/* ---- Protected: require a valid JWT cookie ---- */
router.get("/me", protect, getCurrentUser);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.post("/request-change-email", protect, requestChangeEmail);
router.post("/verify-change-email", protect, verifyChangeEmail);

export default router;
