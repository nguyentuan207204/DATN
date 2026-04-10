import express from "express";
import * as controller from "../controllers/pharmacy.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

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
  controller.importMedicine
);

/**
 * Xuất thuốc
 */
router.post(
  "/stock/export",
  authenticate,
  authorize(["ADMIN", "DUOCSI"]),
  controller.exportMedicine
);

/**
 * Xem lịch sử nhập xuất
 * ⚠️ Route cụ thể phải đặt TRƯỚC route động
 */
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

export default router;
