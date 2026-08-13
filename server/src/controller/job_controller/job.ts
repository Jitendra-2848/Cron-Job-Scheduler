import express, { type Request, type Response } from "express";
import type { createJobRequest, individual_job, individual_job, jobs_Body, jobs_Response } from "./Interfaces/job.js";
import { pool } from "../../db/pool.js";


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

export async function job(req: Request<{}, {}>, res: Response<jobs_Response>) {
    try {
        const { id } = req.params;
        const data = await pool.query(`SELECT * FROM jobs WHERE id = $1`, [id]);
        if (data.rowCount == 0) {
            return res.status(200).json({ message: "job not found" });
        }
        return res.status(200).json({ message: "success", data: data.rows[0] });
    } catch (error: any) {
        console.log(error.message)
        return res.status(500).json({ message: `internal server error`, error: error })
    }
}