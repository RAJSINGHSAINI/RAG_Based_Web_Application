import Redis from "ioredis";
const redisUrl = process.env.REDIS_URL;

const redisClient = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

redisClient.on("error", (err) => console.error("Redis connection error:", err));
redisClient.on("connect", () => console.log("Connected to Upstash Redis successfully"));

try {
  await redisClient.connect();
} catch (error) {
  console.error("Failed to connect to Upstash Redis:", error);
}

export default redisClient;