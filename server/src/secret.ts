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

const queue = new Queue("myQueue", {
    connection,
});

await queue.add("myQueue", {
    name: "running at super light speed! : 1",
});

await queue.add("myQueue", {
    name: "running at super light speed! : 2",
});

await queue.add("myQueue", {
    name: "running at super light speed! : 3",
});

await queue.add("myQueue", {
    name: "running at super light speed! : 4",
});