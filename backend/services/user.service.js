import pool from "../config/db.js";
import bcrypt from "bcryptjs";

export const createUser = async ({ username, password, roleId, fullName, phone, email, gender, dob }) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const passwordHash = await bcrypt.hash(password, 10);

    // Tạo bản ghi User
    const [userResult] = await connection.query(
      `INSERT INTO User (username, passwordHash, roleId, createdAt) VALUES (?, ?, ?, NOW())`,
      [username, passwordHash, roleId]
    );
    const userId = userResult.insertId;

    // Kiểm tra roleId 3 (Bệnh nhân) để tạo thêm bản ghi Patient
    let patientId = null;
    if (Number(roleId) === 3) {
      // Chuẩn hóa giới tính thành HOA để khớp ENUM trong DB
      const validGenders = ["NAM", "NU", "KHAC"];
      const normalizedGender = gender && validGenders.includes(gender.toUpperCase())
        ? gender.toUpperCase()
        : "NAM";

      // Chuẩn hóa ngày sinh: hỗ trợ cả yyyy-mm-dd và dd/mm/yyyy
      let formattedDob = null;
      if (dob) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
          formattedDob = dob; // Đã đúng định dạng
        } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(dob)) {
          const [d, m, y] = dob.split('/');
          formattedDob = `${y}-${m}-${d}`;
        }
      }

      const [patientResult] = await connection.query(
        `INSERT INTO Patient (fullName, dateOfBirth, gender, phone, email, userId) VALUES (?, ?, ?, ?, ?, ?)`,
        [fullName || "Bệnh nhân mới", formattedDob || null, normalizedGender, phone || null, email || null, userId]
      );
      patientId = patientResult.insertId;
    }

    await connection.commit();
    return { id: userId, patientId };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const getAllUsers = async () => {
  const [rows] = await pool.query(
    `SELECT 
      u.id, 
      u.username, 
      u.roleId, 
      r.name AS roleName, 
      u.isLocked, 
      u.createdAt,
      COALESCE(p.fullName, s.fullName) AS fullName,
      p.phone
     FROM User u
     JOIN Role r ON u.roleId = r.id
     LEFT JOIN Patient p ON u.id = p.userId
     LEFT JOIN Staff s ON u.id = s.userId
     ORDER BY u.id DESC`
  );
  return rows;
};

export const updateUserRole = async (userId, roleId) => {
  await pool.query(`UPDATE User SET roleId = ? WHERE id = ?`, [roleId, userId]);
  return { message: "Role updated" };
};

export const deleteUserById = async (userId) => {
    // Note: In a real system, you might want to handle cascading deletes or soft deletes
    await pool.query(`DELETE FROM User WHERE id = ?`, [userId]);
    return { message: "User deleted" };
};

export const toggleUserLock = async (userId, isLocked) => {
    await pool.query(`UPDATE User SET isLocked = ? WHERE id = ?`, [isLocked ? 1 : 0, userId]);
    return { message: isLocked ? "User locked" : "User unlocked" };
};

export const getAllRoles = async () => {
    const [rows] = await pool.query(`SELECT * FROM Role`);
    return rows;
};

export const createUnverifiedUser = async ({ username, password, roleId, fullName, phone, email, gender, dob }) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const passwordHash = await bcrypt.hash(password, 10);
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const [userResult] = await connection.query(
      `INSERT INTO User (username, passwordHash, roleId, isLocked, otp_code, otp_expires_at, createdAt) 
       VALUES (?, ?, ?, 1, ?, ?, NOW())`,
      [username, passwordHash, roleId, otpCode, otpExpiresAt]
    );
    const userId = userResult.insertId;

    let patientId = null;
    if (Number(roleId) === 5) { // Assuming 5 is Patient role in this system
      const [patientResult] = await connection.query(
        `INSERT INTO Patient (fullName, phone, email, userId) VALUES (?, ?, ?, ?)`,
        [fullName || "Patient", phone || null, email || null, userId]
      );
      patientId = patientResult.insertId;
    }

    await connection.commit();
    return { userId, patientId, otpCode };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const verifyUserOtp = async (username, otp) => {
  const [users] = await pool.query(
    `SELECT * FROM User WHERE username = ? AND otp_code = ? AND otp_expires_at > NOW()`,
    [username, otp]
  );

  if (users.length === 0) {
    return { success: false, message: "Mã OTP không chính xác hoặc đã hết hạn" };
  }

  await pool.query(
    `UPDATE User SET isLocked = 0, otp_code = NULL, otp_expires_at = NULL WHERE id = ?`,
    [users[0].id]
  );

  return { success: true };
};

