import express from "express";
import * as controller from "../controllers/medicalService.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: MedicalService
 *   description: Danh mục dịch vụ khám bệnh
 */

/**
 * @swagger
 * /api/medical-services:
 *   get:
 *     summary: Lấy danh sách tất cả dịch vụ khám
 *     tags: [MedicalService]
 *     responses:
 *       200:
 *         description: Danh sách dịch vụ
 */
router.get("/", controller.getServices);

/**
 * @swagger
 * /api/medical-services/categories:
 *   get:
 *     summary: Lấy danh sách nhóm dịch vụ
 *     tags: [MedicalService]
 *     responses:
 *       200:
 *         description: Danh sách nhóm dịch vụ
 */
router.get("/categories", controller.getCategories);

export default router;
