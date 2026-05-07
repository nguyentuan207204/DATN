import express from "express";
import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware.js";
import * as controller from "../controllers/staff.controller.js";

const router = express.Router();

// Quản lý bác sĩ, y tá, nhân viên
router.get("/", controller.getAll);

router.get("/:id", controller.getOne);

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

