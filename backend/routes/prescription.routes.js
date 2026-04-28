import express from "express";
import { getByDoctor } from "../controllers/prescription.controller.js";

const router = express.Router();

// Xem đơn thuốc do một bác sĩ kê (theo khoảng thời gian)
router.get("/doctor/:doctorId", getByDoctor);

export default router;

