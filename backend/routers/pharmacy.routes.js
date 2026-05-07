import express from "express";
import * as controller from "../controllers/pharmacy.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { auditLog } from "../middleware/audit.middleware.js";

const router = express.Router();

/* ===============================
   STOCK MANAGEMENT
================================ */

/**
 * Nhập thuốc
 */
router.post(
  "/stock/import",
  authenticate,
  authorize(["ADMIN", "DUOCSI"]),
  auditLog('CREATE', 'StockMovement'),
  controller.importMedicine
);

/**
 * Xuất thuốc
 */
router.post(
  "/stock/export",
  authenticate,
  authorize(["ADMIN", "DUOCSI"]),
  auditLog('CREATE', 'StockMovement'),
  controller.exportMedicine
);

/**
 * Xem lịch sử nhập xuất
 * ⚠️ Route cụ thể phải đặt TRƯỚC route động
 */
router.get("/stock/all-history", controller.getAllStockHistory);
router.get("/stock/:medicineId/history", controller.getStockHistory);

/**
 * Xem tồn kho
 */
router.get("/stock/:medicineId", controller.getStock);

/* ===============================
   MEDICINE MANAGEMENT
================================ */

/**
 * Danh sách thuốc
 */
router.get("/medicines", controller.getAllMedicines);
router.get("/medicines/critical-count", controller.getCriticalCount);

/**
 * Thêm mới thuốc
 */
router.post(
  "/medicines",
  authenticate,
  authorize(["ADMIN", "DUOCSI"]),
  auditLog('CREATE', 'Medicine'),
  controller.createMedicine
);

/**
 * Cập nhật thông tin thuốc
 */
router.put(
  "/medicines/:id",
  authenticate,
  authorize(["ADMIN", "DUOCSI"]),
  auditLog('UPDATE', 'Medicine'),
  controller.updateMedicine
);

/**
 * Xóa thuốc (Soft Delete)
 */
router.delete(
  "/medicines/:id",
  authenticate,
  authorize(["ADMIN", "DUOCSI"]),
  auditLog('DELETE', 'Medicine'),
  controller.deleteMedicine
);

/**
 * Khôi phục thuốc
 */
router.patch(
  "/medicines/:id/restore",
  authenticate,
  authorize(["ADMIN", "DUOCSI"]),
  auditLog('UPDATE', 'Medicine'),
  controller.restoreMedicine
);

export default router;
