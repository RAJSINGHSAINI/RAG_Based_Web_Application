import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error("REDIS_URL is missing in environment variables");
}

const redisClient = createClient({
  url: redisUrl,
  socket: {
    // Required for rediss:// secure connections on cloud providers like Upstash
    tls: redisUrl.startsWith("rediss://") ? true : undefined,
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        return new Error("Max Redis reconnection attempts reached");
      }
      return Math.min(retries * 100, 3000);
    },
  },
});

redisClient.on("error", (err) => console.error("Redis connection error:", err));
redisClient.on("connect", () => console.log("Connected to Upstash Redis successfully"));

try {
  await redisClient.connect();
} catch (error) {
  console.error("Failed to connect to Upstash Redis:", error);
}

export default redisClient;