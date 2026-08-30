import express, { type Request, type Response } from "express";
import type { createJobRequest, individual_job, jobs_Body, jobs_Response } from "./Interfaces/job.js";
import { pool } from "../../db/pool.js";
import { redis } from "../../db/redis.js";
import { Queue } from "bullmq";

const queue = new Queue("cronmaster-jobs", {
    connection: redis,
});

export async function jobs(req: Request<{}, {}, jobs_Body>, res: Response<jobs_Response>) {
    try {
        // const {} = req.body;
        const data = await pool.query(`SELECT * FROM jobs WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10`, [req.user]);
        return res.status(200).json({ message: "success", data: data.rows })
    } catch (error: any) {
        console.log(error.message)
        return res.status(500).json({ message: `internal server error`, error: error })
    }
}
export async function create_job(req: Request<{}, {}, createJobRequest>, res: Response<jobs_Response>) {
    try {
        const { name, url, method, cron_expression, payload, retries } = req.body;
        if (!name || !url || !cron_expression) {
            return res.status(400).json({ message: "All field are required !" });
        }
        if (!req.user) {
            return res.status(404).json({ message: "Unauthorized user" });
        }
        const data = await pool.query(`INSERT INTO jobs (user_id,name,url,method,cron_expression,payload,retries)  
            VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [req.user, name, url, method ?? "GET", cron_expression, payload ?? {}, retries ?? 3,]);

        return res.status(200).json({ message: "success" })
    } catch (error: any) {
        console.log(error)
        return res.status(500).json({ message: `internal server error`, error: error })
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
