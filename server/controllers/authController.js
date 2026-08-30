import User from "../models/userModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  generateOTP,
  otpExpiry,
  OTP_EXPIRY_MINUTES,
  generateResetToken,
  hashResetToken,
  resetTokenExpiry,
} from "../utils/generateOTP.js";
import {
  sendVerificationOtp,
  sendForgotPasswordOtp,
  sendChangeEmailOtp,
} from "../config/mail.js";
import { setAuthCookie, clearAuthCookie } from "../utils/token.js";
import {
  isValidEmail,
  isValidOtp,
  normaliseEmail,
  validatePassword,
  validateFullName,
  sanitizeUser,
} from "../utils/validators.js";

/** Small helper for throwing errors the error handler turns into JSON. */
const fail = (status, message) => {
  const error = new Error(message);
  error.statusCode = status;
  throw error;
};

/* ------------------------------------------------------------------------- */
/* Signup                                                                    */
/* ------------------------------------------------------------------------- */

// POST /api/auth/signup
export const signup = asyncHandler(async (req, res) => {
  const { fullName, password, confirmPassword } = req.body;
  const email = normaliseEmail(req.body.email);

  const nameError = validateFullName(fullName);
  if (nameError) fail(400, nameError);

  if (!isValidEmail(email)) fail(400, "Enter a valid email address");

  const passwordError = validatePassword(password);
  if (passwordError) fail(400, passwordError);

  if (password !== confirmPassword) fail(400, "Passwords do not match");

  const existing = await User.findOne({ email });
  if (existing) fail(409, "That email is already registered");

  const otp = generateOTP();

  // The pre-save hook hashes the password before it reaches MongoDB.
  const user = await User.create({
    fullName: fullName.trim(),
    email,
    password,
    isVerified: false,
    otp,
    otpExpiresAt: otpExpiry(),
    otpPurpose: "verify-email",
  });

  try {
    await sendVerificationOtp({
      to: user.email,
      fullName: user.fullName,
      otp,
      minutes: OTP_EXPIRY_MINUTES,
    });
  } catch (err) {
    // The account exists, so tell the client to move on to verification and
    // request a fresh code rather than silently failing.
    return res.status(201).json({
      success: true,
      requiresVerification: true,
      email: user.email,
      message:
        "Account created, but the verification code could not be sent. Choose “Send a new code” on the next screen.",
    });
  }

  return res.status(201).json({
    success: true,
    requiresVerification: true,
    email: user.email,
    message: `Account created. We sent a 6-digit code to ${user.email}.`,
  });
});

/* ------------------------------------------------------------------------- */
/* Email verification                                                        */
/* ------------------------------------------------------------------------- */

// POST /api/auth/verify-email
export const verifyEmail = asyncHandler(async (req, res) => {
  const email = normaliseEmail(req.body.email);
  const otp = String(req.body.otp ?? "").trim();

  if (!isValidEmail(email)) fail(400, "Enter a valid email address");
  if (!isValidOtp(otp)) fail(400, "Enter the 6-digit code");

  const user = await User.findOne({ email }).select(
    "+otp +otpExpiresAt +otpPurpose"
  );

  if (!user) fail(400, "That code is not valid");

  if (user.isVerified) {
    return res.status(200).json({
      success: true,
      message: "This email is already verified.",
      user: sanitizeUser(user),
    });
  }

  if (!user.otp || user.otpPurpose !== "verify-email") {
    fail(400, "That code is not valid. Request a new one.");
  }

  if (user.otpExpiresAt && user.otpExpiresAt.getTime() < Date.now()) {
    fail(400, "That code has expired. Request a new one.");
  }

  if (user.otp !== otp) fail(400, "That code is not valid");

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiresAt = undefined;
  user.otpPurpose = undefined;
  await user.save();

  return res.status(200).json({
    success: true,
    message: "Email verified.",
    user: sanitizeUser(user),
  });
});

// POST /api/auth/resend-verification-otp
export const resendVerificationOtp = asyncHandler(async (req, res) => {
  const email = normaliseEmail(req.body.email);
  if (!isValidEmail(email)) fail(400, "Enter a valid email address");

  const user = await User.findOne({ email });

  // Same reply whether or not the account exists, so the endpoint cannot be
  // used to discover which emails are registered.
  const genericReply = {
    success: true,
    message: `If that account needs verifying, a new code is on its way to ${email}.`,
  };

  if (!user || user.isVerified) {
    return res.status(200).json(genericReply);
  }

  const otp = generateOTP();
  user.otp = otp;
  user.otpExpiresAt = otpExpiry();
  user.otpPurpose = "verify-email";
  await user.save();

  await sendVerificationOtp({
    to: user.email,
    fullName: user.fullName,
    otp,
    minutes: OTP_EXPIRY_MINUTES,
  });

  return res.status(200).json(genericReply);
});

