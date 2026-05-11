import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {
  createUser,
  findUserByUsername,
  updateUserPassword,
  createUnverifiedUser,
  verifyUserOtp,
  findUserById,
  updateUserProfile,
  getUserPasswordHashById,
  updateRefreshToken,
  findUserByRefreshToken,
  setForgotOtp,
  verifyResetOtp,
  clearUserOtp,
} from "../services/user.service.js";
import { sendOtpEmail, sendPasswordResetEmail } from "../services/email.service.js";




const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m"; 
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "refresh-dev-secret";
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";

const signAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      username: user.username,
      roleId: user.roleId,
      role: user.roleName,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

const signRefreshToken = (user) => {
  return jwt.sign(
    { userId: user.id },
    REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );
};

export const register = async (req, res, next) => {
  try {
    const { username, password, roleId, fullName, phone, email, gender, dob } = req.body;

    if (!username || !password || !roleId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu username, password hoặc roleId",
      });
    }

    const existing = await findUserByUsername(username);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Username đã tồn tại",
      });
    }

    const result = await createUser({ username, password, roleId, fullName, phone, email, gender, dob });

    return res.status(201).json({
      success: true,
      message: "Đăng ký tài khoản thành công",
      data: { userId: result.id, patientId: result.patientId },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Thiếu username hoặc password",
      });
    }

    const user = await findUserByUsername(username);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Sai username hoặc password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Sai username hoặc password",
      });
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    // Lưu Refresh Token vào Database
    await updateRefreshToken(user.id, refreshToken);

    return res.json({
      success: true,
      message: "Đăng nhập thành công",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        roleId: user.roleId,
        role: user.roleName,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Thiếu username",
      });
    }

    const existingUser = await findUserByUsername(username);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài khoản với username này",
      });
    }

    const user = await findUserById(existingUser.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin chi tiết tài khoản",
      });
    }

    if (!user.email) {
      return res.status(400).json({
        success: false,
        message: "Tài khoản này chưa được liên kết email. Không thể khôi phục mật khẩu.",
      });
    }

    // Tạo OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

    await setForgotOtp(user.id, otpCode, otpExpiresAt);

    // Gửi email
    console.log(`[Auth] Attempting to send OTP to ${user.email}`);
    const emailResult = await sendOtpEmail(user.email, otpCode, user.fullName || user.username);
    
    if (!emailResult.success) {
      console.error("[Auth] sendOtpEmail failed:", emailResult.error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống gửi email. Vui lòng thử lại sau.",
        error: process.env.NODE_ENV === 'development' ? emailResult.error : undefined
      });
    }

    return res.json({
      success: true,
      message: "Mã xác thực đã được gửi đến email của bạn.",
    });
  } catch (error) {
    console.error("[Auth] forgotPassword Critical Error:", error);
    // Đảm bảo luôn trả về JSON thay vì để server crash
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi hệ thống tại máy chủ.",
      error: error.message
    });
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { username, otp, newPassword } = req.body;

    if (!username || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc",
      });
    }

    const verifyResult = await verifyResetOtp(username, otp);

    if (!verifyResult.success) {
      return res.status(400).json({
        success: false,
        message: verifyResult.message,
      });
    }

    await updateUserPassword(verifyResult.userId, newPassword);
    await clearUserOtp(verifyResult.userId);

    return res.json({
      success: true,
      message: "Mật khẩu của bạn đã được cập nhật thành công",
    });
  } catch (error) {
    next(error);
  }
};

