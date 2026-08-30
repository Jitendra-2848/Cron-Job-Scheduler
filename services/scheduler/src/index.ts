import "./config/env.js";
import cron from "node-cron";
import { _init_db, pool } from "./db/pool.js";
import { redis } from "./db/redis.js";
import { Queue } from "bullmq";
import { CronExpressionParser } from "cron-parser";

const queue = new Queue("cronmaster-jobs", {
    connection: redis,
});

const SCHEDULER_LOCK_ID = 1;
const BATCH_SIZE = 5;
const TIMEZONE = "Asia/Kolkata";

async function scheduleDueJobs() {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const lockResult = await client.query(
            "SELECT pg_try_advisory_xact_lock($1) AS has_lock",
            [SCHEDULER_LOCK_ID]
        );

        if (!lockResult.rows[0]?.has_lock) {
            await client.query("ROLLBACK");
            return;
        }

        const result = await client.query(
            `
            SELECT
                id,
                name,
                cron_expression,
                retries,
                next_run_at
            FROM jobs
            WHERE status = 'active'
              AND next_run_at <= NOW()
            ORDER BY next_run_at
            LIMIT $1
            `,
            [BATCH_SIZE]
        );

        const jobs = result.rows;

        if (jobs.length === 0) {
            await client.query("COMMIT");
            return;
        }
        const bullmqJobs = [];

        for (const job of jobs) {
            try {
                const nextRunAt = CronExpressionParser
                    .parse(job.cron_expression, {
                        currentDate: new Date(),
                        tz: TIMEZONE,
                    })
                    .next()
                    .toDate();

                await client.query(
                    `
                    UPDATE jobs
                    SET next_run_at = $1
                    WHERE id = $2
                    `,
                    [nextRunAt, job.id]
                );
                console.log(job.id);
                bullmqJobs.push({
                    name: job.name || "execute-job",
                    data: {
                        jobId: job.id,
                    },
                    opts: {
                        attempts: (job.retries ?? 3) + 1,
                        backoff: {
                            type: "exponential",
                            delay: 2000,
                        },

                        // Same scheduled occurrence = same BullMQ ID
                        jobId: `job-${job.id}-${job.next_run_at.getTime()}`,
                    }, removeOnComplete: {
                        age: 3600,
                        count: 1000
                    },
                    removeOnFail: {
                        age: 3600 * 24 * 3,
                        count: 10000
                    }
                });
            } catch (error: any) {
                console.error(
                    `Failed to schedule job ${job.id}:`,
                    error.message
                );
            }
        }


        if (bullmqJobs.length > 0) {
            await queue.addBulk(bullmqJobs);
        }
        await client.query("COMMIT");
        console.log(`Scheduled ${bullmqJobs.length} jobs.`);
    } catch (error) {
        try {
            await client.query("ROLLBACK");
        } catch {
            console.log("Rollback failed");
        }

        console.error("Scheduler tick failed:", error);
    } finally {
        client.release();
    }
}

(async function init() {
    await _init_db();

    console.log("Scheduler service initialized.");

    cron.schedule("* * * * *", async () => {
        await scheduleDueJobs();
    });
})();

process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
    process.exit(1);
});