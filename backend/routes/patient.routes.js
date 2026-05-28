import express from "express";
import {
  getAllPatients,
  getPatient,
  getHistory,
  getVisitHistory,
  getPrescriptionHistory,
  getTreatmentSummary,
  getFollowUps,
  getMedicationSchedule,
  createPatient,
  updatePatient,
  deletePatient,
} from "../controllers/patient.controller.js";

const router = express.Router();

router.get("/", getAllPatients);

// Thêm bệnh nhân mới
router.post("/", createPatient);

// Lấy chi tiết bệnh nhân
router.get("/:patientId", getPatient);

// Cập nhật thông tin bệnh nhân
router.put("/:patientId", updatePatient);

// Xóa bệnh nhân
router.delete("/:patientId", deletePatient);
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


