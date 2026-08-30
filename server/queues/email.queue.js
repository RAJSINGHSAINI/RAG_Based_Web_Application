import { Queue } from "bullmq";
import Redis from "ioredis";

// ioredis connection used by BullMQ
const redisConnection = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379", {
  maxRetriesPerRequest: null,
});

export const emailQueue = new Queue("emailQueue", { connection: redisConnection });


//  Helper to push email jobs to the queue

export const addEmailToQueue = async (toEmail, otp, type) => {
  await emailQueue.add(
    "sendOtpEmail",
    { toEmail, otp, type },
    {
      attempts: 3, // Retry up to 3 times if SMTP fails
      backoff: { type: "exponential", delay: 1000 }, // Wait 1s, 2s, 4s...
      removeOnComplete: true, // Auto-clean Redis memory
    }
  );
};