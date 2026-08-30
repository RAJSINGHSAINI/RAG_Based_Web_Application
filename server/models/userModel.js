import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Full name must be at least 2 characters"],
      maxlength: [60, "Full name must be at most 60 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    // select: false means the password is left out of every query result
    // unless we explicitly ask for it with .select("+password")
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    // ---- One-time password used by signup verification and forgot password ----
    otp: {
      type: String,
      select: false,
    },
    otpExpiresAt: {
      type: Date,
      select: false,
    },
    // "verify-email" or "forgot-password".
    // Stops an OTP issued for one flow from being accepted by another flow.
    otpPurpose: {
      type: String,
      enum: ["verify-email", "forgot-password"],
      select: false,
    },

    // ---- Short-lived token that authorises the final reset-password step ----
    resetToken: {
      type: String,
      select: false,
    },
    resetTokenExpiresAt: {
      type: Date,
      select: false,
    },

    // ---- Change-email flow ----
    // The new address lives here until its OTP is verified, so the account's
    // real email is never overwritten by an unverified request.
    pendingEmail: {
      type: String,
      lowercase: true,
      trim: true,
      select: false,
    },
    pendingEmailOtp: {
      type: String,
      select: false,
    },
    pendingEmailOtpExpiresAt: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

// Hash the password whenever it is set or changed, so a plain-text password
// can never reach the database — not from signup, not from a reset.
userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Belt and braces: even if a document is serialised directly, strip secrets.
userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.otp;
    delete ret.otpExpiresAt;
    delete ret.otpPurpose;
    delete ret.resetToken;
    delete ret.resetTokenExpiresAt;
    delete ret.pendingEmailOtp;
    delete ret.pendingEmailOtpExpiresAt;
    delete ret.__v;
    return ret;
  },
});

const User = mongoose.model("User", userSchema);

export default User;
