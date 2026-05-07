import express from "express";
import {
  getHistory,
  getVisitHistory,
  getPrescriptionHistory,
  getTreatmentSummary,
  getFollowUps,
  getMedicationSchedule,
} from "../controllers/patient.controller.js";

const router = express.Router();

// Timeline quá trình điều trị tổng quát
router.get(
  "/:patientId/history",
  getHistory
);

// Xem lịch sử khám bệnh (theo từng lần khám)
router.get(
  "/:patientId/visits",
  getVisitHistory
);

// Xem lịch sử đơn thuốc đã kê
router.get(
  "/:patientId/prescriptions",
  getPrescriptionHistory
);

// Theo dõi kết quả điều trị (tóm tắt theo hồ sơ)
router.get(
  "/:patientId/treatments",
  getTreatmentSummary
);

// Lịch tái khám (các lịch hẹn sắp tới)
router.get(
  "/:patientId/follow-ups",
  getFollowUps
);

// Lịch uống thuốc (dựa trên đơn thuốc và hướng dẫn dùng thuốc)
router.get(
  "/:patientId/medication-schedule",
  getMedicationSchedule
);

export default router;


