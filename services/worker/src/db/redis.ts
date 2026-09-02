import "../config/env.js";
import { Redis } from "ioredis";

const redisUrl = process.env.REDIS_URL || process.env.REDIS_URI;

if (!redisUrl) {
    console.warn("Warning: REDIS_URL or REDIS_URI is not defined, defaulting to redis://localhost:6379");
}

export const redis = new Redis(redisUrl || "redis://localhost:6379", {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy: (times) => {
        const delay = Math.min(times * 500, 3000);
        return delay;
    },
});

redis.on("connect", () => {
    console.log("Worker Redis connected successfully");
});

redis.on("error", (error) => {
    console.error("Worker Redis connection warning:", error.message);
});
