import express from "express";
import { create_job, individual_job, jobs } from "../controller/job_controller/job.js";
import { Authentication } from "../middleware/jwt.js";

const router = express.Router();

router.get("/jobs",Authentication,jobs);
router.post("/job",Authentication,create_job);
router.get("/job/:id",Authentication,individual_job);


export default router;