/* ------------------------------------------------------------------------- */
/* Login / logout / session                                                  */
/* ------------------------------------------------------------------------- */

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const email = normaliseEmail(req.body.email);
  const { password } = req.body;

  if (!isValidEmail(email)) fail(400, "Enter a valid email address");
  if (!password) fail(400, "Password is required");

  // password is select: false on the schema, so ask for it explicitly.
  const user = await User.findOne({ email }).select("+password");

  // Identical message for unknown email and wrong password.
  if (!user) fail(401, "Email or password is incorrect");

  const passwordMatches = await user.comparePassword(password);
  if (!passwordMatches) fail(401, "Email or password is incorrect");

  if (!user.isVerified) {
    return res.status(403).json({
      success: false,
      requiresVerification: true,
      email: user.email,
      message: "Verify your email address before logging in.",
    });
  }

  // The JWT goes straight into an HTTP-only cookie. It is never part of the
  // JSON body, so client-side JavaScript never holds the token.
  setAuthCookie(res, user._id);

  return res.status(200).json({
    success: true,
    message: "Login successful",
    user: sanitizeUser(user),
  });
});

// GET /api/auth/me  (protected)
export const getCurrentUser = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, user: sanitizeUser(req.user) });
});

// POST /api/auth/logout
export const logout = asyncHandler(async (req, res) => {
  clearAuthCookie(res);
  res.status(200).json({ success: true, message: "Logged out" });
});

/* ------------------------------------------------------------------------- */
/* Forgot password                                                           */
/* ------------------------------------------------------------------------- */

// POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const email = normaliseEmail(req.body.email);
  if (!isValidEmail(email)) fail(400, "Enter a valid email address");

  const user = await User.findOne({ email });

  const genericReply = {
    success: true,
    message: `If an account exists for ${email}, a 6-digit code is on its way.`,
  };

  if (!user) return res.status(200).json(genericReply);

  const otp = generateOTP();
  user.otp = otp;
  user.otpExpiresAt = otpExpiry();
  user.otpPurpose = "forgot-password";
  // Drop any half-finished reset from an earlier attempt.
  user.resetToken = undefined;
  user.resetTokenExpiresAt = undefined;
  await user.save();

  await sendForgotPasswordOtp({
    to: user.email,
    otp,
    minutes: OTP_EXPIRY_MINUTES,
  });

  return res.status(200).json(genericReply);
});

// POST /api/auth/verify-forgot-password-otp
export const verifyForgotPasswordOTP = asyncHandler(async (req, res) => {
  const email = normaliseEmail(req.body.email);
  const otp = String(req.body.otp ?? "").trim();

  if (!isValidEmail(email)) fail(400, "Enter a valid email address");
  if (!isValidOtp(otp)) fail(400, "Enter the 6-digit code");

  const user = await User.findOne({ email }).select(
    "+otp +otpExpiresAt +otpPurpose"
  );

  if (!user || !user.otp || user.otpPurpose !== "forgot-password") {
    fail(400, "That code is not valid. Request a new one.");
  }

  if (user.otpExpiresAt && user.otpExpiresAt.getTime() < Date.now()) {
    fail(400, "That code has expired. Request a new one.");
  }

  if (user.otp !== otp) fail(400, "That code is not valid");

  // The OTP is spent here. A separate one-time token authorises the actual
  // password change, so the last step does not depend on the code again.
  const resetToken = generateResetToken();

  user.otp = undefined;
  user.otpExpiresAt = undefined;
  user.otpPurpose = undefined;
  user.resetToken = hashResetToken(resetToken);
  user.resetTokenExpiresAt = resetTokenExpiry();
  await user.save();

  return res.status(200).json({
    success: true,
    message: "Code verified. Choose a new password.",
    resetToken,
  });
});

