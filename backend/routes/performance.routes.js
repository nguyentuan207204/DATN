import express from "express";
import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware.js";
import { getStaffStats } from "../controllers/performance.controller.js";

const router = express.Router();

// Theo dõi hiệu suất làm việc của nhân viên
router.get("/staff", getStaffStats);

export default router;

