import { Redis } from "ioredis";

const redisUrl = process.env.REDIS_URL || process.env.REDIS_URI;

if (!redisUrl) {
    throw new Error("REDIS_URL or REDIS_URI is not defined");
}
export const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
});

redis.on("connect", () => {
    console.log("Redis connected successfully");
});

redis.on("error", (error) => {
    console.error("Redis connection error:", error);
    process.exit(1);
});
