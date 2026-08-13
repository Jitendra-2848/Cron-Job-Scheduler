import Redis from "ioredis";

const redisUrl = process.env.REDIS_URI;

if (!redisUrl) {
    throw new Error("REDIS_URI is not defined");
}
export const redis = new Redis(redisUrl);

redis.on("connect", () => {
    console.log("Redis connected successfully");
});

redis.on("error", (error) => {
    console.error("Redis connection error:", error);
});
