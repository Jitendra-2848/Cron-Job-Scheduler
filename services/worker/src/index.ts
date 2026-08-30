import "./config/env.js";
import { Worker } from "bullmq";
import { _init_db, pool } from "./db/pool.js";
import { redis } from "./db/redis.js";

(async function init() {
    await _init_db();
})();

const worker = new Worker<{ jobId: number }>(
    "cronmaster-jobs",
    async (bullJob) => {
        const { jobId } = bullJob.data;
        console.log(`[Attempt ${bullJob.attemptsMade + 1}] Processing job ID: ${jobId}`);

        const jobResult = await pool.query("SELECT * FROM jobs WHERE id = $1", [jobId]);
        if (jobResult.rowCount === 0) {
            console.error(`Job with ID ${jobId} not found in database.`);
            return; 
        }

        const dbJob = jobResult.rows[0];
        const { method, url, payload } = dbJob;

        let body: string | undefined;
        if (payload !== undefined && payload !== null) {
            body = typeof payload === "string" ? payload : JSON.stringify(payload);
        }

        const startTime = Date.now();
        let responseCode: number | null = null;
        let responseBody: string | null = null;
        let errorMessage: string | null = null;
        let status: "success" | "failed" = "success";

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: method === "GET" || method === "DELETE" ? null : body ?? null,
            });

            responseCode = response.status;
            const contentType = response.headers.get("content-type");
            
            if (contentType?.includes("application/json")) {
                const json = await response.json();
                responseBody = JSON.stringify(json);
            } else {
                responseBody = await response.text();
            }

            if (!response.ok) {
                status = "failed";
                errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                throw new Error(errorMessage);
            }

            const duration = Date.now() - startTime;
            console.log(`-> Success in ${duration}ms (Status: ${responseCode})`);
            
            await pool.query(
                `INSERT INTO executions (job_id, status, response_code, response_body, response_time_ms, error_message, attempt_number)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [dbJob.id, status, responseCode, responseBody, duration, errorMessage, bullJob.attemptsMade + 1]
            );

            return responseBody;

        } catch (error: any) {
            status = "failed";
            errorMessage = error.message || "Unknown error";
            const duration = Date.now() - startTime;

            console.error(`-> Failed in ${duration}ms (${errorMessage})`);

            await pool.query(
                `INSERT INTO executions (job_id, status, response_code, response_body, response_time_ms, error_message, attempt_number)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [dbJob.id, status, responseCode, responseBody, duration, errorMessage, bullJob.attemptsMade + 1]
            );
            
            throw error; 
        }
    },
    {
        connection: redis,
        concurrency: 5,
    }
);

worker.on("completed", (job) => {
    console.log(`✅ Job ${job.id} completed`);
});

worker.on("failed", (job, error) => {
    console.log(`❌ Job ${job?.id} failed: ${error.message}`);
});

worker.on("error", (error) => {
    console.error("Worker error:", error.message);
});