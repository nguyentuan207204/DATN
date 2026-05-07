import express from "express";
import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware.js";
import * as controller from "../controllers/user.controller.js";

const router = express.Router();

// Quản lý người dùng & phân quyền
router.get("/", controller.getAll);

router.post(
  "/",
  authenticate,
  authorize(["ADMIN"]),
  controller.create
);

router.put(
  "/:id/role",
  authenticate,
  authorize(["ADMIN"]),
  controller.updateRole
);

export default router;

