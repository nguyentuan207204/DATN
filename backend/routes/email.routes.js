import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  sendOtpEmail,
  sendAppointmentConfirmationEmail,
  sendPasswordResetEmail,
  sendInvoiceEmail,
} from "../services/email.service.js";

const router = express.Router();

/**
 * POST /api/email/test-otp
 * Test OTP email (DEV only)
 */
router.post("/test-otp", async (req, res, next) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({ success: false, message: "Không khả dụng trên production" });
  }
  try {
    const { email, name } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Thiếu email" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await sendOtpEmail(email, otp, name || "Người dùng");

    res.json({ success: true, message: `Email OTP đã gửi đến ${email}`, otp });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/email/test-appointment
 * Test appointment confirmation email (DEV only)
 */
router.post("/test-appointment", async (req, res, next) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({ success: false, message: "Không khả dụng trên production" });
  }
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Thiếu email" });

    await sendAppointmentConfirmationEmail(email, {
      patientName: "Nguyễn Văn A",
      doctorName: "Trần Thị B",
      serviceName: "Khám nội tổng quát",
      date: new Date(Date.now() + 86400000).toISOString(), // ngày mai
      notes: "Nhịn ăn 4 giờ trước khi khám",
    });

    res.json({ success: true, message: `Email xác nhận lịch hẹn đã gửi đến ${email}` });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/email/test-invoice
 * Test invoice email (DEV only)
 */
router.post("/test-invoice", async (req, res, next) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({ success: false, message: "Không khả dụng trên production" });
  }
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Thiếu email" });

    await sendInvoiceEmail(email, {
      patientName: "Nguyễn Văn A",
      invoiceId: "TEST-001",
      totalAmount: 350000,
      paidAt: new Date().toISOString(),
      items: [
        { serviceName: "Khám nội tổng quát", quantity: 1, price: 150000 },
        { serviceName: "Xét nghiệm máu", quantity: 1, price: 200000 },
      ],
    });

    res.json({ success: true, message: `Email hóa đơn đã gửi đến ${email}` });
  } catch (error) {
    next(error);
  }
});

export default router;
