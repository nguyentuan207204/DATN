import express from "express";
import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware.js";
import * as controller from "../controllers/billing.controller.js";

const router = express.Router();

// 1. Tính viện phí tự động theo dịch vụ (tạo hóa đơn)
router.post(
  "/invoices/auto",
  authenticate,
  authorize(["ADMIN"]),
  controller.createInvoiceAuto
);

// 2. Lấy chi tiết hóa đơn
router.get("/invoices/:id", controller.getInvoice);

// 3. Danh sách hóa đơn + filter
router.get("/invoices", controller.listInvoices);

// 3.1 Thống kê admin
router.get("/admin-stats", controller.getBillingAdminStats);

// 4. Thanh toán hóa đơn (thu tiền bệnh nhân)
router.post(
  "/invoices/:id/payments",
  authenticate,
  authorize(["ADMIN"]),
  controller.payInvoice
);

// 5. Quản lý BHYT – xem trước số tiền BHYT / BN trả
router.post(
  "/invoices/:id/insurance/preview",
  authenticate,
  authorize(["ADMIN"]),
  controller.previewInsurance
);

// 6. Thanh toán BHYT + phần đồng chi trả
router.post(
  "/invoices/:id/insurance/pay",
  authenticate,
  authorize(["ADMIN"]),
  controller.payByInsurance
);

// 7. Báo cáo tài chính: doanh thu theo ngày + phương thức
router.get("/reports/revenue", controller.revenueReport);

export default router;

