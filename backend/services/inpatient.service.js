import pool from "../config/db.js";
import { nowVN, fromVNDateString } from "../utils/dateHelper.js";

/* =====================================================
   NỘI TRÚ – NHẬP VIỆN / RA VIỆN
===================================================== */

export const admitPatient = async ({ patientId, bedId, admittedAt }) => {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // Kiểm tra giường đang có bệnh nhân hay không
    const [active] = await conn.query(
      `
      SELECT id
      FROM Admission
      WHERE bedId = ? AND dischargedAt IS NULL
      FOR UPDATE
      `,
      [bedId]
    );

    if (active.length > 0) {
      throw new Error("Giường đang được sử dụng");
    }

    // Tạo bản ghi nhập viện
    const [result] = await conn.query(
      `
      INSERT INTO Admission (patientId, bedId, admittedAt)
      VALUES (?, ?, ?)
      `,
      [patientId, bedId, admittedAt ? admittedAt : nowVN()]
    );

    await conn.commit();

    return {
      admissionId: result.insertId,
    };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

export const dischargePatient = async ({ admissionId, dischargedAt }) => {
  const [rows] = await pool.query(
    `
    SELECT id, dischargedAt
    FROM Admission
    WHERE id = ?
    `,
    [admissionId]
  );

  if (rows.length === 0) {
    throw new Error("Không tìm thấy hồ sơ nội trú");
  }

  if (rows[0].dischargedAt) {
    throw new Error("Bệnh nhân đã ra viện");
  }

  await pool.query(
    `
    UPDATE Admission
    SET dischargedAt = ?
    WHERE id = ?
    `,
    [dischargedAt ? dischargedAt : nowVN(), admissionId]
  );

  return { message: "Cập nhật ra viện thành công" };
};

export const getActiveAdmissions = async () => {
  const [rows] = await pool.query(
    `
    SELECT 
      a.id,
      a.patientId,
      p.fullName AS patientName,
      a.bedId,
      b.bedCode,
      a.admittedAt
    FROM Admission a
    JOIN Patient p ON a.patientId = p.id
    JOIN Bed b ON a.bedId = b.id
    WHERE a.dischargedAt IS NULL
    ORDER BY a.admittedAt DESC
    `
  );

  return rows;
};

export const getAllAdmissions = async () => {
  const [rows] = await pool.query(
    `
    SELECT 
      a.*,
      p.fullName AS patientName,
      b.bedCode
    FROM Admission a
    JOIN Patient p ON a.patientId = p.id
    JOIN Bed b ON a.bedId = b.id
    ORDER BY a.admittedAt DESC
    `
  );

  return rows;
};


export const getAdmissionsByPatient = async (patientId) => {
  const [rows] = await pool.query(
    `
    SELECT 
      a.*,
      b.bedCode
    FROM Admission a
    JOIN Bed b ON a.bedId = b.id
    WHERE a.patientId = ?
    ORDER BY a.admittedAt DESC
    `,
    [patientId]
  );

  return rows;
};

export const getAdmissionProgress = async (admissionId) => {
  // Thông tin chính của đợt điều trị nội trú
  const [admissionRows] = await pool.query(
    `
    SELECT 
      a.*,
      p.fullName AS patientName,
      b.bedCode
    FROM Admission a
    JOIN Patient p ON a.patientId = p.id
    JOIN Bed b ON a.bedId = b.id
    WHERE a.id = ?
    `,
    [admissionId]
  );

  if (admissionRows.length === 0) {
    throw new Error("Không tìm thấy hồ sơ nội trú");
  }

  const admission = admissionRows[0];

  // dateStrings=true nên mysql2 trả về chuỗi — dùng fromVNDateString() để parse đúng UTC+7
  const endDate   = admission.dischargedAt ? fromVNDateString(admission.dischargedAt) : new Date();
  const startDate = fromVNDateString(admission.admittedAt);

  const daysInHospital = Math.max(
    1,
    Math.ceil(
      (endDate.getTime() - startDate.getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );

  // Các lần khám (MedicalRecord) trong thời gian nội trú
  const [visitEvents] = await pool.query(
    `
    SELECT 
      mr.id AS recordId,
      mr.visitDate AS eventDate,
      'VISIT' AS eventType,
      s.fullName AS doctorName
    FROM MedicalRecord mr
    JOIN Staff s ON mr.doctorId = s.id
    WHERE mr.patientId = ?
      AND mr.visitDate BETWEEN ? AND ?
    ORDER BY mr.visitDate ASC
    `,
    [admission.patientId, startDate, endDate]
  );

  // Các ca phẫu thuật trong thời gian nội trú
  const [surgeryEvents] = await pool.query(
    `
    SELECT
      surg.id AS surgeryId,
      surg.date AS eventDate,
      'SURGERY' AS eventType,
      surg.name AS surgeryName,
      s.fullName AS surgeonName
    FROM Surgery surg
    JOIN Staff s ON surg.surgeonId = s.id
    JOIN MedicalRecord mr ON surg.recordId = mr.id
    WHERE mr.patientId = ?
      AND surg.date BETWEEN ? AND ?
    ORDER BY surg.date ASC
    `,
    [admission.patientId, startDate, endDate]
  );

  const events = [...visitEvents, ...surgeryEvents].sort(
    (a, b) => new Date(a.eventDate) - new Date(b.eventDate)
  );

  return {
    admission,
    daysInHospital,
    events,
  };
};


