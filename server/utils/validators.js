/**
 * Server-side validation. The React forms validate too, but that is only for
 * fast feedback — anyone can call the API directly, so every rule is enforced
 * here as well.
 */

export const MIN_PASSWORD_LENGTH = 8;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const isValidEmail = (value) =>
  typeof value === "string" && EMAIL_PATTERN.test(value.trim());

export const isValidOtp = (value) =>
  typeof value === "string" && /^\d{6}$/.test(value.trim());

export const normaliseEmail = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

/** Returns an error message, or null when the password is acceptable. */
export const validatePassword = (value) => {
  if (typeof value !== "string" || value.length === 0) {
    return "Password is required";
  }
  if (value.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }
  return null;
};

export const validateFullName = (value) => {
  if (typeof value !== "string" || value.trim().length === 0) {
    return "Full name is required";
  }
  if (value.trim().length < 2) {
    return "Full name must be at least 2 characters";
  }
  if (value.trim().length > 60) {
    return "Full name must be at most 60 characters";
  }
  return null;
};

/** Shape sent to the client. Nothing secret ever appears in it. */
export const sanitizeUser = (user) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  isVerified: user.isVerified,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});
