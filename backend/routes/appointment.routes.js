import express from "express";
import { registerAppointment, listAllAppointments, updateStatus } from "../controllers/appointment.controller.js";
import upload from "../middleware/upload.middleware.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// 1. Client: Đăng ký khám bệnh online (hỗ trợ upload nhiều ảnh)
router.post("/register", authenticate, upload.array("images", 5), registerAppointment);

// 2. Admin: Lấy toàn bộ danh sách lịch hẹn (phân trang)
router.get("/admin/all", listAllAppointments);

// 3. Admin: Cập nhật trạng thái lịch hẹn
router.put("/admin/:id/status", updateStatus);

export default router;
