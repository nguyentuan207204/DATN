import express from "express";
import * as controller from "../controllers/medical.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// Tất cả các route trong này đều yêu cầu đăng nhập
router.use(authenticate);

// 1. Lịch hẹn
router.get("/appointments", controller.getMyAppointments);
router.post("/appointments/register", controller.registerAppointment);
router.put("/appointments/:id/cancel", controller.cancelAppointment);

// 2. Hồ sơ bệnh án & Lịch sử
router.get("/history", controller.getMyHistory);
router.get("/record/:id", controller.getRecordDetail);

// 3. Thanh toán
router.post("/invoices/:id/pay", controller.payInvoice);

export default router;
