import nodemailer from "nodemailer";

/**
 * Brevo SMTP transport.
 *
 * Credentials come from server/.env only — they are never sent to the client.
 * The transporter is created once and reused, and is created lazily so the
 * server can still boot (and report a clear error) when mail is misconfigured.
 */
let transporter = null;

const requiredVars = [
  "BREVO_SMTP_HOST",
  "BREVO_SMTP_PORT",
  "BREVO_SMTP_USER",
  "BREVO_SMTP_PASSWORD",
  "MAIL_FROM",
];

const getTransporter = () => {
  const missing = requiredVars.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    // Names only — never the values.
    const error = new Error(
      `Email is not configured on the server. Missing: ${missing.join(", ")}`
    );
    error.statusCode = 500;
    error.isConfigError = true;
    throw error;
  }

  if (!transporter) {
    const port = Number(process.env.BREVO_SMTP_PORT);

    transporter = nodemailer.createTransport({
      host: process.env.BREVO_SMTP_HOST,
      port,
      secure: port === 465, // Brevo uses STARTTLS on 587, implicit TLS on 465
      auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_PASSWORD,
      },
    });
  }

  return transporter;
};

/** Low-level send. Everything below builds on this. */
export const sendMail = async ({ to, subject, html, text }) => {
  const mailer = getTransporter();

  try {
    await mailer.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject,
      text,
      html,
    });
  } catch (err) {
    console.error("Email send failed:", err.message);
    const error = new Error(
      "We could not send the email right now. Please try again in a moment."
    );
    error.statusCode = 502;
    throw error;
  }
};

/** Shared OTP email markup, so all three flows look the same. */
const otpEmailTemplate = ({ heading, message, otp, minutes }) => `
  <div style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1f2933;">
    <h2 style="margin: 0 0 12px; font-size: 20px;">${heading}</h2>
    <p style="margin: 0 0 20px; line-height: 1.5; color: #52606d;">${message}</p>
    <p style="font-size: 30px; letter-spacing: 8px; font-weight: 700; margin: 0 0 20px;">${otp}</p>
    <p style="margin: 0; font-size: 14px; color: #7b8794;">
      This code expires in ${minutes} minutes. If you did not request it, you can ignore this email.
    </p>
  </div>
`;

/**
 * One OTP sender reused by the three flows below, which is why the same
 * generateOTP utility and the same email transport serve all of them.
 */
const sendOtpEmail = async ({ to, subject, heading, message, otp, minutes }) => {
  await sendMail({
    to,
    subject,
    text: `${heading}\n\n${message}\n\nCode: ${otp}\nExpires in ${minutes} minutes.`,
    html: otpEmailTemplate({ heading, message, otp, minutes }),
  });
};

export const sendVerificationOtp = ({ to, fullName, otp, minutes }) =>
  sendOtpEmail({
    to,
    subject: "Verify your email address",
    heading: `Welcome, ${fullName}`,
    message: "Enter this code in the app to verify your email address.",
    otp,
    minutes,
  });

export const sendForgotPasswordOtp = ({ to, otp, minutes }) =>
  sendOtpEmail({
    to,
    subject: "Reset your password",
    heading: "Password reset code",
    message: "Enter this code in the app to continue resetting your password.",
    otp,
    minutes,
  });

export const sendChangeEmailOtp = ({ to, otp, minutes }) =>
  sendOtpEmail({
    to,
    subject: "Confirm your new email address",
    heading: "Confirm your new email",
    message:
      "Enter this code in the app to finish moving your account to this address.",
    otp,
    minutes,
  });
