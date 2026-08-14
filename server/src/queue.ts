import { config } from "dotenv";

config({ path: "../.env" });

import { Queue, QueueEvents, Worker } from "bullmq";
import IORedis from "ioredis";

const redis_url = process.env.REDIS_URI;

if (!redis_url) {
    throw new Error("REDIS_URI is not defined");
}

const connection = new IORedis(redis_url, {
    maxRetriesPerRequest: null,
});

connection.on("connect", () => {
    console.log("Redis connected!");
});

connection.on("error", (err) => {
    console.error("Redis error:", err.message);
});

export const queue = new Queue("myQueue", {
    connection,
});

await queue.add("myQueue", {
    name: "running",
});

await queue.add("myQueue", {
    name: "running fast!",
});

await queue.add("myQueue", {
    name: "running fastly!",
});

const worker = new Worker(
    "myQueue",
    async (job) => {
        console.log("Processing:", job.data.name);
    },
    {
        connection,
    }
);

const queueEvents = new QueueEvents("myQueue", {
    connection, // <-- THIS WAS MISSING
});

queueEvents.on("completed", ({ jobId }) => {
    console.log(`Job ${jobId} completed`);
});

queueEvents.on("failed", ({ jobId, failedReason }) => {
    console.log(`Job ${jobId} failed: ${failedReason}`);
});

queue.on("error", (err) => {
    console.log("Queue error:", err.message);
});