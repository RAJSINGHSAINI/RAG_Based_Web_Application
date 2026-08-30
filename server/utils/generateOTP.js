import crypto from "crypto";

/** How long an OTP stays valid, in minutes. Used in the emails too. */
export const OTP_EXPIRY_MINUTES = 10;

/**
 * Generates a 6-digit OTP using the crypto module's CSPRNG.
 * Math.random() is predictable and must not be used for security codes.
 */
export const generateOTP = () => String(crypto.randomInt(100000, 1000000));

/** Timestamp for when a freshly generated OTP should stop working. */
export const otpExpiry = () =>
  new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

/** How long the reset token from step 2 stays usable, in minutes. */
export const RESET_TOKEN_EXPIRY_MINUTES = 15;

/** Random, unguessable token that authorises the final reset-password step. */
export const generateResetToken = () => crypto.randomBytes(32).toString("hex");

/** Only the hash is stored, so a database leak cannot be replayed as a token. */
export const hashResetToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const resetTokenExpiry = () =>
  new Date(Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000);

export default generateOTP;
