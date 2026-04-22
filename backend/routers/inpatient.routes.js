import express from "express";
import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware.js";
import * as controller from "../controllers/inpatient.controller.js";

const router = express.Router();

// Nhập viện
router.post(
  "/admissions",
  authenticate,
  authorize(["BACSI", "YTA", "ADMIN"]),
  controller.admit
);

// Ra viện
router.patch(
  "/admissions/:id/discharge",
  authenticate,
  authorize(["BACSI", "YTA", "ADMIN"]),
  controller.discharge
);

// Danh sách bệnh nhân đang điều trị nội trú
router.get("/admissions/active", controller.getActive);

// Danh sách tất cả hồ sơ nội trú
router.get("/admissions", controller.getAll);

// Tiến trình điều trị nội trú (theo hồ sơ nội trú)
router.get("/admissions/:id/progress", controller.getProgress);

// Lịch sử nội trú theo bệnh nhân
router.get("/patients/:patientId/admissions", controller.getByPatient);

export default router;

