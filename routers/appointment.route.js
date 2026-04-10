import express from "express";
import { registerAppointment } from "../controllers/appointment.controller.js";

const router = express.Router();

// Endpoint đăng ký khám bệnh online
router.post("/register", registerAppointment);

export default router;