export const registerUnverified = async (req, res, next) => {
  try {
    const { username, password, roleId, fullName, phone, email, gender, dob } = req.body;

    if (!username || !password || !roleId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu username, password hoặc roleId",
      });
    }

    const existing = await findUserByUsername(username);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Username đã tồn tại",
      });
    }

    const result = await createUnverifiedUser({ username, password, roleId, fullName, phone, email, gender, dob });

    // Gửi OTP qua email nếu có địa chỉ email
    if (email) {
      try {
        await sendOtpEmail(email, result.otpCode, fullName || username);
      } catch (emailErr) {
        // Không fail toàn bộ request nếu email lỗi — log để debug
        console.error("[Auth] Gửi email OTP thất bại:", emailErr.message);
      }
    }

    return res.status(201).json({
      success: true,
      message: email
        ? "Đăng ký thành công. Mã OTP đã được gửi đến email của bạn."
        : "Đăng ký bước 1 thành công. Vui lòng xác thực OTP.",
      data: { 
        userId: result.userId, 
        patientId: result.patientId,
        // Chỉ trả OTP trong môi trường dev để tiện test
        ...(process.env.NODE_ENV !== "production" && { otp: result.otpCode })
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    const { username, otp } = req.body;

    if (!username || !otp) {
      return res.status(400).json({
        success: false,
        message: "Thiếu username hoặc otp",
      });
    }

    const result = await verifyUserOtp(username, otp);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    return res.json({
      success: true,
      message: "Xác thực OTP thành công. Tài khoản đã được kích hoạt.",
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await findUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin người dùng",
      });
    }

    return res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cập nhật thông tin hồ sơ người dùng hiện tại
 */
export const updateMe = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await updateUserProfile(userId, req.body);
    return res.json({ 
      success: true, 
      message: result.message 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Đổi mật khẩu người dùng hiện tại
 */
export const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Thiếu mật khẩu cũ hoặc mật khẩu mới",
      });
    }

    // Kiểm tra mật khẩu cũ
    const currentHash = await getUserPasswordHashById(userId);
    if (!currentHash) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài khoản người dùng",
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, currentHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Mật khẩu cũ không chính xác",
      });
    }

    // Cập nhật mật khẩu mới (hàm này đã có sẵn logic băm mật khẩu nội bộ)
    await updateUserPassword(userId, newPassword);

    return res.json({
      success: true,
      message: "Đổi mật khẩu thành công",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cấp mới Access Token bằng Refresh Token
 */
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Thiếu Refresh Token",
      });
    }

    // 1. Kiểm tra tính hợp lệ của JWT
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Refresh Token không hợp lệ hoặc đã hết hạn",
      });
    }

    // 2. Kiểm tra trong Database xem token này có thuộc về user này không
    const user = await findUserByRefreshToken(refreshToken);
    if (!user || user.id !== decoded.userId) {
      return res.status(401).json({
        success: false,
        message: "Refresh Token không tồn tại hoặc không khớp",
      });
    }

    // 3. Cấp Access Token mới
    const newAccessToken = signAccessToken(user);
    
    // Rotate Refresh Token
    const newRefreshToken = signRefreshToken(user);
    await updateRefreshToken(user.id, newRefreshToken);

    return res.json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logic tạm thời để reset mật khẩu admin phục vụ việc debug đăng nhập
 * Sẽ được gỡ bỏ sau khi hoàn thành.
 */
export const resetAdminPassword = async (req, res, next) => {
  try {
    const adminUsername = "admin";
    const defaultPassword = "123456";
    const adminRoleId = 1; // Giả định roleId 1 là ADMIN

    const user = await findUserByUsername(adminUsername);
    
    if (user) {
      await updateUserPassword(user.id, defaultPassword);
      return res.json({
        success: true,
        message: "Đã cập nhật mật khẩu cho user 'admin' thành '123456'",
      });
    } else {
      await createUser({
        username: adminUsername,
        password: defaultPassword,
        roleId: adminRoleId,
        fullName: "Administrator",
        email: "admin@clinic.com",
        phone: "0000000000",
        gender: "NAM",
        dob: "1990-01-01"
      });
      return res.json({
        success: true,
        message: "Đã tạo mới user 'admin' với mật khẩu '123456' và roleId=1",
      });
    }
  } catch (error) {
    next(error);
  }
};
