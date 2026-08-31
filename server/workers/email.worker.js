import { Worker } from "bullmq";
import redisClient from "../config/redis.js";
import {
  sendVerificationOtp,
  sendForgotPasswordOtp,
  sendChangeEmailOtp,
} from "../config/mail.js"; // Imported directly from your mail.js file

const emailWorker = new Worker(
  "emailQueue",
  async (job) => {
    const { type, payload } = job.data;
    console.log(`[Worker] Processing email job '${type}' for ${payload.to}`);

    switch (type) {
      case "VERIFICATION_OTP":
        await sendVerificationOtp(payload); // Expects { to, fullName, otp, minutes }
        break;

      case "FORGOT_PASSWORD_OTP":
        await sendForgotPasswordOtp(payload); // Expects { to, otp, minutes }
        break;

      case "CHANGE_EMAIL_OTP":
        await sendChangeEmailOtp(payload); // Expects { to, otp, minutes }
        break;

      default:
        throw new Error(`Unknown email job type: ${type}`);
    }
  },
  {
    connection: redisClient,
    concurrency: 5, // Process 5 emails concurrently
  }
);

emailWorker.on("completed", (job) => {
  console.log(`[Worker] Email '${job.data.type}' sent to ${job.data.payload.to}`);
});

emailWorker.on("failed", (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed with error:`, err.message);
});

export default emailWorker;