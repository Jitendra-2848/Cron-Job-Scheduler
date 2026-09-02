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
    const { name, url, method, cron_expression, payload, retries, status } = req.body;
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
                 retries = COALESCE($6, retries),
                 status = COALESCE($7, status)
             WHERE id = $8 RETURNING *`,
            [name, url, method, cron_expression, payload, retries, status, id]
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

export async function get_executions(req: Request, res: Response) {
    try {
        const userId = (req as any).user?.userId || 1;
        const data = await pool.query(
            `SELECT e.id, e.job_id, e.status, e.response_code, e.response_body, e.response_time_ms, e.error_message, e.attempt_number, e.created_at,
                    j.name AS job_name, j.url, j.method, j.cron_expression, j.payload
             FROM executions e
             JOIN jobs j ON e.job_id = j.id
             WHERE j.user_id = $1
             ORDER BY e.created_at DESC
             LIMIT 100`,
            [userId]
        );
        return res.status(200).json({ message: "success", data: data.rows });
    } catch (error: any) {
        return res.status(500).json({ message: "Failed to fetch executions", error: error.message });
    }
}

export async function trigger_job_run(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;
    const userId = (req as any).user?.userId || 1;

    try {
        const jobResult = await pool.query(
            `SELECT * FROM jobs WHERE id = $1 AND user_id = $2`,
            [id, userId]
        );

        if (jobResult.rows.length === 0) {
            return res.status(404).json({ message: "Job not found" });
        }

        const job = jobResult.rows[0];
        const method = job.method || "GET";
        const url = job.url;
        let body: string | undefined;

        if (job.payload !== undefined && job.payload !== null) {
            body = typeof job.payload === "string" ? job.payload : JSON.stringify(job.payload);
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
            }
        } catch (fetchErr: any) {
            status = "failed";
            errorMessage = fetchErr.message || "Failed to reach target URL";
        }

        const duration = Date.now() - startTime;

        const execInsert = await pool.query(
            `INSERT INTO executions (job_id, status, response_code, response_body, response_time_ms, error_message, attempt_number)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [job.id, status, responseCode, responseBody, duration, errorMessage, 1]
        );

        return res.status(200).json({
            message: status === "success" ? "Job executed successfully" : `Job executed with status ${responseCode || 'error'}`,
            data: {
                ...execInsert.rows[0],
                job_name: job.name,
                url: job.url,
                method: job.method,
            }
        });
    } catch (error: any) {
        return res.status(500).json({ message: "Failed to execute job", error: error.message });
    }
}
