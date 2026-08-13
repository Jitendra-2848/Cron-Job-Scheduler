import type { NextFunction, Request, Response } from "express"
import type { createJobRequest, jobs_Response } from "../controller/job_controller/Interfaces/job.js"

export async function Authentication(req: Request<{}, {}, createJobRequest>, res: Response<jobs_Response>, next: NextFunction) {
    try {
        next();
    } catch (error: any) {
        console.log(error.message)
        return res.status(500).json({ message: `internal server error`, error: error })
    }
}