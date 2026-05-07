import express from "express";
import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware.js";
import * as controller from "../controllers/department.controller.js";

const router = express.Router();

// Quản lý phòng ban, khoa phòng
router.get("/", controller.getAll);

router.post(
  "/",
  authenticate,
  authorize(["ADMIN"]),
  controller.create
);

router.put(
  "/:id",
  authenticate,
  authorize(["ADMIN"]),
  controller.update
);

router.delete(
  "/:id",
  authenticate,
  authorize(["ADMIN"]),
  controller.remove
);

export default router;

