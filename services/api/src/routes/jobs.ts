import express from "express";
import { create_job, delete_job, get_metrics, job, jobs, update_job, get_executions, trigger_job_run } from "../controller/job_controller/job.js";
import { authenticateToken } from "../middlewares/TokenValidation.js";

const router = express.Router();

router.get("/metrics", get_metrics);
router.get("/jobs", authenticateToken, jobs);
router.post("/job", authenticateToken, create_job);
router.get("/job/:id", authenticateToken, job);
router.put("/job/:id", authenticateToken, update_job);
router.delete("/job/:id", authenticateToken, delete_job);
router.post("/job/:id/run", authenticateToken, trigger_job_run);
router.get("/executions", authenticateToken, get_executions);

export default router; 
