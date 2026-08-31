import { Queue } from "bullmq";
import redisClient from "../config/redis.js";

export const emailQueue = new Queue("emailQueue", { connection: redisClient });

export const addEmailToQueue = async (type, payload) => {
  await emailQueue.add(
    "sendOtpEmail",
    { type, payload },
    {
      attempts: 3,
      backoff: { type: "exponential", delay: 1000 },
      removeOnComplete: true,
    }
  );
};