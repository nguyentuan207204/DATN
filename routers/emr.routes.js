import express from "express";
import * as controller from "../controllers/emr.controller.js";

const router = express.Router();

// Tạo hồ sơ bệnh án
router.post("/", controller.createRecord);

// Thêm chẩn đoán
router.post("/:recordId/diagnosis", controller.addDiagnosis);

// Kê đơn thuốc
router.post("/:recordId/prescription", controller.createPrescription);

// Lấy chi tiết hồ sơ
router.get("/:recordId", controller.getDetail);

export default router;
