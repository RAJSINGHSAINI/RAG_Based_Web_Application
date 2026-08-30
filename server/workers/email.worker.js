import { Worker } from "bullmq";
import Redis from "ioredis";
import { sendOtpEmail } from "../config/mail.js"; // Your Nodemailer helper

const redisConnection = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379", {
  maxRetriesPerRequest: null,
});

const emailWorker = new Worker(
  "emailQueue",
  async (job) => {
    const { toEmail, otp, type } = job.data;
    console.log(`[Worker] Processing email for ${toEmail}`);
    
    // Call Nodemailer here
    await sendOtpEmail(toEmail, otp, type);
  },
  { connection: redisConnection, concurrency: 5 } // Process 5 emails in parallel
);

emailWorker.on("completed", (job) => {
  console.log(`[Worker] Email successfully sent to ${job.data.toEmail}`);
});

emailWorker.on("failed", (job, err) => {
  console.error(`[Worker] Job ${job.id} failed with error:`, err.message);
});