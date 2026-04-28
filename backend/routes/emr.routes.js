import express from "express";
import * as controller from "../controllers/emr.controller.js";
import { auditLog } from "../middleware/audit.middleware.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// Tạo hồ sơ bệnh án
router.post("/", authenticate, auditLog('CREATE', 'MedicalRecord'), controller.createRecord);

// Thêm chẩn đoán
router.post("/:recordId/diagnosis", authenticate, auditLog('CREATE', 'Diagnosis'), controller.addDiagnosis);

// Kê đơn thuốc
router.post("/:recordId/prescription", authenticate, auditLog('CREATE', 'Prescription'), controller.createPrescription);

// Lấy chi tiết hồ sơ
router.get("/:recordId", controller.getDetail);

export default router;
