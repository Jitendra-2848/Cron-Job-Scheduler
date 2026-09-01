import express from "express";
import { create_job, delete_job, get_metrics, job, jobs, update_job } from "../controller/job_controller/job.js";
import { Authentication } from "../middleware/jwt.js";

const router = express.Router();

router.get("/metrics", get_metrics);
router.get("/jobs", Authentication, jobs);
router.post("/job", Authentication, create_job);
router.get("/job/:id", Authentication, job);
router.put("/job/:id", Authentication, update_job);
router.delete("/job/:id", Authentication, delete_job);

export default router; 
