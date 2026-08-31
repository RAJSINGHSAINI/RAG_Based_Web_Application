import crypto from "crypto";
import redisClient from "../config/redis.js";

const OTP_TTL_SECONDS = 10 * 60; // 10 minutes
const MAX_ATTEMPTS = 5;

// Helper to hash OTPs using SHA-256
const hashOtp = (otp) => crypto.createHash("sha256").update(otp).digest("hex");

/** Store hashed OTP and optional metadata (like pendingEmail) in Redis */
export const storeOtpInRedis = async (identifier, rawOtp, purpose, metadata = null) => {
  const otpKey = `otp:${purpose}:${identifier}`;
  const attemptsKey = `otp_attempts:${purpose}:${identifier}`;
  const hashedOtp = hashOtp(rawOtp);

  // Store hashed OTP
  
  await redisClient.set(otpKey, hashedOtp, "EX", OTP_TTL_SECONDS);
  // Reset attempts counter
  await redisClient.set(attemptsKey, 0, "EX", OTP_TTL_SECONDS);

  // If there is associated temporary metadata (e.g., pending new email)
  if (metadata) {
    const metaKey = `otp_meta:${purpose}:${identifier}`;
    await redisClient.set(metaKey, JSON.stringify(metadata), "EX", OTP_TTL_SECONDS);
  }
};

/** Verify user-submitted OTP from Redis */
export const verifyOtpFromRedis = async (identifier, submittedOtp, purpose) => {
  const otpKey = `otp:${purpose}:${identifier}`;
  const attemptsKey = `otp_attempts:${purpose}:${identifier}`;
  const metaKey = `otp_meta:${purpose}:${identifier}`;

  // 1. Check rate limits
  const attempts = parseInt((await redisClient.get(attemptsKey)) || "0", 10);
  if (attempts >= MAX_ATTEMPTS) {
    await redisClient.del(otpKey, attemptsKey, metaKey);
    throw new Error("Too many failed attempts. Please request a new code.");
  }

  // 2. Retrieve hashed OTP
  const storedHashedOtp = await redisClient.get(otpKey);
  if (!storedHashedOtp) {
    throw new Error("Code has expired or is invalid. Please request a new one.");
  }

  // 3. Validate code match
  if (hashOtp(submittedOtp) !== storedHashedOtp) {
    await redisClient.incr(attemptsKey);
    throw new Error("Invalid code.");
  }

  // 4. Retrieve any stored metadata before cleanup
  const rawMeta = await redisClient.get(metaKey);
  const metadata = rawMeta ? JSON.parse(rawMeta) : null;

  // 5. Cleanup Redis keys (One-Time Use enforcement)
  await redisClient.del(otpKey, attemptsKey, metaKey);

  return { success: true, metadata };
};