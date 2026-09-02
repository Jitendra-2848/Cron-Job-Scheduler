import express, { type Request, type Response } from "express";
import type { createJobRequest, individual_job, jobs_Body, jobs_Response } from "./Interfaces/job.js";
import { pool } from "../../db/pool.js";
import { redis } from "../../db/redis.js";
import { Queue } from "bullmq";
import { getNextRunAt } from "../../lib/Cron_next_run.ts";

const queue = new Queue("cronmaster-jobs", {
    connection: redis,
});

export async function jobs(req: Request<{}, {}, jobs_Body>, res: Response<jobs_Response>) {
    try {
        const userId = (req as any).user?.userId || (req as any).user || 1;
        const data = await pool.query(`SELECT * FROM jobs WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10`, [userId]);
        return res.status(200).json({ message: "success", data: data.rows })
    } catch (error: any) {
        console.log(error.message)
        return res.status(500).json({ message: `internal server error`, error: error })
    }
}
export async function create_job(req: Request<{}, {}, createJobRequest>, res: Response<jobs_Response>) {
    try {
        console.log(req.body);

        const {
            name,
            url,
            method,
            cron_expression,
            payload,
            retries
        } = req.body;

        if (!name || !url || !cron_expression) {
            return res.status(400).json({
                message: "All fields are required!"
            });
        }

        const userId = (req as any).user?.userId || 1;

        const next_run_at = getNextRunAt(cron_expression);

        const data = await pool.query(
            `INSERT INTO jobs
            (
                user_id,
                name,
                url,
                method,
                cron_expression,
                next_run_at,
                payload,
                retries
            )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
            [
                userId,
                name,
                url,
                method ?? "GET",
                cron_expression,
                next_run_at,
                payload ?? {},
                retries ?? 3
            ]
        );

        return res.status(201).json({
            message: "Cron job created successfully",
            data: data.rows[0]
        });

    } catch (error: any) {
        console.error(error);

        return res.status(500).json({
            message: "internal server error"
        });
    }

}

export async function job(req: Request<{ id: string }, {}>, res: Response<jobs_Response>) {
    try {
        const { id } = req.params;
        const cacheKey = `job:${id}`;
        const cachedJob = await redis.get(cacheKey);
        if (cachedJob) {
            return res.status(200).json({
                message: "success",
                data: JSON.parse(cachedJob),
                source: "cache",
            });
        }
        const data = await pool.query(
            `SELECT * FROM jobs WHERE id = $1`,
            [id]
        );
        if (data.rowCount === 0) {
            return res.status(404).json({
                message: "job not found",
            });
        }
        const job = data.rows[0];
        await redis.set(
            cacheKey,
            JSON.stringify(job),
            "EX",
            300
        );
        return res.status(200).json({
            message: "success",
            data: job,
        });
    } catch (error: any) {
        console.log(error.message)
        return res.status(500).json({ message: `internal server error`, error: error })
    }
}
export async function delete_job(req: Request, res: Response) {
    const id: string = String(req.params.id);
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        await client.query("DELETE FROM jobs WHERE id = $1", [id]);
        const jobs = await queue.getJobs(["waiting", "delayed", "active"]);
        for (const job of jobs) {
            if (job.data.jobId === parseInt(id)) {
                await job.remove();
            }
        }
        await client.query("COMMIT");
        return res.status(200).json({ message: "Job deleted and queue purged successfully." });
    } catch (error: any) {
        await client.query("ROLLBACK");
        return res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
}

export async function update_job(req: Request<{ id: string }, {}, Partial<createJobRequest>>, res: Response) {
    const id = req.params.id;
    const { name, url, method, cron_expression, payload, retries } = req.body;
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const data = await client.query(
            `UPDATE jobs 
             SET name = COALESCE($1, name),
                 url = COALESCE($2, url),
                 method = COALESCE($3, method),
                 cron_expression = COALESCE($4, cron_expression),
                 payload = COALESCE($5, payload),
                 retries = COALESCE($6, retries)
             WHERE id = $7 RETURNING *`,
            [name, url, method, cron_expression, payload, retries, id]
        );

        if (data.rowCount === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ message: "Job not found" });
        }

        const updatedJob = data.rows[0];

        // Invalidate GET cache
        await redis.del(`job:${id}`);

        // Sync pending BullMQ jobs in Redis memory
        const jobs = await queue.getJobs(["waiting", "delayed"]);
        for (const job of jobs) {
            if (job.data.jobId === parseInt(id)) {
                await job.updateData({
                    ...job.data,
                    name: updatedJob.name,
                    url: updatedJob.url,
                    method: updatedJob.method,
                    payload: updatedJob.payload,
                });
            }
        }

        await client.query("COMMIT");
        return res.status(200).json({ message: "Job updated and pending queue synced successfully.", data: updatedJob });
    } catch (error: any) {
        await client.query("ROLLBACK");
        return res.status(500).json({ message: "internal server error", error: error.message });
    } finally {
        client.release();
    }
}

export async function get_metrics(req: Request, res: Response) {
    try {
        const counts = await queue.getJobCounts("waiting", "active", "completed", "failed", "delayed");
        return res.status(200).json({
            status: "success",
            timestamp: new Date().toISOString(),
            metrics: {
                waiting_queue_depth: counts.waiting,
                active_concurrency_load: counts.active,
                failed_job_count: counts.failed,
                completed_job_count: counts.completed,
                delayed_job_count: counts.delayed,
            }
        });
    } catch (error: any) {
        return res.status(500).json({ message: "failed to fetch queue metrics", error: error.message });
    }
}
