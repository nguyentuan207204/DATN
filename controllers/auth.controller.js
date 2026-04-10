import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {
  createUser,
  findUserByUsername,
  updateUserPassword,
  createUnverifiedUser,
  verifyUserOtp,
} from "../services/user.service.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const JWT_EXPIRES_IN = "1d";

const signToken = (user) => {
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

    const token = signToken(user);

    return res.json({
      success: true,
      message: "Đăng nhập thành công",
      token,
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
    const { username, newPassword } = req.body;

    if (!username || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Thiếu username hoặc newPassword",
      });
    }

    const user = await findUserByUsername(username);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài khoản",
      });
    }

    await updateUserPassword(user.id, newPassword);

    return res.json({
      success: true,
      message: "Cập nhật mật khẩu mới thành công",
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

    return res.status(201).json({
      success: true,
      message: "Đăng ký bước 1 thành công. Vui lòng xác thực OTP.",
      data: { userId: result.userId, patientId: result.patientId, otp: result.otpCode },
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