// POST /api/auth/reset-password
export const resetPassword = asyncHandler(async (req, res) => {
  const email = normaliseEmail(req.body.email);
  const { resetToken, password, confirmPassword } = req.body;

  if (!isValidEmail(email)) fail(400, "Enter a valid email address");
  if (!resetToken) fail(400, "This reset link is no longer valid. Start again.");

  const passwordError = validatePassword(password);
  if (passwordError) fail(400, passwordError);

  if (password !== confirmPassword) fail(400, "Passwords do not match");

  const user = await User.findOne({ email }).select(
    "+resetToken +resetTokenExpiresAt +password"
  );

  if (!user || !user.resetToken) {
    fail(400, "This reset request is no longer valid. Start again.");
  }

  if (
    user.resetTokenExpiresAt &&
    user.resetTokenExpiresAt.getTime() < Date.now()
  ) {
    fail(400, "This reset request has expired. Start again.");
  }

  if (user.resetToken !== hashResetToken(resetToken)) {
    fail(400, "This reset request is no longer valid. Start again.");
  }

  user.password = password; // hashed by the pre-save hook
  user.resetToken = undefined;
  user.resetTokenExpiresAt = undefined;
  await user.save();

  // Force a fresh login with the new password.
  clearAuthCookie(res);

  return res.status(200).json({
    success: true,
    message: "Password updated. Log in with your new password.",
  });
});

/* ------------------------------------------------------------------------- */
/* Profile                                                                   */
/* ------------------------------------------------------------------------- */

// GET /api/auth/profile  (protected)
export const getProfile = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, user: sanitizeUser(req.user) });
});

// PUT /api/auth/profile  (protected)
export const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  // Email changes need an OTP, so they cannot ride along with a profile update.
  if (email && normaliseEmail(email) !== req.user.email) {
    fail(400, "Use “Change email” to update your email address");
  }

  const nameError = validateFullName(fullName);
  if (nameError) fail(400, nameError);

  req.user.fullName = fullName.trim();
  await req.user.save();

  return res.status(200).json({
    success: true,
    message: "Profile updated.",
    user: sanitizeUser(req.user),
  });
});

/* ------------------------------------------------------------------------- */
/* Change email                                                              */
/* ------------------------------------------------------------------------- */

// POST /api/auth/request-change-email  (protected)
export const requestChangeEmail = asyncHandler(async (req, res) => {
  const newEmail = normaliseEmail(req.body.newEmail ?? req.body.email);

  if (!isValidEmail(newEmail)) fail(400, "Enter a valid email address");

  if (newEmail === req.user.email) {
    fail(400, "That is already your email address");
  }

  const taken = await User.findOne({ email: newEmail });
  if (taken) fail(409, "That email is already registered to another account");

  const otp = generateOTP();

  // Send before saving: if the email cannot be delivered, no pending change is
  // recorded. Writing these three fields also replaces — and therefore
  // invalidates — any pending change from an earlier request.
  await sendChangeEmailOtp({
    to: newEmail,
    otp,
    minutes: OTP_EXPIRY_MINUTES,
  });

  req.user.pendingEmail = newEmail;
  req.user.pendingEmailOtp = otp;
  req.user.pendingEmailOtpExpiresAt = otpExpiry();
  await req.user.save();

  return res.status(200).json({
    success: true,
    pendingEmail: newEmail,
    message: `We sent a 6-digit code to ${newEmail}.`,
  });
});

// POST /api/auth/verify-change-email  (protected)
export const verifyChangeEmail = asyncHandler(async (req, res) => {
  const otp = String(req.body.otp ?? "").trim();
  if (!isValidOtp(otp)) fail(400, "Enter the 6-digit code");

  // req.user came from the middleware without the select: false fields.
  const user = await User.findById(req.user._id).select(
    "+pendingEmail +pendingEmailOtp +pendingEmailOtpExpiresAt"
  );

  if (!user?.pendingEmail || !user.pendingEmailOtp) {
    fail(400, "There is no email change waiting. Start again.");
  }

  if (
    user.pendingEmailOtpExpiresAt &&
    user.pendingEmailOtpExpiresAt.getTime() < Date.now()
  ) {
    fail(400, "That code has expired. Request a new one.");
  }

  if (user.pendingEmailOtp !== otp) fail(400, "That code is not valid");

  // Re-check at the last moment in case the address was claimed in between.
  const taken = await User.findOne({
    email: user.pendingEmail,
    _id: { $ne: user._id },
  });
  if (taken) {
    user.pendingEmail = undefined;
    user.pendingEmailOtp = undefined;
    user.pendingEmailOtpExpiresAt = undefined;
    await user.save();
    fail(409, "That email is already registered to another account");
  }

  // Only now does the account's real email change.
  user.email = user.pendingEmail;
  // The OTP was delivered to this address, which proves the user controls it.
  user.isVerified = true;
  user.pendingEmail = undefined;
  user.pendingEmailOtp = undefined;
  user.pendingEmailOtpExpiresAt = undefined;
  await user.save();

  return res.status(200).json({
    success: true,
    message: "Email updated.",
    user: sanitizeUser(user),
  });
});
