import express from "express";
import * as controller from "../controllers/medicalService.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: MedicalService
 *   description: Danh mục dịch vụ khám bệnh
 */

// ==========================================
// ROUTES CHO DỊCH VỤ (SERVICES)
// ==========================================

/**
 * @swagger
 * /api/medical-services:
 *   get:
 *     summary: Lấy danh sách dịch vụ (có phân trang)
 *     tags: [MedicalService]
 */
router.get("/", controller.getServices);

/**
 * @swagger
 * /api/medical-services:
 *   post:
 *     summary: Thêm dịch vụ mới
 *     tags: [MedicalService]
 */
router.post("/", controller.createService);

/**
 * @swagger
 * /api/medical-services/{id}:
 *   put:
 *     summary: Cập nhật dịch vụ
 *     tags: [MedicalService]
 */
router.put("/:id", controller.updateService);

/**
 * @swagger
 * /api/medical-services/{id}:
 *   delete:
 *     summary: Xóa dịch vụ
 *     tags: [MedicalService]
 */
router.delete("/:id", controller.deleteService);

// ==========================================
// ROUTES CHO NHÓM DỊCH VỤ (CATEGORIES)
// ==========================================

/**
 * @swagger
 * /api/medical-services/categories:
 *   get:
 *     summary: Lấy danh sách nhóm dịch vụ
 *     tags: [MedicalService]
 */
router.get("/categories", controller.getCategories);

/**
 * @swagger
 * /api/medical-services/categories:
 *   post:
 *     summary: Thêm nhóm dịch vụ mới
 *     tags: [MedicalService]
 */
router.post("/categories", controller.createCategory);

/**
 * @swagger
 * /api/medical-services/categories/{id}:
 *   put:
 *     summary: Cập nhật nhóm dịch vụ
 *     tags: [MedicalService]
 */
router.put("/categories/:id", controller.updateCategory);

/**
 * @swagger
 * /api/medical-services/categories/{id}:
 *   delete:
 *     summary: Xóa nhóm dịch vụ
 *     tags: [MedicalService]
 */
router.delete("/categories/:id", controller.deleteCategory);

export default router;
