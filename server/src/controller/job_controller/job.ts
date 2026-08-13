import express, { type Request, type Response } from "express";
import type { createJobRequest, individual_job, jobs_Body, jobs_Response } from "./Interfaces/job.js";
import { pool } from "../../db/pool.js";


export async function jobs(req: Request<{}, {}, jobs_Body>, res: Response<jobs_Response>) {
    try {
        await pool.query("select * from jobs where ")
        return res.status(200).json({ message: "success" })
    } catch (error: any) {
        console.log(error.message)
        return res.status(500).json({ message: `internal server error`, error: error })
    }
}
export async function create_job(req: Request<{}, {}, createJobRequest>, res: Response<jobs_Response>) {
    try {
        return res.status(200).json({ message: "success" })

    } catch (error: any) {
        console.log(error.message)
        return res.status(500).json({ message: `internal server error`, error: error })
    }
}
export async function individual_job(req: Request<{}, {}, individual_job>, res: Response<jobs_Response>) {
    try {
        return res.status(200).json({ message: "success" })
    } catch (error: any) {
        console.log(error.message)
        return res.status(500).json({ message: `internal server error`, error: error })
    }
}