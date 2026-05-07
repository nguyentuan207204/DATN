import express from "express";
import { login, register, forgotPassword, registerUnverified, verifyOtp } from "../controllers/auth.controller.js";

const router = express.Router();

// Đăng ký tài khoản (chưa xác thực, cần OTP)
router.post("/register-unverified", registerUnverified);

// Xác thực OTP
router.post("/verify-otp", verifyOtp);

// Đăng ký tài khoản mới (trực tiếp - skip OTP nếu cần cấu hình lại sau)
router.post("/register", register);

// Đăng nhập
router.post("/login", login);

// Quên mật khẩu (đặt lại mật khẩu mới)
router.post("/forgot-password", forgotPassword);

export default router;

