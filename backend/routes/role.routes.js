import express from "express";
import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware.js";
import * as controller from "../controllers/role.controller.js";

const router = express.Router();

// Phân quyền: danh sách và tạo role
router.get("/", controller.getAll);

router.post(
  "/",
  authenticate,
  authorize(["ADMIN"]),
  controller.create
);

export default router;

