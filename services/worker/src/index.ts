import "./config/env.js";
import { Worker } from "bullmq";
import { _init_db, pool } from "./db/pool.js";
import { redis } from "./db/redis.js";

(async function init() {
    await _init_db();
})();

interface JobPayload {
    jobId: number;
    name?: string;
    url: string;
    method?: string;
    payload?: any;
}

interface ExecutionRecord {
    job_id: number;
    status: "success" | "failed";
    response_code: number | null;
    response_body: string | null;
    response_time_ms: number;
    error_message: string | null;
    attempt_number: number;
}

// In-Memory Execution Log Buffer to prevent PostgreSQL Write Bottlenecks
const executionBuffer: ExecutionRecord[] = [];
const BATCH_SIZE = 2;
const FLUSH_INTERVAL_MS = 2000;

function logStructured(level: "info" | "warn" | "error", event: string, data: Record<string, any>) {
    const logPayload = {
        timestamp: new Date().toISOString(),
        level,
        service: "cronmaster-worker",
        event,
        ...data,
    };
    if (level === "error") {
        console.error(JSON.stringify(logPayload));
    } else {
        console.log(JSON.stringify(logPayload));
    }
}

async function flushExecutionBuffer() {
    if (executionBuffer.length === 0) return;

    // Atomically drain buffer
    const recordsToFlush = executionBuffer.splice(0, executionBuffer.length);

    try {
        const valuePlaceholders: string[] = [];
        const queryParams: any[] = [];
        let paramIndex = 1;

        for (const record of recordsToFlush) {
            valuePlaceholders.push(
                `($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`
            );
            queryParams.push(
                record.job_id,
                record.status,
                record.response_code,
                record.response_body,
                record.response_time_ms,
                record.error_message,
                record.attempt_number
            );
        }

        const queryText = `
            INSERT INTO executions (job_id, status, response_code, response_body, response_time_ms, error_message, attempt_number)
            VALUES ${valuePlaceholders.join(", ")}
        `;

        await pool.query(queryText, queryParams);
        logStructured("info", "db_bulk_insert_success", { count: recordsToFlush.length });
    } catch (dbError: any) {
        logStructured("error", "db_bulk_insert_failed", { error: dbError.message });
    }
}

// Timer to flush execution logs every 30 seconds
const flushInterval = setInterval(() => {
    flushExecutionBuffer().catch((err) => logStructured("error", "flush_timer_error", { error: err.message }));
}, FLUSH_INTERVAL_MS);

function queueExecutionLog(record: ExecutionRecord) {
    executionBuffer.push(record);
    if (executionBuffer.length >= BATCH_SIZE) {
        flushExecutionBuffer().catch((err) => logStructured("error", "flush_size_trigger_error", { error: err.message }));
    }
}

const worker = new Worker<JobPayload>(
    "cronmaster-jobs",
    async (bullJob) => {
        const { jobId, name, url, method = "GET", payload } = bullJob.data;
        const attempt = bullJob.attemptsMade + 1;

        logStructured("info", "job_execution_started", {
            job: { id: jobId, name, bull_job_id: bullJob.id, attempt },
            request: { url, method },
        });

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
                signal: AbortSignal.timeout(10000)
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

            logStructured("info", "job_execution_completed", {
                job: { id: jobId, name, bull_job_id: bullJob.id, attempt },
                request: { url, method },
                response: { status_code: responseCode, duration_ms: duration },
            });

            // Queue log for bulk write
            queueExecutionLog({
                job_id: jobId,
                status: "success",
                response_code: responseCode,
                response_body: responseBody,
                response_time_ms: duration,
                error_message: null,
                attempt_number: attempt,
            });

            return responseBody;

        } catch (error: any) {
            status = "failed";
            errorMessage = error.message || "Unknown error";
            const duration = Date.now() - startTime;

            logStructured("error", "job_execution_failed", {
                job: { id: jobId, name, bull_job_id: bullJob.id, attempt },
                request: { url, method },
                response: { status_code: responseCode, duration_ms: duration },
                error: { message: errorMessage },
            });

            // Queue log for bulk write
            queueExecutionLog({
                job_id: jobId,
                status: "failed",
                response_code: responseCode,
                response_body: responseBody,
                response_time_ms: duration,
                error_message: errorMessage,
                attempt_number: attempt,
            });

            throw error; 
        }
    },
    {
        connection: redis,
        concurrency: 5,
    }
);

worker.on("completed", (job) => {
    logStructured("info", "queue_job_completed", { bull_job_id: job.id });
});

worker.on("failed", (job, error) => {
    logStructured("error", "queue_job_failed", { bull_job_id: job?.id, error: error.message });
});

worker.on("error", (error) => {
    logStructured("error", "worker_system_error", { error: error.message });
});

async function gracefulShutdown() {
    clearInterval(flushInterval);
    logStructured("info", "graceful_shutdown_started", {});
    await flushExecutionBuffer();
    process.exit(0);
}

process.on("unhandledRejection", (reason, promise) => {
    logStructured("error", "unhandled_rejection", { reason: String(reason) });
});

process.on("uncaughtException", (error) => {
    logStructured("error", "uncaught_exception", { error: error.message });
    gracefulShutdown();
});

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);