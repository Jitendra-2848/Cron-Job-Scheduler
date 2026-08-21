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


export interface HttpJob {
    name: string;
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    url: string;
    payload?: unknown;
}

export const queue = new Queue<HttpJob>("HTTP", {
    connection,
});

const worker = new Worker<HttpJob>(
    "HTTP",

    async (job) => {
        const {
            name,
            method,
            url,
            payload,
        } = job.data;

        console.log("\n==============================");
        console.log(`Job ID : ${job.id}`);
        console.log(`Name   : ${name}`);
        console.log(`Method : ${method}`);
        console.log(`URL    : ${url}`);
        console.log("==============================");

        let body: string | undefined;

        if (payload !== undefined && payload !== null) {
            body =
                typeof payload === "string"
                    ? payload
                    : JSON.stringify(payload);
        }

        try {

            const response = await fetch(url, {
                method,

                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body:
                    method === "GET" || method === "DELETE"
                        ? null
                        : body ?? null,
            });

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}: ${response.statusText}`
                );
            }
            const contentType =
                response.headers.get("content-type");

            let result: unknown;

            if (contentType?.includes("application/json")) {
                result = await response.json();
            } else {
                result = await response.text();
            }

            console.log("\nResponse:");
            console.table(result);

            return result;

        } catch (error) {

            if (error instanceof Error) {
                console.error(
                    `Job ${job.id} failed:`,
                    error.message
                );
            } else {
                console.error(
                    `Job ${job.id} failed:`,
                    error
                );
            }
            throw error;
        }
    },

    {
        connection,
        concurrency: 5,
    }
);
worker.on("completed", (job) => {
    console.log(`✅ Job ${job.id} completed`);
});

worker.on("failed", (job, error) => {
    console.log(
        `❌ Job ${job?.id} failed: ${error.message}`
    );
});

worker.on("error", (error) => {
    console.error("Worker error:", error.message);
});

const queueEvents = new QueueEvents("HTTP", {
    connection,
});

queueEvents.on("completed", ({ jobId }) => {
    console.log(`Queue event: ${jobId} completed`);
});

queueEvents.on("failed", ({ jobId, failedReason }) => {
    console.log(
        `Queue event: ${jobId} failed: ${failedReason}`
    );
});

console.log("HTTP worker started...");