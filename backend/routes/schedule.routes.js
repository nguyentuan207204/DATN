import express from "express";
import { getSchedules, createSchedule, deleteSchedule } from "../controllers/schedule.controller.js";

const router = express.Router();

router.get("/", getSchedules);
router.post("/", createSchedule);
router.delete("/:id", deleteSchedule);

export default router;
