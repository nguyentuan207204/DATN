import express from "express";
import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware.js";
import * as controller from "../controllers/outpatient.controller.js";

const router = express.Router();

// Tạo hồ sơ khám ngoại trú từ lịch hẹn
router.post(
  "/visits",
  authenticate,
  authorize(["BACSI", "YTA", "ADMIN"]),
  controller.createVisit
);

// Danh sách lần khám ngoại trú theo bệnh nhân
router.get("/patients/:patientId/visits", controller.getVisitsByPatient);

// Danh sách tất cả lần khám
router.get("/visits", controller.getAllVisits);

// Chi tiết một lần khám (hồ sơ bệnh án)
router.get("/visits/:recordId", controller.getVisitDetail);

export default router;

