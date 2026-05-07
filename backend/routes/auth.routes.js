import express from "express";
import { login, register, forgotPassword, resetPassword, registerUnverified, verifyOtp, getMe, updateMe, changePassword, refreshToken, resetAdminPassword } from "../controllers/auth.controller.js";


import { authenticate } from "../middleware/auth.middleware.js";


const router = express.Router();

// Route tạm thời để reset admin (Dùng để debug 401)
router.get("/reset-admin", resetAdminPassword);

// Đăng ký tài khoản (chưa xác thực, cần OTP)
router.post("/register-unverified", registerUnverified);

// Xác thực OTP
router.post("/verify-otp", verifyOtp);

// Đăng ký tài khoản mới (trực tiếp - skip OTP nếu cần cấu hình lại sau)
router.post("/register", register);

// Đăng nhập
router.post("/login", login);

// Làm mới token
router.post("/refresh-token", refreshToken);

// Quên mật khẩu (Bước 1: gửi OTP)
router.post("/forgot-password", forgotPassword);

// Đặt lại mật khẩu (Bước 2: dùng OTP)
router.post("/reset-password", resetPassword);

// Lấy thông tin người dùng hiện tại
router.get("/me", authenticate, getMe);

// Cập nhật thông tin hồ sơ người dùng
router.put("/me", authenticate, updateMe);

// Đổi mật khẩu
router.post("/change-password", authenticate, changePassword);




export default router;

