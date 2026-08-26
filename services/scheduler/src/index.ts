import "./config/env.js";
import cron from "node-cron";
import { _init_db, pool } from "./db/pool.js";
import { redis } from "./db/redis.js";
import { Queue } from "bullmq";
import { CronExpressionParser } from "cron-parser";

const queue = new Queue("cronmaster-jobs", {
    connection: redis,
});

let client:any;
(async function init() {
    client = await pool.connect()
    await _init_db();
    console.log("Scheduler service initialized.");
})();

cron.schedule("* * * * *", async () => {
    // console.log(`[${new Date().toISOString()}] Cron tick execution started.`);
    
    try {
        if(!client){
            console.log("database error");
        }
        const lockResult = await client.query("SELECT pg_try_advisory_lock(1) as has_lock");
        const hasLock = lockResult.rows[0]?.has_lock;
        
        if (!hasLock) {
            console.log(`[${new Date().toISOString()}] Advisory lock is already held by another instance. Skipping tick.`);
            return;
        }
        
        // console.log(`[${new Date().toISOString()}] Advisory lock acquired. Querying due jobs...`);
        
        // Query active and due jobs
        const dueJobsResult = await client.query(
            `SELECT * FROM jobs WHERE status = 'active' AND next_run_at <= NOW()`
        );
        
        const dueJobs = dueJobsResult.rows;
        console.log(`Found ${dueJobs.length} due jobs.`);
        
        for (const job of dueJobs) {
            console.log(`Scheduling Job ID: ${job.id} (${job.name})`);
            
            // Push job ID to BullMQ
            await queue.add(
                "execute-job",
                { jobId: job.id },
                {
                    attempts: (job.retries ?? 3) + 1,
                    backoff: {
                        type: "exponential",
                        delay: 2000,
                    },
                    // Unique job ID to prevent duplicate processing of the same scheduling tick
                    jobId: `job-${job.id}-${Date.now()}`
                }
            );
            
            // Recalculate next execution time
            let nextRunAt: Date;
            try {
                nextRunAt = CronExpressionParser.parse(job.cron_expression, {
                    currentDate: new Date(),
                    tz: "Asia/Kolkata"
                }).next().toDate();
                
                await client.query("UPDATE jobs SET next_run_at = $1 WHERE id = $2", [nextRunAt, job.id]);
                console.log(`Updated next_run_at for job ${job.id} to ${nextRunAt.toISOString()}`);
            } catch (err: any) {
                console.error(`❌ Failed to parse cron expression or update next run time for job ${job.id}:`, err.message);
            }
        }
        
        // Release advisory lock
        await client.query("SELECT pg_advisory_unlock(1)");
        // console.log(`[${new Date().toISOString()}] Advisory lock released.`);
        
    } catch (error: any) {
        console.log(error);
        console.error("❌ Error in scheduler tick execution:", error.message);
    } finally {
        if (client) {
            client.release();
        }
    }
});