export const setForgotOtp = async (userId, otpCode, expiresAt) => {
  await pool.query(
    `UPDATE User SET otp_code = ?, otp_expires_at = ? WHERE id = ?`,
    [otpCode, expiresAt, userId]
  );
  return { success: true };
};

export const verifyResetOtp = async (username, otp) => {
  const [users] = await pool.query(
    `SELECT * FROM User WHERE username = ? AND otp_code = ? AND otp_expires_at > NOW()`,
    [username, otp]
  );

  if (users.length === 0) {
    return { success: false, message: "Mã xác thực không chính xác hoặc đã hết hạn" };
  }

  return { success: true, userId: users[0].id };
};

export const clearUserOtp = async (userId) => {
  await pool.query(
    `UPDATE User SET otp_code = NULL, otp_expires_at = NULL WHERE id = ?`,
    [userId]
  );
  return { success: true };
};

export const findUserByUsername = async (username) => {
  const [rows] = await pool.query(
    `SELECT u.*, r.name AS roleName
     FROM User u
     JOIN Role r ON u.roleId = r.id
     WHERE u.username = ?`,
    [username]
  );
  return rows[0];
};

export const updateUserPassword = async (userId, newPassword) => {
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await pool.query(`UPDATE User SET passwordHash = ? WHERE id = ?`, [passwordHash, userId]);
  return { message: "Password updated" };
};

export const findUserById = async (userId) => {
  const [rows] = await pool.query(
    `SELECT u.id, u.username, u.roleId, r.name AS roleName, u.isLocked, u.createdAt,
            p.id AS patientId, p.fullName, p.phone, p.email, p.gender, p.dateOfBirth, p.address
     FROM User u
     JOIN Role r ON u.roleId = r.id
     LEFT JOIN Patient p ON u.id = p.userId
     WHERE u.id = ?`,
    [userId]
  );
  return rows[0];
};


export const updateUserProfile = async (userId, data) => {
  const { fullName, phone, email, gender, dateOfBirth, address } = data;

  // Chuẩn hóa ngày sinh
  let formattedDob = null;
  if (dateOfBirth) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
      formattedDob = dateOfBirth;
    } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateOfBirth)) {
      const [d, m, y] = dateOfBirth.split('/');
      formattedDob = `${y}-${m}-${d}`;
    } else {
      const d = new Date(dateOfBirth);
      if (!isNaN(d.getTime())) {
        formattedDob = d.toISOString().split('T')[0];
      }
    }
  }

  const [patients] = await pool.query(`SELECT id FROM Patient WHERE userId = ?`, [userId]);

  if (patients.length === 0) {
    // Nếu chưa có bản ghi Patient (ví dụ Admin), tạo mới
    await pool.query(
      `INSERT INTO Patient (fullName, phone, email, gender, dateOfBirth, address, userId) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [fullName || null, phone || null, email || null, gender || 'NAM', formattedDob, address || null, userId]
    );
  } else {
    // Cập nhật bản ghi hiện tại
    await pool.query(
      `UPDATE Patient 
       SET fullName = ?, phone = ?, email = ?, gender = ?, dateOfBirth = ?, address = ?
       WHERE userId = ?`,
      [fullName || null, phone || null, email || null, gender || 'NAM', formattedDob, address || null, userId]
    );
  }

  return { message: "Cập nhật hồ sơ thành công" };
};

export const getUserPasswordHashById = async (userId) => {
  const [rows] = await pool.query(`SELECT passwordHash FROM User WHERE id = ?`, [userId]);
  return rows[0] ? rows[0].passwordHash : null;
};

export const updateRefreshToken = async (userId, refreshToken) => {
  await pool.query(`UPDATE User SET refreshToken = ? WHERE id = ?`, [refreshToken, userId]);
  return { success: true };
};

export const findUserByRefreshToken = async (refreshToken) => {
  const [rows] = await pool.query(
    `SELECT u.*, r.name AS roleName
     FROM User u
     JOIN Role r ON u.roleId = r.id
     WHERE u.refreshToken = ?`,
    [refreshToken]
  );
  return rows[0];
};




