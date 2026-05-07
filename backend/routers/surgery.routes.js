import express from "express";
import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware.js";
import * as controller from "../controllers/surgery.controller.js";

const router = express.Router();

// Tạo phẫu thuật / thủ thuật
router.post(
  "/",
  authenticate,
  authorize(["BACSI", "ADMIN"]),
  controller.create
);

// Danh sách tất cả phẫu thuật / thủ thuật
router.get("/", controller.getAll);

// Danh sách phẫu thuật / thủ thuật theo hồ sơ bệnh án
router.get("/record/:recordId", controller.getByRecord);

export default router;

