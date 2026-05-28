import express from "express";
import * as controller from "../controllers/news.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", controller.getAll);
router.get("/:id", controller.getOne);

router.post("/", authenticate, authorize(["ADMIN"]), controller.create);
router.put("/:id", authenticate, authorize(["ADMIN"]), controller.update);
router.delete("/:id", authenticate, authorize(["ADMIN"]), controller.remove);

export default router;

